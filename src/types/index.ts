export type ClassLabel = "Recyclable" | "Electronic" | "Organic";

export type NumericLabel = 0 | 1 | 2;

export interface UserProfile {
  id: string;
  fullName: string;
  leaderboardName: string;
  email: string;
  avatarUrl?: string;
  role?: "Ketua" | "Anggota";
}

export interface DatasetItem {
  id: number;
  imageNumber: number;
  groundTruthLabel: ClassLabel;
}

export interface ClassMetrics {
  className: ClassLabel;
  numericCode: NumericLabel;
  precision: number;
  recall: number;
  f1Score: number;
  support: number;
}

export interface EvaluationSummary {
  accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  microF1: number;
  weightedF1: number;
  confusionMatrix: Record<ClassLabel, Record<ClassLabel, number>>;
  perClassMetrics: ClassMetrics[];
}

export interface Submission {
  id: string;
  name: string;
  leaderboardName: string;
  modelName: string;
  strategyDescription: string;
  validationMacroF1: number;
  testMacroF1: number;
  generalizationGap: number;
  predictions: Record<number, ClassLabel>;
  evaluationSummary: EvaluationSummary;
  uploadTimestampWIB: string;
  rank: number;
  parentId?: string | null;
  reasonOfRevision?: string;
  tags?: string[];
  isOfficial?: boolean;
  officialSlot?: 1 | 2 | 3 | null;
  officialActualF1?: number;
}

export interface GroundTruthHistory {
  version: string;
  dateWIB: string;
  timeWIB: string;
  changedByLeaderboardName: string;
  changedCount: number;
  reason: string;
  previousAvgMacroF1?: number;
  newAvgMacroF1?: number;
  maxScoreChangeSubmissionName?: string;
  maxScoreChangeDelta?: number;
  rankingChanged?: boolean;
  officialSubmissionPositionChanged?: boolean;
  officialSubmissionOldRank?: number;
  officialSubmissionNewRank?: number;
  positionChangedCount?: number;
}

export interface ActivityLog {
  id: string;
  timestampWIB: string;
  title: string;
  description: string;
  type: "submission" | "gt_update" | "system";
}
