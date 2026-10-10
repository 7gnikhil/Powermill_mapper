export interface CAMFeatureVector {
  holeDiameterMm: number;
  holeDepthMm: number;
  stepCount: number;
  materialHardnessBrinell: number;
  materialGroup: 'ISO-P' | 'ISO-M' | 'ISO-K' | 'ISO-N' | 'ISO-S' | 'ISO-H';
  cutterDiameterMm: number;
  fluteCount: number;
  toolOverhangMm: number;
  hasThroughExit: boolean;
}

export interface ModelInferenceResult {
  predictedHoleType: string;
  confidenceScore: number;
  recommendedStrategy: string;
  recommendedPeckDepthMm: number;
  recommendedSpindleRpm: number;
  recommendedFeedMmPerMin: number;
  recommendedSurfaceSpeedVc: number;
  recommendedFeedPerToothFz: number;
  toolBreakageRiskScore: number;
  chatterProbability: number;
  estimatedCycleTimeSeconds: number;
  cycleTimeSavedPercentage: number;
  powerMillMacroCommand: string;
}

export interface DeployerStep {
  id: number;
  title: string;
  description: string;
  command: string;
  status: 'pending' | 'running' | 'success' | 'warning' | 'error';
  log: string[];
}
