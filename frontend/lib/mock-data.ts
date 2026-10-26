export interface AudioMetadata {
  filename: string
  duration: number
  sampleRate: number
  channels: number
  format: string
}

export interface SyntheticSegment {
  id: string
  start: number
  end: number
  confidence: number
}

export interface AnalysisResult {
  label: "HUMAN" | "SYNTHETIC"
  humanProbability: number
  syntheticProbability: number
  modelName: string
  featuresUsed: string
  inferenceTime: number
  spectralAnomaly: boolean
  temporalConsistency: string
  modelActivation: string
}

export interface ResolutionResult {
  resolutionMs: number
  segments: SyntheticSegment[]
  totalDetected: number
}

export interface RobustnessResult {
  condition: string
  eer: number
  f1: number
  accuracy: number
  localizationF1: number
  rangeEer: number
}

export interface ExperimentResult {
  id: string
  model: string
  eer: number
  rocAuc: number
  f1: number
  accuracy: number
  rangeEer: number
  localizationF1: number
}

export interface ForensicsResponse {
  metadata: AudioMetadata
  result: AnalysisResult
  segments: SyntheticSegment[]
  resolutions: ResolutionResult[]
  robustness: RobustnessResult[]
  experiments: ExperimentResult[]
}

export const mockBackendResponse: ForensicsResponse = {
  metadata: {
    filename: "suspect_recording_004.wav",
    duration: 12.84,
    sampleRate: 16000,
    channels: 1,
    format: "WAV",
  },
  result: {
    label: "SYNTHETIC",
    humanProbability: 7.2,
    syntheticProbability: 92.8,
    modelName: "PartialSpoofCNN (SVCNN v3)",
    featuresUsed: "LOG-MEL (80-bank, 16kHz)",
    inferenceTime: 0.035,
    spectralAnomaly: true,
    temporalConsistency: "ANOMALOUS",
    modelActivation: "HIGH",
  },
  segments: [
    { id: "seg-01", start: 2.84, end: 4.21, confidence: 94.6 },
    { id: "seg-02", start: 7.15, end: 8.9, confidence: 91.2 },
    { id: "seg-03", start: 10.5, end: 11.8, confidence: 88.4 },
  ],
  resolutions: [
    {
      resolutionMs: 20,
      totalDetected: 142,
      segments: [
        { id: "r20-1", start: 2.84, end: 4.21, confidence: 95 },
        { id: "r20-2", start: 7.15, end: 8.9, confidence: 92 },
        { id: "r20-3", start: 10.5, end: 11.8, confidence: 89 },
      ],
    },
    {
      resolutionMs: 40,
      totalDetected: 71,
      segments: [
        { id: "r40-1", start: 2.84, end: 4.2, confidence: 94 },
        { id: "r40-2", start: 7.16, end: 8.88, confidence: 91 },
        { id: "r40-3", start: 10.52, end: 11.76, confidence: 88 },
      ],
    },
    {
      resolutionMs: 80,
      totalDetected: 35,
      segments: [
        { id: "r80-1", start: 2.88, end: 4.16, confidence: 93 },
        { id: "r80-2", start: 7.2, end: 8.8, confidence: 89 },
        { id: "r80-3", start: 10.56, end: 11.68, confidence: 87 },
      ],
    },
    {
      resolutionMs: 160,
      totalDetected: 17,
      segments: [
        { id: "r160-1", start: 2.88, end: 4.16, confidence: 90 },
        { id: "r160-2", start: 7.2, end: 8.8, confidence: 87 },
        { id: "r160-3", start: 10.56, end: 11.68, confidence: 84 },
      ],
    },
    {
      resolutionMs: 320,
      totalDetected: 8,
      segments: [
        { id: "r320-1", start: 2.88, end: 4.16, confidence: 88 },
        { id: "r320-2", start: 7.36, end: 8.64, confidence: 85 },
        { id: "r320-3", start: 10.56, end: 11.52, confidence: 81 },
      ],
    },
    {
      resolutionMs: 640,
      totalDetected: 4,
      segments: [
        { id: "r640-1", start: 2.88, end: 4.16, confidence: 85 },
        { id: "r640-2", start: 7.68, end: 8.32, confidence: 82 },
      ],
    },
  ],
  robustness: [
    { condition: "CLEAN", eer: 4.9, f1: 95.2, accuracy: 95.2, localizationF1: 92.4, rangeEer: 4.2 },
    { condition: "NOISE", eer: 7.2, f1: 91.5, accuracy: 91.8, localizationF1: 86.8, rangeEer: 7.5 },
    { condition: "REVERBERATION", eer: 6.8, f1: 92.4, accuracy: 92.9, localizationF1: 88.1, rangeEer: 6.9 },
    { condition: "CODEC (MP3/AAC)", eer: 5.6, f1: 94.1, accuracy: 94.3, localizationF1: 90.2, rangeEer: 5.1 },
    { condition: "RESAMPLING (8k/16k)", eer: 5.1, f1: 94.8, accuracy: 94.9, localizationF1: 91.6, rangeEer: 4.6 },
  ],
  experiments: [
    { id: "e1", model: "2D-CNN (Log-Mel Baseline)", eer: 9.77, rocAuc: 96.00, f1: 90.10, accuracy: 90.60, rangeEer: 8.4, localizationF1: 82.5 },
    { id: "e2", model: "2D-CNN + SE Attention", eer: 7.40, rocAuc: 97.60, f1: 92.60, accuracy: 92.60, rangeEer: 6.8, localizationF1: 86.2 },
    { id: "e3", model: "SE-CNN + TCN (Unweighted Imbalance)", eer: 14.20, rocAuc: 89.10, f1: 51.40, accuracy: 51.40, rangeEer: 12.5, localizationF1: 45.0 },
    { id: "e4", model: "SE-CNN + Dilated TCN (best.pt Deployed)", eer: 4.90, rocAuc: 98.66, f1: 95.17, accuracy: 95.23, rangeEer: 4.2, localizationF1: 92.4 },
    { id: "e5", model: "Multi-Feature CNN (Log-Mel + LFCC + CQT)", eer: 3.80, rocAuc: 99.10, f1: 96.40, accuracy: 96.50, rangeEer: 3.4, localizationF1: 94.8 },
  ]
}

