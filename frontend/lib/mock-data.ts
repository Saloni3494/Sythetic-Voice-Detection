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
    modelName: "SVCNN",
    featuresUsed: "LOG-MEL / LFCC / CQT",
    inferenceTime: 0.84,
    spectralAnomaly: true,
    temporalConsistency: "HIGH",
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
    { condition: "CLEAN", eer: 1.2, f1: 98.4, accuracy: 98.5, localizationF1: 96.2, rangeEer: 2.1 },
    { condition: "NOISE", eer: 4.5, f1: 94.1, accuracy: 94.8, localizationF1: 89.5, rangeEer: 6.8 },
    { condition: "REVERBERATION", eer: 3.8, f1: 95.2, accuracy: 95.9, localizationF1: 91.4, rangeEer: 5.5 },
    { condition: "CODEC", eer: 2.9, f1: 96.7, accuracy: 97.1, localizationF1: 93.8, rangeEer: 4.2 },
    { condition: "RESAMPLING", eer: 1.8, f1: 97.9, accuracy: 98.1, localizationF1: 95.1, rangeEer: 3.0 },
  ],
  experiments: [
    { id: "e1", model: "LOG-MEL CNN", eer: 2.4, rocAuc: 99.1, f1: 97.2, accuracy: 97.5, rangeEer: 3.8, localizationF1: 94.1 },
    { id: "e2", model: "LFCC CNN", eer: 3.1, rocAuc: 98.7, f1: 96.5, accuracy: 96.8, rangeEer: 4.5, localizationF1: 92.5 },
    { id: "e3", model: "CQT CNN", eer: 2.8, rocAuc: 98.9, f1: 96.8, accuracy: 97.1, rangeEer: 4.1, localizationF1: 93.2 },
    { id: "e4", model: "CNN + TCN", eer: 1.9, rocAuc: 99.4, f1: 98.1, accuracy: 98.2, rangeEer: 3.1, localizationF1: 95.8 },
    { id: "e5", model: "MULTI-VIEW CNN", eer: 1.5, rocAuc: 99.6, f1: 98.5, accuracy: 98.6, rangeEer: 2.5, localizationF1: 96.5 },
    { id: "e6", model: "MULTI-TASK CNN", eer: 1.4, rocAuc: 99.7, f1: 98.6, accuracy: 98.7, rangeEer: 2.3, localizationF1: 96.8 },
    { id: "e7", model: "MULTI-RESOLUTION CNN", eer: 1.2, rocAuc: 99.8, f1: 98.8, accuracy: 98.9, rangeEer: 2.1, localizationF1: 97.2 },
    { id: "e8", model: "ROBUST CNN", eer: 1.1, rocAuc: 99.9, f1: 99.0, accuracy: 99.1, rangeEer: 1.8, localizationF1: 97.5 },
  ]
}

export function mergeAnalysisResponse(apiResult: any, baseMock: ForensicsResponse = mockBackendResponse): ForensicsResponse {
  const spoofPercent = apiResult.spoof_probability * 100;
  const humanPercent = 100 - spoofPercent;
  
  return {
    ...baseMock,
    segments: apiResult.segments || [],
    result: {
      ...baseMock.result,
      label: apiResult.is_ai_generated ? "SYNTHETIC" : "HUMAN",
      syntheticProbability: Number(spoofPercent.toFixed(1)),
      humanProbability: Number(humanPercent.toFixed(1)),
    }
  };
}
