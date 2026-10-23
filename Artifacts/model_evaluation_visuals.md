# PartialSpoof v3 — Model Evaluation & Performance Visualizations

This visual evaluation report presents the performance characteristics, training progression, and temporal localization capabilities of the trained **PartialSpoofCNN** model ([best.pt](file:///d:/BTech/TY/Sem%205/CP/AI/Partialspoof_project/Partialspoof_project/partialspoof_v3/baseline_logmel_v3/best.pt)) trained via [PartialSpoof_v1_2_Training_v3_fixed.ipynb](file:///d:/BTech/TY/Sem%205/CP/AI/Partialspoof_project/Partialspoof_project/PartialSpoof_v1_2_Training_v3_fixed.ipynb).

---

## 1. High-Level Performance Scorecard

![PartialSpoof Performance Scorecard and Model Specifications](C:/Users/Saloni/.gemini/antigravity-ide/brain/c9035888-cb58-4ce0-9744-e58d74d67498/model_performance_scorecard.png)

### Key Metrics Summary
* **Equal Error Rate (EER)**: **4.90%** on the validation subset (**4.98%** across all 24,844 full development files).
* **Area Under ROC (ROC-AUC)**: **98.68%**, demonstrating clear separation between genuine human speech and synthetic voices.
* **Precision-Recall AUC (PR-AUC)**: **99.85%**, reflecting detection reliability under natural 9:1 class imbalance.
* **Balanced Accuracy**: **95.02%** at the calibrated EER operating threshold (`0.342`).
* **Model Footprint**: **682,483 parameters** (~0.68M parameters) with an **8.26 MB** disk checkpoint, optimized for fast CPU/edge deployment.

---

## 2. Training Progression Dashboard (Epoch 1 to 20)

The four-panel dashboard below tracks convergence across all 20 epochs recorded in [history.csv](file:///d:/BTech/TY/Sem%205/CP/AI/Partialspoof_project/Partialspoof_project/partialspoof_v3/baseline_logmel_v3/history.csv):

![Training Convergence and Progression Dashboard](C:/Users/Saloni/.gemini/antigravity-ide/brain/c9035888-cb58-4ce0-9744-e58d74d67498/training_progress_dashboard.png)

### Key Takeaways from Training:
1. **Loss Convergence**: Binary Cross-Entropy loss decreased smoothly from **0.4231** (Epoch 1) to **0.0691** (Epoch 20) under Cosine Annealing learning rate scheduling.
2. **EER Descent**: Validation EER dropped from **9.77%** down to **4.90%** at Epoch 17, which was checkpointed as `best.pt`.
3. **Prevention of Class Collapse**: In previous v2 iterations, the model collapsed to predicting 100% spoof. In v3, the `WeightedRandomSampler` maintained prediction distribution strictly within the healthy 45%–55% zone across every epoch (`frac_pred_spoof = 48.63%` at Epoch 17).
4. **Balanced Specificity & Recall**: Both Bona-fide Recall (**96.60%**) and Spoof Recall (**93.87%**) converged in balance without sacrificing either class.

---

## 3. Full Development Set Evaluation (24,844 Utterances)

The model was tested against all 24,844 utterances in the official PartialSpoof development split (2,548 bona-fide, 22,296 spoof):

![Full Development Set Evaluation Metrics and Sensitivity](C:/Users/Saloni/.gemini/antigravity-ide/brain/c9035888-cb58-4ce0-9744-e58d74d67498/dev_evaluation_metrics.png)

### Detailed Analysis of Subplots:
* **Confusion Matrix (Top-Left)**: At the calibrated EER threshold of `0.342`:
  - **True Negatives (Genuine Speech)**: **2,421 / 2,548 (95.0%)** correctly identified.
  - **True Positives (Deepfakes Detected)**: **21,186 / 22,296 (95.0%)** correctly caught.
  - **Balanced Error Rate**: False Alarms and Misses are matched at **4.98%**.
* **Score Distribution (Top-Right)**: The green (bona-fide) and red (spoof) density distributions show separation, with genuine samples clustered below 0.10 and spoofed samples concentrated above 0.85.
* **Sensitivity to Partial Spoofing (Bottom-Left)**:
  - Speech with $< 10\%$ fake duration: **83.4%** detection rate (924 utterances).
  - Speech with $10\% - 25\%$ fake duration: **91.4%** detection rate (4,194 utterances).
  - Speech with $> 25\%$ fake duration: **94.2% – 98.9%** detection rate.
* **ROC Curve (Bottom-Right)**: Shows steep ascent along the upper-left boundary with an Area Under the Curve of **0.9868**.

---

## 4. Real vs. Fake Temporal Waveform Profiles (Option 1 Sliding Windows)

The graphic below visualizes the model's sliding-window inference across the audio files in [sample_voice](file:///d:/BTech/TY/Sem%205/CP/AI/Partialspoof_project/sample_voice):

![Temporal Waveform Localization for Real and Partial Spoofs](C:/Users/Saloni/.gemini/antigravity-ide/brain/c9035888-cb58-4ce0-9744-e58d74d67498/sample_voice_timeline_visual.png)

### Profile Breakdown:
1. **`bonafied-1.wav` (Genuine Human)**: Stays near 0% across all time frames. Confirmed 100% genuine human speech with zero false positive alarms.
2. **`mixed-1.wav` (Partial Spliced Spoof)**: The model demonstrates temporal localization:
   - `0.00s — 0.65s`: Genuine speech zone (spoof prob drops to **9.5%**).
   - **`0.70s`**: Detected splice point where synthetic speech starts.
   - `0.70s — 2.47s`: Synthetic speech zone (**98.3% — 100.0%** spoof prob).
3. **`Screen-Recording-Trim.wav` (Partial Spoof)**:
   - `0.00s — 4.50s`: Synthetic voiceover (**98.0% — 99.98%** spoof prob).
   - `4.50s — 8.13s`: Natural background / speech (** drops to 5.3%**).
4. **`fullspoof-1.wav` (Full Deepfake)**: Saturated deepfake signature (**100.0%**) from voice onset through the end.
