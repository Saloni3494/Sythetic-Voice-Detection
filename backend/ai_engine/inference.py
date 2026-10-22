import os
import json
from pathlib import Path
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import librosa

# --- 1. DYNAMIC CONFIGURATION ---
CONFIG_PATH = Path(__file__).parent / "weights" / "config.json"
if CONFIG_PATH.exists():
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            CFG = json.load(f)
    except Exception:
        CFG = {}
else:
    CFG = {}

TARGET_SR = CFG.get("TARGET_SR", 16000)
HOP_MS = CFG.get("HOP_MS", 10.0)
WIN_MS = CFG.get("WIN_MS", 20.0)
N_FFT = CFG.get("N_FFT", 512)
N_MELS = CFG.get("N_MELS", 80)
BASE_CHANNELS = CFG.get("BASE_CHANNELS", 32)
EMBED_DIM = CFG.get("EMBED_DIM", 128)
DROPOUT = CFG.get("DROPOUT", 0.2)
DEFAULT_FEATURES = tuple(CFG.get("feature_names", CFG.get("DEFAULT_FEATURES", ["logmel"])))
RESOLUTIONS_MS = tuple(CFG.get("RESOLUTIONS_MS", [20, 40, 80, 160, 320, 640]))
LFCC_FILTERS = CFG.get("LFCC_FILTERS", 80)
LFCC_COEFFS = CFG.get("LFCC_COEFFS", 40)
CQT_BINS_PER_OCTAVE = CFG.get("CQT_BINS_PER_OCTAVE", 12)
CQT_N_BINS = CFG.get("CQT_N_BINS", 84)
CQT_FMIN = CFG.get("CQT_FMIN", 20.0)

HOP = int(round(TARGET_SR * HOP_MS / 1000))
WIN = int(round(TARGET_SR * WIN_MS / 1000))


# --- 2. PREPROCESSING & FEATURE EXTRACTION ---
def safe_log(x, eps=1e-7):
    return np.log(np.maximum(x, eps)).astype(np.float32)


def normalize_feature(x):
    """Zero-mean unit-variance per-feature normalization matching training."""
    x = np.asarray(x, dtype=np.float32)
    return ((x - x.mean()) / (x.std() + 1e-6)).astype(np.float32)


def feature_logmel(y, sr):
    S = librosa.feature.melspectrogram(
        y=y, sr=sr,
        n_fft=N_FFT,
        hop_length=HOP,
        win_length=WIN,
        n_mels=N_MELS,
        fmin=20,
        fmax=sr / 2,
        power=2.0
    )
    return safe_log(S)


def linear_filterbank(sr, n_fft, n_filters):
    freqs = np.linspace(0, sr / 2, n_fft // 2 + 1)
    edges = np.linspace(0, sr / 2, n_filters + 2)
    fb = np.zeros((n_filters, len(freqs)), dtype=np.float32)

    for i in range(n_filters):
        l, c, r = edges[i], edges[i + 1], edges[i + 2]
        m1 = (freqs >= l) & (freqs <= c)
        m2 = (freqs >= c) & (freqs <= r)
        if c > l:
            fb[i, m1] = (freqs[m1] - l) / (c - l)
        if r > c:
            fb[i, m2] = (r - freqs[m2]) / (r - c)

    return fb


def feature_lfcc(y, sr):
    D = np.abs(librosa.stft(
        y,
        n_fft=N_FFT,
        hop_length=HOP,
        win_length=WIN,
        window="hann"
    )) ** 2

    fb = linear_filterbank(sr, N_FFT, LFCC_FILTERS)
    E = np.maximum(fb @ D, 1e-8)
    logE = np.log(E)

    n = LFCC_COEFFS
    N = LFCC_FILTERS
    k = np.arange(n)[:, None]
    m = np.arange(N)[None, :]
    basis = np.cos(np.pi / N * (m + 0.5) * k)

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


FEATURE_FUNCS = {
    "logmel": feature_logmel,
    "lfcc": feature_lfcc,
    "cqt": feature_cqt,
}


def extract_features(audio_path, feature_names=DEFAULT_FEATURES):
    """
    Loads audio, resamples to TARGET_SR if required, extracts each requested feature,
    normalizes it with normalize_feature(), and returns a dictionary of PyTorch tensors [1, 1, F, T].
    """
    y, sr = librosa.load(str(audio_path), sr=None, mono=True)
    if sr != TARGET_SR:
        y = librosa.resample(y, orig_sr=sr, target_sr=TARGET_SR)
        sr = TARGET_SR

    views = {}
    for name in feature_names:
        func = FEATURE_FUNCS.get(name, feature_logmel)
        raw_feat = func(y, sr)
        norm_feat = normalize_feature(raw_feat)
        # [1, 1, F, T] tensor
        tensor_feat = torch.from_numpy(np.ascontiguousarray(norm_feat)).unsqueeze(0).unsqueeze(0)
        views[name] = tensor_feat

    return views


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
            stride=(2, 1),
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
            ConvTimeBlock(base, base * 2),
            ConvTimeBlock(base * 2, base * 4),
            ConvTimeBlock(base * 4, base * 4),
        )
        self.proj = nn.Conv1d(base * 4, out_dim, 1)

    def forward(self, x):
        # x shape: [B, 1, F, T]
        z = self.blocks(x)
        # Collapse frequency dimension only
        z = z.mean(dim=2)
        # [B, D, T]
        return self.proj(z)


