"""
PartialSpoof v1.2 CNN Training Pipeline (v3: Class-Imbalance + Label-Aware Crop Fix).
Converted from PartialSpoof_v1_2_Training_v3_fixed.ipynb into a clean, standalone training CLI.

Usage:
    python backend/ai_engine/train.py --ps-root "D:\\PartialSpoofExtract" --epochs 20 --batch-size 16
"""

import os
import sys
import math
import time
import json
import random
import argparse
from pathlib import Path
from dataclasses import dataclass, asdict, field
from typing import Tuple, List, Dict, Any
from collections import Counter

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader, Sampler, WeightedRandomSampler, RandomSampler
import librosa
from sklearn.metrics import (
    roc_curve,
    roc_auc_score,
    precision_recall_curve,
    average_precision_score,
    accuracy_score,
    confusion_matrix,
    precision_recall_fscore_support
)
from tqdm import tqdm

# Import model architecture & feature functions directly from inference.py to guarantee parity
current_dir = Path(__file__).parent.resolve()
if str(current_dir.parent) not in sys.path:
    sys.path.append(str(current_dir.parent))

from ai_engine.inference import (
    PartialSpoofCNN,
    FEATURE_FUNCS,
    normalize_feature,
    SCALE_MAP,
    count_parameters
)


# ============================================================
# CONFIGURATION DATACLASS
# ============================================================
@dataclass
class TrainConfig:
    PS_ROOT: str = r"D:\PartialSpoofExtract"
    OUTPUT_ROOT: str = "./runs/partialspoof_v3"
    CACHE_ROOT: str = "./cache/partialspoof_v2"
    SEED: int = 42
    DETERMINISTIC: bool = False
    DEBUG_MODE: bool = False
    DEBUG_FILES_PER_SPLIT: int = 32
    FAIL_ON_AUDIT_ERROR: bool = True

    BATCH_SIZE: int = 16
    EVAL_BATCH_SIZE: int = 32
    NUM_WORKERS: int = 0
    PIN_MEMORY: bool = True
    EPOCHS: int = 20
    SAMPLES_PER_EPOCH: int = 10000
    LR: float = 0.0002
    WEIGHT_DECAY: float = 0.0001
    PATIENCE: int = 5
    GRAD_ACCUM_STEPS: int = 1
    GRAD_CLIP: float = 5.0
    IMBALANCE_MODE: str = "sampler"

    TARGET_SR: int = 16000
    ALLOW_RESAMPLE: bool = True
    N_FFT: int = 512
    WIN_MS: float = 20.0
    HOP_MS: float = 10.0
    N_MELS: int = 80
    BASE_CHANNELS: int = 32
    EMBED_DIM: int = 128
    DROPOUT: float = 0.2
    TRAIN_CROP_SEC: float = 4.0
    SPOOF_CROP_PROB: float = 0.7
    MIN_SPOOF_FRAMES_IN_CROP: int = 5
    DEV_EPOCH_PER_CLASS: int = 1500
    DEFAULT_FEATURES: Tuple[str, ...] = ("logmel",)
    RESOLUTIONS_MS: Tuple[int, ...] = (20, 40, 80, 160, 320, 640)


EXPECTED_RESOLUTIONS = (20, 40, 80, 160, 320, 640)


# ============================================================
# LABEL ADAPTER & AUDIT
# ============================================================
def load_official_segment_labels(ps_root: Path, split: str) -> Dict[int, Any]:
    split_dir = ps_root / "database" / "segment_labels"
    resolution_seconds = {
        20: "0.02",
        40: "0.04",
        80: "0.08",
        160: "0.16",
        320: "0.32",
        640: "0.64",
    }
    loaded = {}
    for ms, sec in resolution_seconds.items():
        path = split_dir / f"{split}_seglab_{sec}.npy"
        if not path.exists():
            raise FileNotFoundError(f"Missing official segment-label file: {path}")
        obj = np.load(path, allow_pickle=True)
        data = obj.item() if obj.shape == () else obj
        if not isinstance(data, dict):
            raise TypeError(f"{split} {ms} ms: expected dict, got {type(data)}")
        loaded[ms] = data
    return loaded


