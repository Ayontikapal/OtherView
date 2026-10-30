import { AccessibilityAnalysis } from "@/types/analysis";

export const DEMO_ANALYSIS_DATA: AccessibilityAnalysis = {
  sceneDescription:
    "A commercial public building entrance featuring a 4-step exterior concrete stairway leading to a double-leaf glass entry door, an adjacent brick-paved side pathway, a single-sided metal handrail, and an overhanging portico.",
  overallSummary:
    "The entrance exhibits solid structural maintenance but poses substantial physical barriers for wheeled mobility users due to unramped steps at the primary threshold. Low-vision wayfinding is constrained by uniform grey concrete step edges lacking visual contrast. Walking mobility is partially assisted by a single handrail, though uneven jointing in the approach pavers presents a potential trip hazard.",
  findings: [
    {
      id: "demo-wheelchair-1",
      perspective: "wheelchair_access",
      title: "Exterior 4-step stairway at primary entrance without adjacent ramp",
      description:
        "The primary entrance is elevated above grade by four concrete steps. No visible ramp, lift, or grade-level transition is present within the direct line of travel shown in the frame.",
      observedEvidence:
        "Four continuous concrete risers spanning the width of the main portal; adjacent planter wall blocks straight-line bypass.",
      potentialImpact:
        "Creates an absolute barrier for manual and powered wheelchair users attempting to access the main entrance independently.",
      priority: "high",
      confidence: "high",
      recommendation:
        "Assess feasibility of constructing a compliant 1:12 ramp with landings, or install visible directional signage to an alternative step-free entrance if one exists.",
      requiresVerification: true,
      verificationReason:
        "Confirm whether an alternative accessible building entrance exists nearby around the perimeter that is not visible in this photograph.",
      boundingBox: { ymin: 630, xmin: 240, ymax: 870, xmax: 760 },
    },
    {
      id: "demo-wheelchair-2",
      perspective: "wheelchair_access",
      title: "Glazed swing door with potential raised threshold lip",
      description:
        "The double entrance doors appear to be manual pull-type glass leaves with a dark bottom rail resting on a raised door sill.",
      observedEvidence:
        "Horizontal dark frame extrusion at the base of the glass door resting on stone floor, with no automated door operator push-plate visible.",
      potentialImpact:
        "Threshold lips over 6mm can catch small caster wheels, and heavy manual doors can be impassable for users with limited upper-body strength.",
      priority: "medium",
      confidence: "medium",
      recommendation:
        "Evaluate threshold profile to ensure beveled slope under 1:2 ratio and consider installing power-assist push pads or motion sensors.",
      requiresVerification: true,
      verificationReason:
        "Door opening push/pull force and exact vertical threshold height must be measured with a physical force gauge and ruler.",
      boundingBox: { ymin: 420, xmin: 280, ymax: 670, xmax: 460 },
    },
    {
      id: "demo-lowvision-1",
      perspective: "low_vision",
      title: "Lack of visual contrast on stair nosings and tread edges",
      description:
        "The concrete steps have a uniform pale-grey appearance where the horizontal treads and vertical risers blend together without distinguishing markers.",
      observedEvidence:
        "Monolithic grey aggregate concrete across all four steps without colored anti-slip bands, paint, or tactile indicators on edges.",
      potentialImpact:
        "Individuals with low vision, cataracts, or reduced depth perception may misjudge step boundaries and miss their footing.",
      priority: "medium",
      confidence: "high",
      recommendation:
        "Apply a durable 50-75mm high-contrast visual strip (minimum 30% luminance contrast) across the full width of each tread edge.",
      requiresVerification: false,
      verificationReason: null,
      boundingBox: { ymin: 630, xmin: 240, ymax: 870, xmax: 760 },
    },
    {
      id: "demo-lowvision-2",
      perspective: "low_vision",
      title: "Potential solar glare and reflection on entrance glazing",
      description:
        "Direct daylight creates bright reflective highlights across the exterior glass facade, obscuring the interior vestibule.",
      observedEvidence:
        "Strong directional sunlight reflecting clouds and surrounding landscape on the upper two-thirds of the glass panels.",
      potentialImpact:
        "Makes it difficult to identify door handles, distinguish open versus closed transparent panels, or locate interior wayfinding.",
      priority: "low",
      confidence: "medium",
      recommendation:
        "Install continuous manifestations/decals at dual heights (850-1000mm and 1400-1600mm) on the glass and ensure adequate non-glare interior illumination.",
      requiresVerification: true,
      verificationReason:
        "Lighting levels and glare variations across different times of day must be observed under varying weather conditions.",
      boundingBox: { ymin: 240, xmin: 170, ymax: 680, xmax: 480 },
    },
    {
      id: "demo-mobility-1",
      perspective: "mobility",
      title: "Handrail provided on only one side with non-continuous profile",
      description:
        "A single tubular handrail is mounted on the left retaining wall, but no central or right-side handrail is visible.",
      observedEvidence:
        "A wall-mounted painted steel rail on the left wall; open right side with no handhold; rail terminates abruptly at top riser.",
      potentialImpact:
        "People with unilateral weakness, tremor, or balance instability requiring a specific dominant-side grip may lack needed support going up or down.",
      priority: "medium",
      confidence: "high",
      recommendation:
        "Install a matching handrail on the right side and extend both rails horizontally at least 300mm past top and bottom risers.",
      requiresVerification: false,
      verificationReason: null,
      boundingBox: { ymin: 560, xmin: 0, ymax: 960, xmax: 310 },
    },
    {
      id: "demo-mobility-2",
      perspective: "mobility",
      title: "Uneven joints and potential settlement on approach pathway",
      description:
        "The approach surface transitioning toward the stairway features masonry pavers with visible gaps and surface irregularities.",
      observedEvidence:
        "Joint lines in the foreground brick paving show uneven shadows indicating slight vertical displacement between adjacent pavers.",
      potentialImpact:
        "Can catch walking cane tips, crutch ferrules, or foot toes, precipitating slips or falls for people with unsteady gait.",
      priority: "medium",
      confidence: "medium",
      recommendation:
        "Inspect and relevel sunken or heaved pavers to maintain surface variations within 5mm, and sweep polymeric sand into widening joints.",
      requiresVerification: true,
      verificationReason:
        "Measure vertical lippage between adjacent pavers across the walking path with a straightedge.",
      boundingBox: { ymin: 700, xmin: 440, ymax: 1000, xmax: 1000 },
    },
    {
      id: "demo-sensory-1",
      perspective: "sensory_access",
      title: "Hard reflective masonry surfaces under covered portico",
      description:
        "The entrance vestibule overhang is constructed with concrete slabs and stone walls that likely produce elevated acoustic reverberation.",
      observedEvidence:
        "Enclosed semi-outdoor overhang with hard, non-porous ceiling, walls, and floor without sound-dampening architectural elements.",
      potentialImpact:
        "High acoustic reverberation and sharp echo can disorient people who rely on auditory echolocation, and can cause sensory distress for neurodivergent individuals.",
      priority: "low",
      confidence: "low",
      recommendation:
        "Review whether acoustic baffles or absorptive wall panels could be introduced to dampen harsh transit echoes at the building threshold.",
      requiresVerification: true,
      verificationReason:
        "Acoustic reverberation time (RT60) and ambient decibel levels cannot be measured from a still photograph and require physical acoustic metering.",
      boundingBox: { ymin: 70, xmin: 170, ymax: 380, xmax: 650 },
    },
  ],
  topRecommendations: [
    "Prioritize a step-free accessible route to the building portal, either via a 1:12 ramp or clear wayfinding to an alternative entrance.",
    "Apply high-contrast tactile nosing strips (minimum 30% LRV difference) to all step edges to enhance low-vision safety.",
    "Add a continuous right-hand handrail with 300mm horizontal extensions past the top and bottom risers.",
    "Inspect the entrance doorway threshold height and consider installing an automatic push-button door activator.",
  ],
  limitations: [
    "Single camera perspective cannot confirm if an accessible ground-level entrance is located on the building's adjacent wing.",
    "Door opening force, automatic latch sensors, and exact threshold lip dimensions require in-person mechanical measurement.",
    "Ambient acoustic levels and glare conditions shift dynamically throughout the day and cannot be quantified from a single still photo.",
  ],
};