class TCNBlock(nn.Module):
    def __init__(self, dim, dilation, dropout=0.1):
        super().__init__()
        self.conv1 = nn.Conv1d(dim, dim, 3, padding=dilation, dilation=dilation)
        self.bn1 = nn.BatchNorm1d(dim)
        self.conv2 = nn.Conv1d(dim, dim, 3, padding=dilation, dilation=dilation)
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
        feature_names=DEFAULT_FEATURES,
        embed_dim=EMBED_DIM,
        base=BASE_CHANNELS,
        dropout=DROPOUT,
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
            str(ms): nn.Conv1d(embed_dim, 1, kernel_size=3, padding=1)
            for ms in SCALE_MAP
        })

    def encode_views(self, xdict):
        encoded = []
        for name in self.feature_names:
            encoded.append(self.encoders[name](xdict[name]))

        # Temporal alignment
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
                pooled = zz.reshape(
                    z.shape[0],
                    z.shape[1],
                    -1,
                    scale
                ).mean(dim=-1)
                seg[ms] = self.segment_heads[str(ms)](pooled).squeeze(1)
            out["seg"] = seg

        return out


def count_parameters(model):
    return sum(p.numel() for p in model.parameters() if p.requires_grad)


# --- 4. INFERENCE API ---
def load_model(weights_path, device="cpu"):
    """
    Initializes PartialSpoofCNN with configured dimensions and loads weights from best.pt.
    Handles both direct state dicts and training checkpoints containing 'model_state'.
    """
    model = PartialSpoofCNN(
        feature_names=DEFAULT_FEATURES,
        base=BASE_CHANNELS,
        embed_dim=EMBED_DIM,
        dropout=DROPOUT,
    )
    checkpoint = torch.load(weights_path, map_location=device, weights_only=False)

    if isinstance(checkpoint, dict):
        if "model_state" in checkpoint:
            state_dict = checkpoint["model_state"]
        elif "model_state_dict" in checkpoint:
            state_dict = checkpoint["model_state_dict"]
        else:
            state_dict = checkpoint
    else:
        state_dict = checkpoint

    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    return model


def predict(audio_path, weights_path):
    """
    Runs full inference on the given audio file using the trained model weights.
    Returns:
        is_spoof (bool): True if classified as synthetic/spoof (threshold 0.5), False if human.
        spoof_probability (float): Model confidence in spoof [0.0, 1.0].
        detected_segments (list): Temporal intervals detected as suspicious/spoof.
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = load_model(weights_path, device=device)
    features = extract_features(audio_path, feature_names=DEFAULT_FEATURES)

    for k in features:
        features[k] = features[k].to(device)

    with torch.no_grad():
        out = model(features, return_segments=True)
        utt_logits = out["utt"]
        seg_dict = out.get("seg", {})

    # In PartialSpoof v3 training:
    # y = 1 -> Spoof / Synthetic
    # y = 0 -> Bonafide / Human
    # Loss: binary_cross_entropy_with_logits(logits, y)
    spoof_probability = float(torch.sigmoid(utt_logits).item())
    spoof_probability = max(0.0, min(1.0, spoof_probability))
    is_spoof = bool(spoof_probability >= 0.5)

    # Temporal segment localization (160ms resolution)
    detected_segments = []
    res_ms = 160
    seg_logits = None
    if res_ms in seg_dict:
        seg_logits = seg_dict[res_ms][0]
    elif str(res_ms) in seg_dict:
        seg_logits = seg_dict[str(res_ms)][0]

    if seg_logits is not None:
        seg_probs = torch.sigmoid(seg_logits).cpu().numpy()
        step_sec = res_ms / 1000.0

        in_segment = False
        start_time = 0.0
        current_confs = []

        for i, p in enumerate(seg_probs):
            if p >= 0.5 and not in_segment:
                in_segment = True
                start_time = i * step_sec
                current_confs = [float(p)]
            elif p >= 0.5 and in_segment:
                current_confs.append(float(p))
            elif p < 0.5 and in_segment:
                in_segment = False
                end_time = i * step_sec
                avg_conf = float(np.mean(current_confs)) if current_confs else float(p)
                detected_segments.append({
                    "start": round(start_time, 2),
                    "end": round(end_time, 2),
                    "confidence": round(avg_conf, 2),
                    "type": "model_detected"
                })
                current_confs = []

        if in_segment:
            end_time = len(seg_probs) * step_sec
            avg_conf = float(np.mean(current_confs)) if current_confs else 0.99
            detected_segments.append({
                "start": round(start_time, 2),
                "end": round(end_time, 2),
                "confidence": round(avg_conf, 2),
                "type": "model_detected"
            })

    return is_spoof, spoof_probability, detected_segments


if __name__ == "__main__":
    import sys
    print("Testing PartialSpoofCNN inference...")
    weights = Path(__file__).parent / "weights" / "best.pt"
    if weights.exists():
        m = load_model(str(weights))
        print(f"Model successfully loaded. Trainable parameters: {count_parameters(m):,}")
        if len(sys.argv) > 1 and Path(sys.argv[1]).exists():
            test_file = sys.argv[1]
            is_ai, prob, segs = predict(test_file, str(weights))
            print(f"File: {test_file}")
            print(f"Prediction: {'SYNTHETIC' if is_ai else 'HUMAN'} (Spoof Probability: {prob:.4f})")
            print(f"Segments detected: {len(segs)}")
            for s in segs:
                print(f"  {s['start']}s -> {s['end']}s (conf: {s['confidence']})")
    else:
        print(f"Weights file not found at: {weights}")