def load_official_utterance_labels(ps_root: Path, split: str) -> Dict[str, int]:
    protocol_path = (
        ps_root
        / "database"
        / "protocols"
        / "PartialSpoof_LA_cm_protocols"
        / f"PartialSpoof.LA.cm.{split}.trl.txt"
    )
    if not protocol_path.exists():
        raise FileNotFoundError(f"Missing official protocol file: {protocol_path}")

    labels = {}
    with open(protocol_path, "r", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) >= 4:
                utt_id = parts[1]
                label = parts[-1].lower()
                labels[utt_id] = 0 if label == "bonafide" else 1
    return labels


def build_official_label_map(ps_root: Path, split: str) -> Dict[str, Any]:
    segment_maps = load_official_segment_labels(ps_root, split)
    utterance_labels = load_official_utterance_labels(ps_root, split)
    utt_ids = set(segment_maps[20].keys())

    label_map = {}
    for utt_id in sorted(utt_ids):
        if utt_id in utterance_labels:
            label_map[utt_id] = {
                "utterance_label": int(utterance_labels[utt_id]),
                "segment_labels": {
                    ms: np.asarray(segment_maps[ms][utt_id]).ravel()
                    for ms in EXPECTED_RESOLUTIONS
                }
            }
    return label_map


def detect_spoof_value(official_labels: Dict[str, Dict[str, Any]], split="train") -> int:
    bona = Counter()
    for rec in official_labels[split].values():
        if int(rec["utterance_label"]) == 0:
            values, counts = np.unique(
                np.asarray(rec["segment_labels"][20]).ravel().astype(int),
                return_counts=True
            )
            for value, count in zip(values, counts):
                bona[int(value)] += int(count)

    if not bona:
        return 0
    bona_value, _ = bona.most_common(1)[0]
    return 1 - bona_value


# ============================================================
# FEATURE CACHING & DATASET
# ============================================================
def feature_cache_path(cache_root: Path, split: str, utt_id: str, feature_name: str, mkdir=False) -> Path:
    d = cache_root / split / feature_name
    if mkdir:
        d.mkdir(parents=True, exist_ok=True)
    return d / f"{utt_id}.npy"


def prepare_feature_cache(path: Path, split: str, feature_names: Tuple[str, ...], cfg: TrainConfig, cache_root: Path):
    utt_id = path.stem
    cps = [feature_cache_path(cache_root, split, utt_id, n) for n in feature_names]
    if all(cp.exists() for cp in cps):
        return cps

    y, sr = librosa.load(str(path), sr=None, mono=True)
    if sr != cfg.TARGET_SR:
        y = librosa.resample(y, orig_sr=sr, target_sr=cfg.TARGET_SR)
        sr = cfg.TARGET_SR

    for name, cp in zip(feature_names, cps):
        if not cp.exists():
            feat = FEATURE_FUNCS[name](y, sr)
            feature_cache_path(cache_root, split, utt_id, name, mkdir=True)
            np.save(cp, feat.astype(np.float32), allow_pickle=False)
    return cps


def frame_spoof_mask(spoof20, n_frames: int):
    m = np.repeat(np.asarray(spoof20, dtype=bool), 2)
    if len(m) < n_frames:
        m = np.concatenate([m, np.full(n_frames - len(m), m[-1] if len(m) else False)])
    return m[:n_frames]


