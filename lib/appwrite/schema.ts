import { APPWRITE_CONFIG } from "./config";

export const DATABASE_ID = APPWRITE_CONFIG.databaseId;
export const STORAGE_BUCKET_ID = APPWRITE_CONFIG.storageBucketId;

export const TABLE_IDS = {
  inspections: APPWRITE_CONFIG.tables.inspections,
  findings: APPWRITE_CONFIG.tables.findings,
  checklistItems: APPWRITE_CONFIG.tables.checklistItems,
  reassessments: APPWRITE_CONFIG.tables.reassessments,
} as const;

export interface InspectionRowData {
  userId: string;
  title: string;
  sceneDescription?: string;
  overallSummary?: string;
  imageId?: string;
  notes?: string;
  status?: string;
  topRecommendations?: string; // JSON string
  limitations?: string; // JSON string
  afterImageId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FindingRowData {
  inspectionId: string;
  userId: string;
  perspective: string;
  title: string;
  description: string;
  observedEvidence: string;
  potentialImpact: string;
  priority: string;
  confidence: string;
  recommendation: string;
  requiresVerification: boolean;
  verificationReason: string | null;
  boundingBox?: string | null; // JSON string
}

export interface ChecklistItemRowData {
  inspectionId: string;
  userId: string;
  findingId?: string;
  title: string;
  recommendation: string;
  perspective: string;
  priority: string;
  verificationRequirement: string | null;
  status: string;
  notes?: string;
}

export interface ReassessmentRowData {
  inspectionId: string;
  userId: string;
  afterImageId?: string;
  overallProgressSummary: string;
  improvedCount: number;
  stillVisibleCount: number;
  newlyObservedCount: number;
  requiresVerificationCount: number;
  comparisons: string; // JSON string
  remainingPriorities: string; // JSON string
  limitations: string; // JSON string
  createdAt: string;
}
