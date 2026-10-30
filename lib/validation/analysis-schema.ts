import { z } from "zod";

export const perspectiveEnum = z.enum([
  "wheelchair_access",
  "low_vision",
  "mobility",
  "sensory_access",
]);

export const priorityEnum = z.enum(["high", "medium", "low"]);
export const confidenceEnum = z.enum(["high", "medium", "low"]);

export const boundingBoxSchema = z
  .object({
    ymin: z.number().min(0).max(1000),
    xmin: z.number().min(0).max(1000),
    ymax: z.number().min(0).max(1000),
    xmax: z.number().min(0).max(1000),
  })
  .nullable()
  .optional();

export const accessibilityFindingSchema = z
  .object({
    id: z.string().trim().min(1, "Finding ID is required"),
    perspective: perspectiveEnum,
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().min(10).max(800),
    observedEvidence: z.string().trim().min(5).max(500),
    potentialImpact: z.string().trim().min(5).max(500),
    priority: priorityEnum,
    confidence: confidenceEnum,
    recommendation: z.string().trim().min(5).max(600),
    requiresVerification: z.boolean(),
    verificationReason: z.string().trim().max(500).nullable(),
    boundingBox: boundingBoxSchema,
  })
  .superRefine((data, ctx) => {
    if (data.requiresVerification) {
      if (!data.verificationReason || data.verificationReason.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A non-empty verificationReason is required when requiresVerification is true.",
          path: ["verificationReason"],
        });
      }
    }
  });

export const accessibilityAnalysisSchema = z.object({
  sceneDescription: z.string().trim().min(10).max(500),
  overallSummary: z.string().trim().min(20).max(1500),
  findings: z.array(accessibilityFindingSchema).max(20),
  topRecommendations: z.array(z.string().trim().min(3).max(400)).max(8),
  limitations: z.array(z.string().trim().min(3).max(400)).max(8),
});

export const comparisonStatusEnum = z.enum([
  "appears_improved",
  "still_visible",
  "newly_observed",
  "requires_verification",
]);

export const findingComparisonSchema = z
  .object({
    id: z.string().trim().min(1),
    originalFindingId: z.string().trim().optional(),
    perspective: perspectiveEnum,
    title: z.string().trim().min(3).max(120),
    status: comparisonStatusEnum,
    beforeObservation: z.string().trim().min(5).max(600),
    afterObservation: z.string().trim().min(5).max(600),
    comparisonEvidence: z.string().trim().min(5).max(600),
    recommendationOrNextStep: z.string().trim().min(5).max(600),
    requiresVerification: z.boolean(),
    verificationReason: z.string().trim().max(500).nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.requiresVerification) {
      if (!data.verificationReason || data.verificationReason.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A non-empty verificationReason is required when requiresVerification is true.",
          path: ["verificationReason"],
        });
      }
    }
  });

export const reassessmentAnalysisSchema = z.object({
  overallProgressSummary: z.string().trim().min(20).max(1500),
  improvedCount: z.number().int().min(0),
  stillVisibleCount: z.number().int().min(0),
  newlyObservedCount: z.number().int().min(0),
  requiresVerificationCount: z.number().int().min(0),
  comparisons: z.array(findingComparisonSchema).max(25),
  remainingPriorities: z.array(z.string().trim().min(3).max(400)).max(8),
  limitations: z.array(z.string().trim().min(3).max(400)).max(8),
});

export type AccessibilityFindingSchema = z.infer<typeof accessibilityFindingSchema>;
export type AccessibilityAnalysisSchema = z.infer<typeof accessibilityAnalysisSchema>;
export type FindingComparisonSchema = z.infer<typeof findingComparisonSchema>;
export type ReassessmentAnalysisSchema = z.infer<typeof reassessmentAnalysisSchema>;