def pick_crop(n_frames: int, crop_frames: int, utt_label: int, frame_mask, spoof_prob: float, min_spoof: int, rng):
    if crop_frames is None or n_frames <= crop_frames:
        return 0, n_frames, int(utt_label)

    max_start = n_frames - crop_frames
    if utt_label == 0:
        return int(rng.randint(0, max_start + 1)), crop_frames, 0

    if frame_mask is None or not frame_mask.any():
        return int(rng.randint(0, max_start + 1)), crop_frames, 1

    cs = np.concatenate([[0], np.cumsum(frame_mask.astype(np.int64))])
    spoof_idx = np.flatnonzero(frame_mask)
    start, cnt = 0, 0
    for _ in range(6):
        if rng.rand() < spoof_prob:
            c = int(spoof_idx[rng.randint(0, len(spoof_idx))])
            start = max(0, min(c - crop_frames // 2, max_start))
        else:
            start = int(rng.randint(0, max_start + 1))
        cnt = int(cs[start + crop_frames] - cs[start])
        if cnt == 0 or cnt >= min_spoof:
            break
    return start, crop_frames, int(cnt >= min_spoof)


class CachedFeatureDataset(Dataset):
    def __init__(self, manifest: pd.DataFrame, split: str, feature_names: Tuple[str, ...],
                 cache_root: Path, cfg: TrainConfig, training=False, crop_frames=None,
                 seg_labels=None, spoof_value=0):
        self.df = manifest.reset_index(drop=True)
        self.utt_ids = self.df["utt_id"].tolist()
        self.utt_labels = self.df["utterance_label"].astype(int).tolist()
        self.split = split
        self.feature_names = tuple(feature_names)
        self.cache_root = cache_root
        self.cfg = cfg
        self.training = training
        self.crop_frames = crop_frames if training else None
        self.spoof20 = {}
        if training and seg_labels is not None:
            for u, l in zip(self.utt_ids, self.utt_labels):
                if l == 1 and u in seg_labels:
                    a = np.asarray(seg_labels[u]["segment_labels"][20]).ravel().astype(int)
                    self.spoof20[u] = (a == spoof_value)

    def __len__(self):
        return len(self.utt_ids)

    def __getitem__(self, idx):
        u = self.utt_ids[idx]
        y_utt = self.utt_labels[idx]
        views, start, length, y_crop = {}, None, None, y_utt

        for name in self.feature_names:
            cp = feature_cache_path(self.cache_root, self.split, u, name)
            x = normalize_feature(np.load(cp, allow_pickle=False, mmap_mode="r"))

            if self.crop_frames is not None:
                if start is None:
                    fm = frame_spoof_mask(self.spoof20[u], x.shape[-1]) if u in self.spoof20 else None
                    start, length, y_crop = pick_crop(
                        x.shape[-1], self.crop_frames, y_utt, fm,
                        self.cfg.SPOOF_CROP_PROB, self.cfg.MIN_SPOOF_FRAMES_IN_CROP, np.random
                    )
                x = x[:, start:start + length]

            views[name] = torch.from_numpy(np.ascontiguousarray(x[None, ...]))

        return {
            "utt_id": u,
            "views": views,
            "utt": torch.tensor(float(y_crop), dtype=torch.float32),
            "utt_full": torch.tensor(float(y_utt), dtype=torch.float32),
        }


def collate_cached(batch):
    out = {
        "utt_id": [b["utt_id"] for b in batch],
        "utt": torch.stack([b["utt"] for b in batch]),
        "utt_full": torch.stack([b["utt_full"] for b in batch]),
    }
    views = {}
    for name in batch[0]["views"]:
        xs = [b["views"][name] for b in batch]
        max_t = max(x.shape[-1] for x in xs)
        views[name] = torch.stack([F.pad(x, (0, max_t - x.shape[-1])) if x.shape[-1] < max_t else x for x in xs])
    out["views"] = views
    return out


# ============================================================
# METRICS & EVALUATION
# ============================================================
def compute_eer(y_true, scores):
    y_true = np.asarray(y_true).astype(int)
    scores = np.asarray(scores).astype(float)
    if len(np.unique(y_true)) < 2:
        return float("nan"), float("nan")
    fpr, tpr, thr = roc_curve(y_true, scores)
    fnr = 1 - tpr
    i = int(np.nanargmin(np.abs(fpr - fnr)))
    return float((fpr[i] + fnr[i]) / 2), float(thr[i])


def utterance_metrics(y_true, scores, threshold=0.5):
    y_true = np.asarray(y_true).astype(int)
    scores = np.asarray(scores).astype(float)
    eer, eer_thr = compute_eer(y_true, scores)

    pred05 = (scores >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, pred05, labels=[0, 1]).ravel()
    bona_rec = tn / max(tn + fp, 1)
    spoof_rec = tp / max(tp + fn, 1)
    p, r, f1, _ = precision_recall_fscore_support(y_true, pred05, average="binary", zero_division=0)

    return {
        "EER": eer,
        "EER_threshold": eer_thr,
        "ROC_AUC": float(roc_auc_score(y_true, scores)),
        "PR_AUC": float(average_precision_score(y_true, scores)),
        "Accuracy@0.5": float(accuracy_score(y_true, pred05)),
        "Precision@0.5": float(p),
        "Recall@0.5": float(r),
        "F1@0.5": float(f1),
        "bonafide_recall@0.5": float(bona_rec),
        "spoof_recall@0.5": float(spoof_rec),
        "balanced_acc@0.5": float((bona_rec + spoof_rec) / 2),
        "frac_pred_spoof@0.5": float(pred05.mean()),
    }


# ============================================================
# MAIN TRAINING PIPELINE
# ============================================================
def train(cfg: TrainConfig):
    print("=" * 70)
    print("PARTIALSPOOF V1.2 TRAINING PIPELINE (v3)")
    print("=" * 70)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    # Set seeds
    random.seed(cfg.SEED)
    np.random.seed(cfg.SEED)
    torch.manual_seed(cfg.SEED)
    if device.type == "cuda":
        torch.cuda.manual_seed_all(cfg.SEED)

    ps_root = Path(cfg.PS_ROOT)
    cache_root = Path(cfg.CACHE_ROOT)
    out_dir = Path(cfg.OUTPUT_ROOT)
    out_dir.mkdir(parents=True, exist_ok=True)

    # 1. Load labels
    print("\n[1/5] Loading official protocols and labels...")
    official_labels = {
        "train": build_official_label_map(ps_root, "train"),
        "dev": build_official_label_map(ps_root, "dev"),
    }
    spoof_value = detect_spoof_value(official_labels, "train")
    print(f"Detected segment SPOOF_VALUE = {spoof_value}")

    # 2. Build manifests
    print("\n[2/5] Building dataset manifests...")
    def get_manifest(split):
        audio_dir = ps_root / "database" / split
        rows = []
        for p in audio_dir.glob("*.wav"):
            u = p.stem
            if u in official_labels[split]:
                rows.append({"utt_id": u, "audio_path": str(p), "utterance_label": official_labels[split][u]["utterance_label"]})
        return pd.DataFrame(rows)

    train_manifest = get_manifest("train")
    dev_manifest = get_manifest("dev")
    print(f"Train samples: {len(train_manifest):,}, Dev samples: {len(dev_manifest):,}")

    # 3. Model & Optimizer
    crop_frames = int(round(cfg.TRAIN_CROP_SEC * 1000 / cfg.HOP_MS))
    print(f"\n[3/5] Initializing PartialSpoofCNN (crop = {crop_frames} frames)...")
    model = PartialSpoofCNN(
        feature_names=cfg.DEFAULT_FEATURES,
        embed_dim=cfg.EMBED_DIM,
        base=cfg.BASE_CHANNELS,
        dropout=cfg.DROPOUT
    ).to(device)
    print(f"Trainable parameters: {count_parameters(model):,}")

    optimizer = torch.optim.AdamW(model.parameters(), lr=cfg.LR, weight_decay=cfg.WEIGHT_DECAY)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=cfg.EPOCHS)
    amp_enabled = (device.type == "cuda")
    scaler = torch.amp.GradScaler("cuda", enabled=amp_enabled)

    # 4. Data Loaders
    print("\n[4/5] Preparing DataLoaders...")
    train_ds = CachedFeatureDataset(
        train_manifest, "train", cfg.DEFAULT_FEATURES, cache_root, cfg,
        training=True, crop_frames=crop_frames, seg_labels=official_labels["train"],
        spoof_value=spoof_value
    )
    dev_ds = CachedFeatureDataset(
        dev_manifest, "dev", cfg.DEFAULT_FEATURES, cache_root, cfg,
        training=False, crop_frames=None
    )

    y_train = np.asarray(train_ds.utt_labels)
    class_count = np.bincount(y_train, minlength=2).astype(np.float64)
    sample_weights = (1.0 / class_count)[y_train]
    sampler = WeightedRandomSampler(torch.as_tensor(sample_weights, dtype=torch.double),
                                    num_samples=cfg.SAMPLES_PER_EPOCH, replacement=True)

    train_loader = DataLoader(
        train_ds, batch_size=cfg.BATCH_SIZE, sampler=sampler,
        num_workers=cfg.NUM_WORKERS, collate_fn=collate_cached, drop_last=True
    )
    dev_loader = DataLoader(
        dev_ds, batch_size=cfg.EVAL_BATCH_SIZE, shuffle=False,
        num_workers=cfg.NUM_WORKERS, collate_fn=collate_cached
    )

    # 5. Training Loop
    print("\n[5/5] Starting training loop...")
    best_eer = float("inf")
    best_epoch = -1
    bad_epochs = 0
    history = []

    for epoch in range(1, cfg.EPOCHS + 1):
        model.train()
        tot_loss, n_seen = 0.0, 0
        t0 = time.time()

        for step, batch in enumerate(tqdm(train_loader, desc=f"Epoch {epoch:02d}")):
            views = {k: v.to(device) for k, v in batch["views"].items()}
            y = batch["utt"].to(device)

            with torch.amp.autocast(device_type=device.type, enabled=amp_enabled):
                logits = model(views, return_segments=False)["utt"]
                loss = F.binary_cross_entropy_with_logits(logits.float(), y)

            scaler.scale(loss / cfg.GRAD_ACCUM_STEPS).backward()
            if (step + 1) % cfg.GRAD_ACCUM_STEPS == 0:
                scaler.unscale_(optimizer)
                torch.nn.utils.clip_grad_norm_(model.parameters(), cfg.GRAD_CLIP)
                scaler.step(optimizer)
                scaler.update()
                optimizer.zero_grad(set_to_none=True)

            bs = len(y)
            tot_loss += float(loss.detach()) * bs
            n_seen += bs

        scheduler.step()
        train_loss = tot_loss / max(n_seen, 1)

        # Validation
        model.eval()
        ys, scores = [], []
        with torch.no_grad():
            for batch in dev_loader:
                views = {k: v.to(device) for k, v in batch["views"].items()}
                with torch.amp.autocast(device_type=device.type, enabled=amp_enabled):
                    logits = model(views, return_segments=False)["utt"]
                scores.extend(torch.sigmoid(logits.float()).cpu().numpy())
                ys.extend(batch["utt_full"].numpy())

        metrics = utterance_metrics(ys, scores)
        history.append({"epoch": epoch, "train_loss": train_loss, **metrics})
        pd.DataFrame(history).to_csv(out_dir / "history.csv", index=False)

        print(f"Epoch {epoch:02d} | Train Loss: {train_loss:.4f} | DEV EER: {metrics['EER']*100:.2f}% | "
              f"ROC-AUC: {metrics['ROC_AUC']:.4f} | Bal-Acc@0.5: {metrics['balanced_acc@0.5']*100:.2f}%")

        if metrics["EER"] < best_eer:
            best_eer = metrics["EER"]
            best_epoch = epoch
            bad_epochs = 0
            ckpt = {
                "epoch": epoch,
                "model_state": model.state_dict(),
                "optimizer_state": optimizer.state_dict(),
                "scheduler_state": scheduler.state_dict(),
                "metrics": metrics,
                "config": asdict(cfg),
            }
            torch.save(ckpt, out_dir / "best.pt")
            with open(out_dir / "config.json", "w") as f:
                json.dump(asdict(cfg), f, indent=2, default=str)
            print(f"  --> Saved new best checkpoint at epoch {epoch} (EER = {best_eer*100:.2f}%)")
        else:
            bad_epochs += 1
            if bad_epochs >= cfg.PATIENCE:
                print(f"\nEarly stopping triggered after {epoch} epochs.")
                break

    print(f"\nTraining completed! Best DEV EER: {best_eer*100:.2f}% at epoch {best_epoch}.")
    print(f"Best checkpoint saved to: {out_dir / 'best.pt'}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train PartialSpoof CNN Model")
    parser.add_argument("--ps-root", type=str, default=r"D:\PartialSpoofExtract")
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--lr", type=float, default=0.0002)
    parser.add_argument("--output-root", type=str, default="./runs/partialspoof_v3")
    args = parser.parse_args()

    cfg = TrainConfig(
        PS_ROOT=args.ps_root,
        EPOCHS=args.epochs,
        BATCH_SIZE=args.batch_size,
        LR=args.lr,
        OUTPUT_ROOT=args.output_root
    )
    train(cfg)
