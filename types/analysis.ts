export type PerspectiveId =
  | "wheelchair_access"
  | "low_vision"
  | "mobility"
  | "sensory_access";

export type PriorityLevel = "high" | "medium" | "low";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface BoundingBox {
  // Normalized 0-1000 coordinates (standard Gemini format)
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface AccessibilityFinding {
  id: string;
  perspective: PerspectiveId;
  title: string;
  description: string;
  observedEvidence: string;
  potentialImpact: string;
  priority: PriorityLevel;
  confidence: ConfidenceLevel;
  recommendation: string;
  requiresVerification: boolean;
  verificationReason: string | null;
  boundingBox?: BoundingBox | null;
}

export interface AccessibilityAnalysis {
  sceneDescription: string;
  overallSummary: string;
  findings: AccessibilityFinding[];
  topRecommendations: string[];
  limitations: string[];
}

export type ActionStatus = "pending" | "in_progress" | "completed";

export interface ActionPlanItem {
  id: string;
  findingId?: string;
  title: string;
  recommendation: string;
  perspective: PerspectiveId;
  priority: PriorityLevel;
  verificationRequirement: string | null;
  status: ActionStatus;
  notes?: string;
}

export type ComparisonStatus =
  | "appears_improved"
  | "still_visible"
  | "newly_observed"
  | "requires_verification";

export interface FindingComparison {
  id: string;
  originalFindingId?: string;
  perspective: PerspectiveId;
  title: string;
  status: ComparisonStatus;
  beforeObservation: string;
  afterObservation: string;
  comparisonEvidence: string;
  recommendationOrNextStep: string;
  requiresVerification: boolean;
  verificationReason: string | null;
}

export interface ReassessmentAnalysis {
  overallProgressSummary: string;
  improvedCount: number;
  stillVisibleCount: number;
  newlyObservedCount: number;
  requiresVerificationCount: number;
  comparisons: FindingComparison[];
  remainingPriorities: string[];
  limitations: string[];
}

export type NoteSaveStatus = "unsaved" | "saving" | "saved" | "error";

export interface SavedInspection {
  id: string;
  userId?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  isDemo?: boolean;
  analysis: AccessibilityAnalysis;
  actionItems: ActionPlanItem[];
  notes?: string;
  afterImageUrl?: string | null;
  reassessment?: ReassessmentAnalysis | null;
}

export interface PerspectiveMeta {
  id: PerspectiveId;
  label: string;
  shortLabel: string;
  description: string;
  iconName: string;
}

export const PERSPECTIVES_CONFIG: Record<PerspectiveId, PerspectiveMeta> = {
  wheelchair_access: {
    id: "wheelchair_access",
    label: "Wheelchair Accessibility",
    shortLabel: "Wheelchair",
    description: "Steps, visible ramps, door & pathway clearance, level transitions, and alternative routes.",
    iconName: "Accessibility",
  },
  low_vision: {
    id: "low_vision",
    label: "Low Vision",
    shortLabel: "Low Vision",
    description: "Contrast, lighting conditions, visible clutter, signage legibility, and difficult-to-see hazards.",
    iconName: "Eye",
  },
  mobility: {
    id: "mobility",
    label: "Mobility & Walking Support",
    shortLabel: "Mobility",
    description: "Trip hazards, surface evenness, handrail availability, surface transitions, and pathway width.",
    iconName: "Footprints",
  },
  sensory_access: {
    id: "sensory_access",
    label: "Sensory Accessibility",
    shortLabel: "Sensory",
    description: "Visual complexity, overwhelming signage/displays, and quieter or less visually busy zones.",
    iconName: "BrainCircuit",
  },
};