export function mergeAnalysisResponse(apiResult: any, baseMock: ForensicsResponse = mockBackendResponse): ForensicsResponse {
  const isSynthetic = Boolean(apiResult.is_ai_generated);
  const spoofPercent = Number(apiResult.spoof_probability) * 100;
  const humanPercent = 100 - spoofPercent;
  const rawSegments = isSynthetic ? (apiResult.segments || []) : [];

  const resolutionScales = [20, 40, 80, 160, 320, 640];
  const dynamicResolutions: ResolutionResult[] = resolutionScales.map(resMs => {
    if (!isSynthetic || rawSegments.length === 0) {
      return { resolutionMs: resMs, totalDetected: 0, segments: [] };
    }
    const step = resMs / 1000;
    const resSegments = rawSegments.map((seg: any, idx: number) => {
      const qStart = Math.floor(seg.start / step) * step;
      const qEnd = Math.ceil(seg.end / step) * step;
      return {
        id: `res-${resMs}-${idx}`,
        start: Number(qStart.toFixed(2)),
        end: Number(qEnd.toFixed(2)),
        confidence: Number((seg.confidence ? (seg.confidence > 1 ? seg.confidence : seg.confidence * 100) : spoofPercent).toFixed(1)),
        type: seg.type
      };
    });
    const totalFrames = rawSegments.reduce((acc: number, s: any) => {
      const dur = Math.max(0, s.end - s.start);
      return acc + Math.round(dur / step);
    }, 0);

    return {
      resolutionMs: resMs,
      totalDetected: totalFrames,
      segments: resSegments
    };
  });

  return {
    ...baseMock,
    segments: rawSegments,
    resolutions: dynamicResolutions,
    result: {
      ...baseMock.result,
      label: isSynthetic ? "SYNTHETIC" : "HUMAN",
      syntheticProbability: Number(spoofPercent.toFixed(1)),
      humanProbability: Number(humanPercent.toFixed(1)),
      modelName: "PartialSpoofCNN (SVCNN v3)",
      featuresUsed: "LOG-MEL (80-bank, 16kHz)",
      inferenceTime: 0.035,
      spectralAnomaly: isSynthetic,
      temporalConsistency: isSynthetic ? "ANOMALOUS" : "NATURAL",
      modelActivation: isSynthetic ? "HIGH" : "LOW",
    }
  };
}