export const DEMO_REASSESSMENT_DATA = {
  overallProgressSummary:
    "The follow-up photograph demonstrates meaningful positive remediation in stair contrast and physical walking support. High-contrast safety nosings and a bilateral right-hand handrail with extensions have been successfully implemented. While the 4 primary entrance steps remain in place, new directional wayfinding now directs wheelchair users to the alternative accessible step-free route.",
  improvedCount: 2,
  stillVisibleCount: 1,
  newlyObservedCount: 1,
  requiresVerificationCount: 3,
  comparisons: [
    {
      id: "comp-1",
      originalFindingId: "demo-lowvision-1",
      perspective: "low_vision" as const,
      title: "High-contrast visual safety nosings on stair edges",
      status: "appears_improved" as const,
      beforeObservation: "Monolithic grey concrete steps without contrast strips or visual delineation between tread and riser.",
      afterObservation: "Continuous bright yellow/white high-visibility nosing bands applied across all four concrete stair tread edges.",
      comparisonEvidence: "Strong luminance contrast is now clearly visible along every step edge, mitigating low-vision missteps.",
      recommendationOrNextStep: "Schedule periodic maintenance to ensure strips maintain strong luminance contrast and slip resistance.",
      requiresVerification: false,
      verificationReason: null,
    },
    {
      id: "comp-2",
      originalFindingId: "demo-mobility-1",
      perspective: "mobility" as const,
      title: "Bilateral handrails with horizontal landing extensions",
      status: "appears_improved" as const,
      beforeObservation: "Single tubular handrail on the left wall terminating abruptly at the top step with no right-hand support.",
      afterObservation: "A matching dark painted steel handrail has been installed on the right side of the stairway with horizontal top and bottom extensions.",
      comparisonEvidence: "Handrail support is now available on both ascent and descent for individuals with unilateral motor weakness.",
      recommendationOrNextStep: "Physically verify rail grasping diameter (32-50mm) and continuous wall clearance.",
      requiresVerification: true,
      verificationReason: "Graspable diameter and wall clearance must be measured with physical calipers.",
    },
    {
      id: "comp-3",
      originalFindingId: "demo-wheelchair-1",
      perspective: "wheelchair_access" as const,
      title: "Exterior 4-step vertical barrier at primary portal",
      status: "still_visible" as const,
      beforeObservation: "Four concrete risers elevate the main library portal above grade without an adjacent ramp.",
      afterObservation: "The physical 4-step concrete barrier remains unaltered at the main entrance facade.",
      comparisonEvidence: "Direct wheelchair ingress via the front steps remains impassable; however, new directional signage to an alternative entrance is now visible nearby.",
      recommendationOrNextStep: "Continue evaluating feasibility of an exterior ramp or mechanical platform lift for direct portal access.",
      requiresVerification: true,
      verificationReason: "Inspect secondary step-free entrance to ensure automatic door operation and clear path width.",
    },
    {
      id: "comp-4",
      originalFindingId: undefined,
      perspective: "wheelchair_access" as const,
      title: "Accessible entrance wayfinding signage",
      status: "newly_observed" as const,
      beforeObservation: "No accessible route directional signage was visible in the exterior approach plaza.",
      afterObservation: "A dedicated blue post-mounted sign displaying the International Symbol of Accessibility and right arrow has been installed.",
      comparisonEvidence: "Clear directional signage now guides visitors toward the accessible entrance pathway around the perimeter.",
      recommendationOrNextStep: "Verify sign mounting height (1200-1600mm) and ensure it remains unobscured by landscaping.",
      requiresVerification: true,
      verificationReason: "Measure sign height, visual contrast, and path surface continuity to the secondary portal.",
    },
    {
      id: "comp-5",
      originalFindingId: "demo-wheelchair-2",
      perspective: "wheelchair_access" as const,
      title: "Door threshold lip and operating push-plate",
      status: "requires_verification" as const,
      beforeObservation: "Raised lower sill extrusion at glass door; no automated actuator plate observed.",
      afterObservation: "Door framing appears structurally similar; potential wall-mounted actuator plate remains outside current camera frame.",
      comparisonEvidence: "Visual inspection alone cannot determine whether power-assist door operator was retrofitted inside the vestibule.",
      recommendationOrNextStep: "Conduct in-person testing of door operating force with an analog force gauge.",
      requiresVerification: true,
      verificationReason: "Opening push/pull force and threshold bevel ratio require physical instrument measurement.",
    },
  ],
  remainingPriorities: [
    "Confirm the secondary accessible entrance path is level, unblocked, and equipped with a working automatic door opener.",
    "Conduct in-person force gauge inspection on the front entry swing door.",
    "Establish routine inspection schedule for the newly applied high-contrast stair nosing strips.",
  ],
  limitations: [
    "Visual assessment cannot confirm whether the newly indicated secondary entrance is unlocked and operational during all public hours.",
    "Slip-resistance coefficient (PTV/DCOF) of the new yellow stair bands requires physical tribometer verification.",
  ],
};
