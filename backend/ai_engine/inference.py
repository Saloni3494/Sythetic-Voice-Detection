import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import librosa
import os

# --- 1. CONFIGURATION ---
TARGET_SR = 16000
HOP_MS = 10.0
WIN_MS = 20.0
N_FFT = 512
N_MELS = 80
BASE_CHANNELS = 32
EMBED_DIM = 128
DROPOUT = 0.2
DEFAULT_FEATURES = ('logmel',)
RESOLUTIONS_MS = (20, 40, 80, 160, 320, 640)

HOP = int(round(TARGET_SR * HOP_MS / 1000))
WIN = int(round(TARGET_SR * WIN_MS / 1000))

# --- 2. PREPROCESSING FUNCTIONS ---
def safe_log(x, eps=1e-7):
    return np.log(np.maximum(x, eps)).astype(np.float32)

def feature_logmel(y, sr):
    S = librosa.feature.melspectrogram(
        y=y, sr=sr,
        n_fft=N_FFT,
        hop_length=HOP,
        win_length=WIN,
        n_mels=N_MELS,
        fmin=20,
        fmax=sr/2,
        power=2.0
    )
    return safe_log(S)

def linear_filterbank(sr, n_fft, n_filters):
    freqs = np.linspace(0, sr/2, n_fft//2 + 1)
    edges = np.linspace(0, sr/2, n_filters + 2)
    fb = np.zeros((n_filters, len(freqs)), dtype=np.float32)

    for i in range(n_filters):
        l, c, r = edges[i], edges[i+1], edges[i+2]
        m1 = (freqs >= l) & (freqs <= c)
        m2 = (freqs >= c) & (freqs <= r)
        if c > l:
            fb[i,m1] = (freqs[m1]-l)/(c-l)
        if r > c:
            fb[i,m2] = (r-freqs[m2])/(r-c)

    return fb

def feature_lfcc(y, sr):
    D = np.abs(librosa.stft(
        y,
        n_fft=N_FFT,
        hop_length=HOP,
        win_length=WIN,
        window="hann"
    ))**2

    fb = linear_filterbank(sr, N_FFT, LFCC_FILTERS)
    E = np.maximum(fb @ D, 1e-8)
    logE = np.log(E)

    n = LFCC_COEFFS
    N = LFCC_FILTERS
    k = np.arange(n)[:,None]
    m = np.arange(N)[None,:]
    basis = np.cos(np.pi/N * (m+0.5)*k)

    return (basis @ logE).astype(np.float32)

def feature_cqt(y, sr):
    C = np.abs(librosa.cqt(
        y,
        sr=sr,
        hop_length=HOP,
        fmin=CQT_FMIN,
        bins_per_octave=CQT_BINS_PER_OCTAVE,
        n_bins=CQT_N_BINS
    ))
    return safe_log(C)


def extract_features(audio_path):
    y, sr = librosa.load(audio_path, sr=TARGET_SR, mono=True)
    feat = feature_logmel(y, sr)
    feat = normalize_feature(feat)
    tensor_feat = torch.from_numpy(feat).unsqueeze(0).unsqueeze(0)
    return {'logmel': tensor_feat}

# --- 3. MODEL ARCHITECTURE ---
class SEBlock(nn.Module):
    def __init__(self, channels, reduction=8):
        super().__init__()
        hidden = max(channels // reduction, 4)
        self.net = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Conv2d(channels, hidden, 1),
            nn.GELU(),
            nn.Conv2d(hidden, channels, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        return x * self.net(x)


class ConvTimeBlock(nn.Module):
    def __init__(self, in_ch, out_ch, dropout=0.1):
        super().__init__()

        self.conv = nn.Conv2d(
            in_ch, out_ch,
            kernel_size=3,
            stride=(2,1),
            padding=1,
            bias=False
        )
        self.bn = nn.BatchNorm2d(out_ch)
        self.se = SEBlock(out_ch)
        self.act = nn.GELU()
        self.drop = nn.Dropout2d(dropout)

    def forward(self, x):
        x = self.conv(x)
        x = self.bn(x)
        x = self.act(x)
        x = self.se(x)
        x = self.drop(x)
        return x


class ViewEncoder(nn.Module):
    def __init__(self, out_dim=128, base=32):
        super().__init__()

        self.blocks = nn.Sequential(
            ConvTimeBlock(1, base),
            ConvTimeBlock(base, base*2),
            ConvTimeBlock(base*2, base*4),
            ConvTimeBlock(base*4, base*4),
        )

        self.proj = nn.Conv1d(base*4, out_dim, 1)

    def forward(self, x):
        # x = B,1,F,T
        z = self.blocks(x)

        # Collapse frequency only.
        z = z.mean(dim=2)

        # B,D,T
        return self.proj(z)


class TCNBlock(nn.Module):
    def __init__(self, dim, dilation, dropout=0.1):
        super().__init__()

        self.conv1 = nn.Conv1d(
            dim, dim, 3,
            padding=dilation,
            dilation=dilation
        )
        self.bn1 = nn.BatchNorm1d(dim)

        self.conv2 = nn.Conv1d(
            dim, dim, 3,
            padding=dilation,
            dilation=dilation
        )
        self.bn2 = nn.BatchNorm1d(dim)

        self.drop = nn.Dropout(dropout)

    def forward(self, x):
        residual = x

        x = self.conv1(x)
        x = self.bn1(x)
        x = F.gelu(x)
        x = self.drop(x)

        x = self.conv2(x)
        x = self.bn2(x)
        x = F.gelu(x)
        x = self.drop(x)

        return x + residual


class TemporalBackbone(nn.Module):
    def __init__(self, dim=128):
        super().__init__()

        self.net = nn.Sequential(
            TCNBlock(dim, 1),
            TCNBlock(dim, 2),
            TCNBlock(dim, 4),
            TCNBlock(dim, 8),
        )

    def forward(self, x):
        return self.net(x)

# ============================================================
# 21. FULL MULTI-VIEW / MULTI-RESOLUTION MODEL
# ============================================================
SCALE_MAP = {
    20: 2,
    40: 4,
    80: 8,
    160: 16,
    320: 32,
    640: 64,
}

class PartialSpoofCNN(nn.Module):
    def __init__(
        self,
        feature_names=("logmel",),
        embed_dim=128,
        base=32,
        dropout=0.2,
    ):
        super().__init__()

        self.feature_names = tuple(feature_names)

        self.encoders = nn.ModuleDict({
            name: ViewEncoder(embed_dim, base)
            for name in self.feature_names
        })

        self.fusion = nn.Sequential(
            nn.Conv1d(
                embed_dim * len(self.feature_names),
                embed_dim,
                kernel_size=1
            ),
            nn.BatchNorm1d(embed_dim),
            nn.GELU(),
            nn.Dropout(dropout)
        )

        self.temporal = TemporalBackbone(embed_dim)

        self.utterance_head = nn.Sequential(
            nn.AdaptiveAvgPool1d(1),
            nn.Flatten(),
            nn.Linear(embed_dim, 1)
        )

        self.segment_heads = nn.ModuleDict({
            str(ms): nn.Conv1d(
                embed_dim, 1,
                kernel_size=3,
                padding=1
            )
            for ms in SCALE_MAP
        })

    def encode_views(self, xdict):
        encoded = []

        for name in self.feature_names:
            encoded.append(self.encoders[name](xdict[name]))

        # Explicit temporal alignment.
        T = min(z.shape[-1] for z in encoded)
        encoded = [z[..., :T] for z in encoded]

        return self.fusion(torch.cat(encoded, dim=1))

    def forward(self, xdict, return_segments=True):
        z = self.encode_views(xdict)
        z = self.temporal(z)

        out = {
            "features": z,
            "utt": self.utterance_head(z).squeeze(-1),
        }

        if return_segments:
            seg = {}

            for ms, scale in SCALE_MAP.items():
                usable = (z.shape[-1] // scale) * scale

                if usable == 0:
                    continue

                zz = z[..., :usable]

                # Native temporal grouping.
                pooled = zz.reshape(
                    z.shape[0],
                    z.shape[1],
                    -1,
                    scale
                ).mean(dim=-1)

                seg[ms] = self.segment_heads[str(ms)](pooled).squeeze(1)

            out["seg"] = seg

        return out


if __name__ == '__main__':
    DEVICE = 'cpu'
    def count_parameters(model):
        return sum(
            p.numel()
            for p in model.parameters()
            if p.requires_grad
        )


    model = PartialSpoofCNN(
        feature_names=DEFAULT_FEATURES,
        embed_dim=EMBED_DIM,
        base=BASE_CHANNELS,
        dropout=DROPOUT,
    ).to(DEVICE)

    print(f"Trainable parameters: {count_parameters(model):,}")

    # Small forward-pass test
    model.eval()

    test_batch = next(iter(dev_loader))
    x = move_views(test_batch)

    with torch.no_grad():
        outputs = model(x, return_segments=False)

    print("Output keys:", outputs.keys())
    print("Utterance logits shape:", outputs["utt"].shape)
    print("Utterance logits:", outputs["utt"])

    crop_frames = None

    dev_loader = build_loader(
        dev_manifest,
        "dev",
        DEFAULT_FEATURES,
        training=False,
        crop_frames=None
    )

    print("Dev loader created.")
    print("Number of batches:", len(dev_loader))

    # ============================================================
    # 22. MODEL SHAPE DEBUG
    # ============================================================
    model.eval()

    dummy = {
        "logmel": torch.randn(
            2, 1, N_MELS, 320,
            device=DEVICE
        )
    }

    with torch.no_grad():
        out = model(dummy, return_segments=True)

    print("utterance:", tuple(out["utt"].shape))

    for ms, x in out["seg"].items():
        print(f"{ms} ms:", tuple(x.shape))

    assert out["utt"].shape == (2,)
    assert all(x.ndim == 2 for x in out["seg"].values())
    assert torch.isfinite(out["utt"]).all()
    assert all(torch.isfinite(x).all() for x in out["seg"].values())

    print("PASS: model forward shape test.")

    # Full DEV inference test — no training
    y_test, scores_test, ids_test = predict_utterance(model, dev_loader)

    print("DEV inference completed.")
    print("Labels shape:", y_test.shape)
    print("Scores shape:", scores_test.shape)
    print("IDs:", len(ids_test))
    print("Scores finite:", np.isfinite(scores_test).all())
    print("Score range:", scores_test.min(), "to", scores_test.max())

    # ============================================================
    # 23. BACKWARD / GRADIENT DEBUG
    # ============================================================
    model.train()

    out = model(dummy, return_segments=True)

    debug_loss = out["utt"].mean()
    for x in out["seg"].values():
        debug_loss = debug_loss + 0.1 * x.mean()

    debug_loss.backward()

    grad_norm = torch.nn.utils.clip_grad_norm_(
        model.parameters(),
        max_norm=1e9
    )

    print("debug loss:", float(debug_loss))
    print("gradient norm:", float(grad_norm))

    assert math.isfinite(float(debug_loss))
    assert math.isfinite(float(grad_norm))

    model.zero_grad(set_to_none=True)

    print("PASS: backward + gradient test.")

    y_test, scores_test, ids_test = predict_utterance(model, dev_loader)

    print("DEV inference completed.")
    print("Labels shape:", y_test.shape)
    print("Scores shape:", scores_test.shape)
    print("IDs:", len(ids_test))
    print("Scores finite:", np.isfinite(scores_test).all())
    print("Score range:", scores_test.min(), "to", scores_test.max())

    # ============================================================
    # 24. FAST DATASET
    # ============================================================

def normalize_feature(x):
    x = np.asarray(x, dtype=np.float32)

    # Fixed per-file normalization.
    # Replace with train-only global statistics if the audit/ablation
    # establishes that this is preferable.
    x = (x - x.mean()) / (x.std() + 1e-6)

    return x.astype(np.float32)

# --- 4. INFERENCE API ---
def load_model(weights_path, device='cpu'):
    model = PartialSpoofCNN(
        feature_names=DEFAULT_FEATURES,
        base=BASE_CHANNELS,
        embed_dim=EMBED_DIM,
        dropout=DROPOUT,

    )
    state_dict = torch.load(weights_path, map_location=device)
    if 'model_state' in state_dict:
        state_dict = state_dict['model_state']
    elif 'model_state_dict' in state_dict:
        state_dict = state_dict['model_state_dict']
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    return model

def predict(audio_path, weights_path):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = load_model(weights_path, device)
    features = extract_features(audio_path)
    
    for k in features:
        features[k] = features[k].to(device)
        
    with torch.no_grad():
        utt_logits = model(features, return_segments=False)["utt"]
        
    prob_bonafide = torch.sigmoid(utt_logits).item()
    spoof_probability = 1.0 - prob_bonafide
    is_spoof = spoof_probability > 0.5
    return is_spoof, spoof_probability
