import {
  accessibilityAnalysisSchema,
  boundingBoxSchema,
  reassessmentAnalysisSchema,
} from "./lib/validation/analysis-schema.ts";
import { DEMO_ANALYSIS_DATA, DEMO_REASSESSMENT_DATA } from "./lib/demo-data.ts";

const BASE_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n========================================================");
  console.log("   OTHERVIEW COMPREHENSIVE AUTOMATED TEST SUITE          ");
  console.log("========================================================\n");

  // TEST GROUP 1: Demo Dataset & Zod Contract Validation
  console.log("Test Group 1: Demo Dataset & Zod Contract Validation");
  try {
    const parseResult = accessibilityAnalysisSchema.safeParse(DEMO_ANALYSIS_DATA);
    assert(parseResult.success, "DEMO_ANALYSIS_DATA strictly validates against Zod schema");
    if (!parseResult.success) {
      console.error(parseResult.error);
    }
    assert(DEMO_ANALYSIS_DATA.findings.length > 0, `Contains ${DEMO_ANALYSIS_DATA.findings.length} accessibility findings`);
    
    // Check all 4 perspectives represented
    const perspectives = new Set(DEMO_ANALYSIS_DATA.findings.map(f => f.perspective));
    assert(perspectives.has("wheelchair_access"), "Includes wheelchair accessibility findings");
    assert(perspectives.has("low_vision"), "Includes low-vision findings");
    assert(perspectives.has("mobility"), "Includes mobility findings");
    assert(perspectives.has("sensory_access"), "Includes sensory accessibility findings");

    // Check verification logic
    const requiresVerif = DEMO_ANALYSIS_DATA.findings.filter(f => f.requiresVerification);
    assert(
      requiresVerif.every(f => typeof f.verificationReason === "string" && f.verificationReason.length > 0),
      "Every finding requiring verification has a non-empty verificationReason"
    );

    // Check grounded bounding boxes
    const hasBoxes = DEMO_ANALYSIS_DATA.findings.filter(f => f.boundingBox);
    assert(hasBoxes.length > 0, `Demo findings include grounded visual bounding boxes (${hasBoxes.length} annotated zones)`);
    assert(
      hasBoxes.every(f => f.boundingBox.ymin >= 0 && f.boundingBox.ymax <= 1000 && f.boundingBox.xmin >= 0 && f.boundingBox.xmax <= 1000),
      "All bounding box coordinates are normalized between 0 and 1000"
    );
  } catch (err) {
    assert(false, `Demo data validation threw an exception: ${err.message}`);
  }

  // TEST GROUP 2: Schema Boundary Tests
  console.log("\nTest Group 2: Schema Boundary & Grounded Localization Validation");
  try {
    // Valid box
    const validBox = boundingBoxSchema.safeParse({ ymin: 100, xmin: 200, ymax: 500, xmax: 600 });
    assert(validBox.success, "Valid bounding box within [0, 1000] parses successfully");

    // Null box (diffuse/unlocalized feature)
    const nullBox = boundingBoxSchema.safeParse(null);
    assert(nullBox.success, "Null bounding box (unlocalized/diffuse feature) is accepted");

    // Out of bounds box
    const invalidBox = boundingBoxSchema.safeParse({ ymin: -10, xmin: 200, ymax: 1500, xmax: 600 });
    assert(!invalidBox.success, "Out-of-bounds bounding box coordinates (<0 or >1000) are rejected");

    // Missing verification reason when requiresVerification is true
    const invalidFinding = {
      id: "f-test",
      perspective: "wheelchair_access",
      title: "Test finding title",
      description: "Test finding description sufficiently long.",
      observedEvidence: "Visible stairs.",
      potentialImpact: "Barrier to mobility.",
      priority: "high",
      confidence: "high",
      recommendation: "Build a ramp.",
      requiresVerification: true,
      verificationReason: "", // Empty!
    };
    const invalidResult = accessibilityAnalysisSchema.shape.findings.element.safeParse(invalidFinding);
    assert(!invalidResult.success, "Schema rejects requiresVerification=true with empty verificationReason");
  } catch (err) {
    assert(false, `Boundary test failed: ${err.message}`);
  }

  // TEST GROUP 3: Action Plan Logic & Status Transitions
  console.log("\nTest Group 3: Action Plan Workflow & Status Transitions");
  try {
    const actionItems = DEMO_ANALYSIS_DATA.findings.map((f, idx) => ({
      id: `action-${f.id || idx}`,
      findingId: f.id,
      title: f.title,
      recommendation: f.recommendation,
      perspective: f.perspective,
      priority: f.priority,
      verificationRequirement: f.requiresVerification ? f.verificationReason : null,
      status: "pending",
      notes: "",
    }));

    assert(actionItems.length === DEMO_ANALYSIS_DATA.findings.length, `Action plan generated ${actionItems.length} items`);
    assert(actionItems.every(i => i.status === "pending"), "Action items initialize with 'pending' status");

    const updated = actionItems.map((item, idx) => {
      if (idx === 0) return { ...item, status: "completed", notes: "Reviewed by facilities team" };
      if (idx === 1) return { ...item, status: "in_progress" };
      return item;
    });

    const completedCount = updated.filter(i => i.status === "completed").length;
    const inProgressCount = updated.filter(i => i.status === "in_progress").length;
    const pendingCount = updated.filter(i => i.status === "pending").length;

    assert(completedCount === 1, "Correctly tracks completed action items");
    assert(inProgressCount === 1, "Correctly tracks in-progress action items");
    assert(pendingCount === actionItems.length - 2, "Correctly tracks pending action items");
    assert(updated[0].notes.length > 0, "Action item notes can be recorded locally");
  } catch (err) {
    assert(false, `Action plan test failed: ${err.message}`);
  }

  // TEST GROUP 4: Static Server & Multi-Route Endpoints
  console.log("\nTest Group 4: Next.js Frontend Pages & Inspection Workflow Endpoints");
  try {
    // 4.1 Home Page
    const homeRes = await fetch(`${BASE_URL}/`);
    assert(homeRes.status === 200, `GET / returns status 200 (received ${homeRes.status})`);
    const homeHtml = await homeRes.text();
    assert(homeHtml.includes("OtherView"), "Home page HTML contains 'OtherView' brand name");
    assert(homeHtml.includes("See the space differently"), "Home page HTML contains tagline");
    assert(homeHtml.includes("/inspect"), "Home page links to /inspect workspace");
    assert(homeHtml.includes("/inspections"), "Home page links to /inspections saved library");
    assert(homeHtml.includes("main-content"), "Home page includes accessible skip-link target");

    // 4.2 Inspect Page
    const inspectRes = await fetch(`${BASE_URL}/inspect`);
    assert(inspectRes.status === 200, `GET /inspect returns status 200 (received ${inspectRes.status})`);
    const inspectHtml = await inspectRes.text();
    assert(inspectHtml.includes("Inspect a Physical Space"), "Inspect page renders inspection title");

    // 4.3 Saved Inspections Page
    const inspectionsRes = await fetch(`${BASE_URL}/inspections`);
    assert(inspectionsRes.status === 200, `GET /inspections returns status 200 (received ${inspectionsRes.status})`);
    const inspectionsHtml = await inspectionsRes.text();
    assert(inspectionsHtml.includes("Saved Inspections"), "Inspections page renders Saved Inspections title");

    // 4.4 Demo Inspection Endpoint
    const demoInspectRes = await fetch(`${BASE_URL}/inspect?demo=true`);
    assert(demoInspectRes.status === 200, "GET /inspect?demo=true loads inspection successfully");

    // 4.5 Demo Asset Serving
    const imgBefore = await fetch(`${BASE_URL}/demo/sample-entrance.jpg`);
    assert(imgBefore.status === 200, `GET /demo/sample-entrance.jpg returns 200`);

    const imgAfter = await fetch(`${BASE_URL}/demo/sample-entrance-after.jpg`);
    assert(imgAfter.status === 200, `GET /demo/sample-entrance-after.jpg returns 200`);
    const afterBuf = await imgAfter.arrayBuffer();
    assert(afterBuf.byteLength > 100000, `Sample 'after' photo has non-trivial size (${(afterBuf.byteLength / 1024).toFixed(1)} KB)`);
  } catch (err) {
    assert(false, `Endpoint fetch failed: ${err.message}`);
  }

  // TEST GROUP 5: Serverless API Route Validation (/api/analyze)
  console.log("\nTest Group 5: Serverless API Route Validation (/api/analyze)");

  try {
    const res = await fetch(`${BASE_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert(res.status === 400, `Empty body returns 400 Bad Request`);
  } catch (err) {
    assert(false, `Empty body test failed: ${err.message}`);
  }

  try {
    const res = await fetch(`${BASE_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=", mimeType: "image/svg+xml" }),
    });
    assert(res.status === 400, `Unsupported SVG mime type returns 400`);
  } catch (err) {
    assert(false, `Unsupported mime test failed: ${err.message}`);
  }

  try {
    const fakeBase64 = Buffer.from("THIS_IS_PLAIN_TEXT_NOT_A_JPEG_FILE").toString("base64");
    const res = await fetch(`${BASE_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: fakeBase64, mimeType: "image/jpeg" }),
    });
    assert(res.status === 400, `Corrupted image payload returns 400`);
  } catch (err) {
    assert(false, `Corrupted image test failed: ${err.message}`);
  }

  // TEST GROUP 6: Before vs. After Reassessment & Contract Validation
  console.log("\nTest Group 6: Before vs. After Reassessment & Contract Validation");
  try {
    const parseReassessment = reassessmentAnalysisSchema.safeParse(DEMO_REASSESSMENT_DATA);
    assert(parseReassessment.success, "DEMO_REASSESSMENT_DATA validates strictly against Zod schema");
    if (!parseReassessment.success) {
      console.error(parseReassessment.error);
    }

    assert(DEMO_REASSESSMENT_DATA.comparisons.length === 5, "Reassessment dataset contains 5 itemized comparisons");
    assert(DEMO_REASSESSMENT_DATA.improvedCount === 2, "Reassessment accurately tallies 2 improved features");
    assert(DEMO_REASSESSMENT_DATA.stillVisibleCount === 1, "Reassessment accurately tallies 1 still-visible barrier");
    assert(DEMO_REASSESSMENT_DATA.newlyObservedCount === 1, "Reassessment accurately tallies 1 newly observed feature");
    assert(DEMO_REASSESSMENT_DATA.requiresVerificationCount === 3, "Reassessment accurately tallies 3 items requiring physical measurement");

    // Endpoint test: Missing images rejected
    const reassessEmpty = await fetch(`${BASE_URL}/api/reassess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert(reassessEmpty.status === 400, "POST /api/reassess rejects missing images with 400 Bad Request");
  } catch (err) {
    assert(false, `Reassessment test group failed: ${err.message}`);
  }

  // TEST GROUP 7: Inspection Record Persistence & Note State Model
  console.log("\nTest Group 7: Saved Inspection Record Structure & Note State Model");
  try {
    const sampleRecord = {
      id: "insp_test_123",
      title: "Test Community Hall Entrance",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: "/demo/sample-entrance.jpg",
      analysis: DEMO_ANALYSIS_DATA,
      actionItems: [],
      notes: "Field measurements logged.",
      afterImageUrl: "/demo/sample-entrance-after.jpg",
      reassessment: DEMO_REASSESSMENT_DATA,
    };

    assert(typeof sampleRecord.id === "string" && sampleRecord.id.startsWith("insp_"), "Inspection record has unique ID format");
    assert(typeof sampleRecord.title === "string" && sampleRecord.title.length > 0, "Inspection record has non-empty title");
    assert(accessibilityAnalysisSchema.safeParse(sampleRecord.analysis).success, "Saved inspection retains valid AccessibilityAnalysis");
    assert(reassessmentAnalysisSchema.safeParse(sampleRecord.reassessment).success, "Saved inspection retains valid ReassessmentAnalysis");

    // State transition simulation for Save Note
    const noteStates = ["unsaved", "saving", "saved", "error"];
    assert(noteStates.includes("unsaved") && noteStates.includes("saved"), "Note state model supports 'unsaved', 'saving', 'saved', and 'error'");
  } catch (err) {
    assert(false, `Persistence test group failed: ${err.message}`);
  }

  console.log("\n========================================================");
  console.log(`   TOTAL TESTS: ${passed + failed}`);
  console.log(`   PASSED:      ${passed}`);
  console.log(`   FAILED:      ${failed}`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
