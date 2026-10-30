import { ID, Query, Permission, Role } from "node-appwrite";
import { createSessionClient } from "./server";
import { DATABASE_ID, TABLE_IDS } from "./schema";
import {
  SavedInspection,
  ActionPlanItem,
  ReassessmentAnalysis,
  AccessibilityFinding,
  FindingComparison,
} from "@/types/analysis";
import { deletePrivateImage } from "./storage";

/**
 * Persists an inspection record and its normalized child entities to Appwrite TablesDB
 */
export async function saveInspectionToAppwrite(
  inspection: SavedInspection,
  userId: string
): Promise<SavedInspection> {
  const session = await createSessionClient();
  if (!session) {
    throw new Error("Active session required to save inspection to Appwrite Cloud.");
  }

  const now = new Date().toISOString();
  const inspectionId = inspection.id || `insp_${Date.now()}`;

  // User-only permissions
  const permissions = [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];

  // 1. Upsert Inspection Row
  const inspectionData = {
    userId,
    title: inspection.title.trim() || "Physical Environment Inspection",
    sceneDescription: inspection.analysis.sceneDescription || "",
    overallSummary: inspection.analysis.overallSummary || "",
    imageId: inspection.imageUrl || "",
    notes: inspection.notes || "",
    status: "completed",
    topRecommendations: JSON.stringify(inspection.analysis.topRecommendations || []),
    limitations: JSON.stringify(inspection.analysis.limitations || []),
    afterImageId: inspection.afterImageUrl || "",
    createdAt: inspection.createdAt || now,
    updatedAt: now,
  };

  try {
    await session.tablesDB.upsertRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_IDS.inspections,
      rowId: inspectionId,
      data: inspectionData,
      permissions,
    });
  } catch {
    // If TablesDB upsertRow is not available on legacy collection, fall back to update or create
    try {
      await session.tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_IDS.inspections,
        rowId: inspectionId,
        data: inspectionData,
        permissions,
      });
    } catch {
      await session.tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_IDS.inspections,
        rowId: inspectionId,
        data: inspectionData,
        permissions,
      });
    }
  }

  // 2. Persist Findings
  if (inspection.analysis.findings && inspection.analysis.findings.length > 0) {
    // Clean up existing findings for this inspection before rewriting
    try {
      const existingFindings = await session.tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_IDS.findings,
        queries: [
          Query.equal("inspectionId", inspectionId),
          Query.equal("userId", userId),
          Query.limit(100),
        ],
      });

      for (const row of existingFindings.rows) {
        try {
          await session.tablesDB.deleteRow({
            databaseId: DATABASE_ID,
            tableId: TABLE_IDS.findings,
            rowId: row.$id,
          });
        } catch {
          // ignore individual delete failure
        }
      }
    } catch {
      // ignore list failure
    }

    // Insert current findings
    for (const f of inspection.analysis.findings) {
      const findingRowId = ID.unique();
      try {
        await session.tablesDB.createRow({
          databaseId: DATABASE_ID,
          tableId: TABLE_IDS.findings,
          rowId: findingRowId,
          data: {
            inspectionId,
            userId,
            perspective: f.perspective,
            title: f.title,
            description: f.description,
            observedEvidence: f.observedEvidence,
            potentialImpact: f.potentialImpact,
            priority: f.priority,
            confidence: f.confidence,
            recommendation: f.recommendation,
            requiresVerification: !!f.requiresVerification,
            verificationReason: f.verificationReason || null,
            boundingBox: f.boundingBox ? JSON.stringify(f.boundingBox) : null,
          },
          permissions,
        });
      } catch (err) {
        console.warn("Failed to write finding row:", err);
      }
    }
  }

  // 3. Persist Checklist Items
  if (inspection.actionItems && inspection.actionItems.length > 0) {
    try {
      const existingItems = await session.tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_IDS.checklistItems,
        queries: [
          Query.equal("inspectionId", inspectionId),
          Query.equal("userId", userId),
          Query.limit(100),
        ],
      });

      for (const row of existingItems.rows) {
        try {
          await session.tablesDB.deleteRow({
            databaseId: DATABASE_ID,
            tableId: TABLE_IDS.checklistItems,
            rowId: row.$id,
          });
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }

    for (const item of inspection.actionItems) {
      try {
        await session.tablesDB.createRow({
          databaseId: DATABASE_ID,
          tableId: TABLE_IDS.checklistItems,
          rowId: ID.unique(),
          data: {
            inspectionId,
            userId,
            findingId: item.findingId || "",
            title: item.title,
            recommendation: item.recommendation,
            perspective: item.perspective,
            priority: item.priority,
            verificationRequirement: item.verificationRequirement || null,
            status: item.status,
            notes: item.notes || "",
          },
          permissions,
        });
      } catch (err) {
        console.warn("Failed to write checklist row:", err);
      }
    }
  }

  // 4. Persist Reassessment if present
  if (inspection.reassessment) {
    const reassess = inspection.reassessment;
    try {
      const existingReassess = await session.tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_IDS.reassessments,
        queries: [
          Query.equal("inspectionId", inspectionId),
          Query.equal("userId", userId),
          Query.limit(10),
        ],
      });

      for (const row of existingReassess.rows) {
        try {
          await session.tablesDB.deleteRow({
            databaseId: DATABASE_ID,
            tableId: TABLE_IDS.reassessments,
            rowId: row.$id,
          });
        } catch {
          // ignore
        }
      }

      await session.tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_IDS.reassessments,
        rowId: ID.unique(),
        data: {
          inspectionId,
          userId,
          afterImageId: inspection.afterImageUrl || "",
          overallProgressSummary: reassess.overallProgressSummary,
          improvedCount: reassess.improvedCount,
          stillVisibleCount: reassess.stillVisibleCount,
          newlyObservedCount: reassess.newlyObservedCount,
          requiresVerificationCount: reassess.requiresVerificationCount,
          comparisons: JSON.stringify(reassess.comparisons || []),
          remainingPriorities: JSON.stringify(reassess.remainingPriorities || []),
          limitations: JSON.stringify(reassess.limitations || []),
          createdAt: now,
        },
        permissions,
      });
    } catch (err) {
      console.warn("Failed to write reassessment row:", err);
    }
  }

  return {
    ...inspection,
    id: inspectionId,
    updatedAt: now,
  };
}

/**
 * Retrieves all inspections owned by the current authenticated user
 */
export async function listUserInspections(userId: string): Promise<SavedInspection[]> {
  const session = await createSessionClient();
  if (!session) {
    throw new Error("Active session required to fetch inspections.");
  }

  const response = await session.tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_IDS.inspections,
    queries: [
      Query.equal("userId", userId),
      Query.orderDesc("updatedAt"),
      Query.limit(100),
    ],
  });

  const list: SavedInspection[] = [];

  for (const row of response.rows) {
    // Parse JSON array strings safely
    let topRecommendations: string[] = [];
    let limitations: string[] = [];

    try {
      if (row.topRecommendations) topRecommendations = JSON.parse(row.topRecommendations);
    } catch {
      topRecommendations = [];
    }

    try {
      if (row.limitations) limitations = JSON.parse(row.limitations);
    } catch {
      limitations = [];
    }

    // Basic reconstruction for list view (detailed child rows fetched on open)
    const inspection: SavedInspection = {
      id: row.$id,
      title: row.title || "Physical Environment Inspection",
      createdAt: row.createdAt || row.$createdAt,
      updatedAt: row.updatedAt || row.$updatedAt,
      imageUrl: row.imageId || "",
      notes: row.notes || "",
      afterImageUrl: row.afterImageId || null,
      analysis: {
        sceneDescription: row.sceneDescription || "",
        overallSummary: row.overallSummary || "",
        findings: [],
        topRecommendations,
        limitations,
      },
      actionItems: [],
      reassessment: null,
    };

    list.push(inspection);
  }

  return list;
}

/**
 * Retrieves a single complete inspection, verifying ownership
 */
export async function getInspectionById(
  inspectionId: string,
  userId: string
): Promise<SavedInspection | null> {
  const session = await createSessionClient();
  if (!session) {
    throw new Error("Active session required.");
  }

  // 1. Fetch Inspection Row
  let inspRow;
  try {
    inspRow = await session.tablesDB.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_IDS.inspections,
      rowId: inspectionId,
    });
  } catch {
    return null;
  }

  // CRITICAL OWNERSHIP CHECK
  if (inspRow.userId !== userId) {
    throw new Error("FORBIDDEN: You do not have permission to view this inspection.");
  }

  // 2. Fetch Findings
  const findingsRows = await session.tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_IDS.findings,
    queries: [
      Query.equal("inspectionId", inspectionId),
      Query.equal("userId", userId),
      Query.limit(100),
    ],
  });

  const findings: AccessibilityFinding[] = findingsRows.rows.map((r) => {
    let boundingBox = null;
    if (r.boundingBox) {
      try {
        boundingBox = JSON.parse(r.boundingBox);
      } catch {
        boundingBox = null;
      }
    }

    return {
      id: r.$id,
      perspective: r.perspective as AccessibilityFinding["perspective"],
      title: r.title,
      description: r.description || "",
      observedEvidence: r.observedEvidence || "",
      potentialImpact: r.potentialImpact || "",
      priority: r.priority as AccessibilityFinding["priority"],
      confidence: r.confidence as AccessibilityFinding["confidence"],
      recommendation: r.recommendation || "",
      requiresVerification: !!r.requiresVerification,
      verificationReason: r.verificationReason || null,
      boundingBox,
    };
  });

  // 3. Fetch Checklist Items
  const checklistRows = await session.tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_IDS.checklistItems,
    queries: [
      Query.equal("inspectionId", inspectionId),
      Query.equal("userId", userId),
      Query.limit(100),
    ],
  });

  const actionItems: ActionPlanItem[] = checklistRows.rows.map((r) => ({
    id: r.$id,
    findingId: r.findingId || undefined,
    title: r.title,
    recommendation: r.recommendation || "",
    perspective: r.perspective as ActionPlanItem["perspective"],
    priority: r.priority as ActionPlanItem["priority"],
    verificationRequirement: r.verificationRequirement || null,
    status: r.status as ActionPlanItem["status"],
    notes: r.notes || "",
  }));

  // 4. Fetch Reassessment if present
  let reassessment: ReassessmentAnalysis | null = null;
  try {
    const reassessRows = await session.tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_IDS.reassessments,
      queries: [
        Query.equal("inspectionId", inspectionId),
        Query.equal("userId", userId),
        Query.limit(1),
      ],
    });

    if (reassessRows.rows.length > 0) {
      const r = reassessRows.rows[0];
      let comparisons: FindingComparison[] = [];
      let remainingPriorities: string[] = [];
      let limitations: string[] = [];

      try {
        if (r.comparisons) comparisons = JSON.parse(r.comparisons);
      } catch {}

      try {
        if (r.remainingPriorities) remainingPriorities = JSON.parse(r.remainingPriorities);
      } catch {}

      try {
        if (r.limitations) limitations = JSON.parse(r.limitations);
      } catch {}

      reassessment = {
        overallProgressSummary: r.overallProgressSummary || "",
        improvedCount: Number(r.improvedCount || 0),
        stillVisibleCount: Number(r.stillVisibleCount || 0),
        newlyObservedCount: Number(r.newlyObservedCount || 0),
        requiresVerificationCount: Number(r.requiresVerificationCount || 0),
        comparisons,
        remainingPriorities,
        limitations,
      };
    }
  } catch (err) {
    console.warn("Failed to fetch reassessment:", err);
  }

  // Parse JSON fields
  let topRecommendations: string[] = [];
  let limitations: string[] = [];
  try {
    if (inspRow.topRecommendations) topRecommendations = JSON.parse(inspRow.topRecommendations);
  } catch {}
  try {
    if (inspRow.limitations) limitations = JSON.parse(inspRow.limitations);
  } catch {}

  return {
    id: inspRow.$id,
    title: inspRow.title || "Physical Environment Inspection",
    createdAt: inspRow.createdAt || inspRow.$createdAt,
    updatedAt: inspRow.updatedAt || inspRow.$updatedAt,
    imageUrl: inspRow.imageId || "",
    notes: inspRow.notes || "",
    afterImageUrl: inspRow.afterImageId || null,
    analysis: {
      sceneDescription: inspRow.sceneDescription || "",
      overallSummary: inspRow.overallSummary || "",
      findings,
      topRecommendations,
      limitations,
    },
    actionItems,
    reassessment,
  };
}

/**
 * Updates an inspection's title, notes, and/or checklist items, verifying ownership
 */
export async function updateInspectionMetadata(
  inspectionId: string,
  userId: string,
  updates: {
    title?: string;
    notes?: string;
    actionItems?: ActionPlanItem[];
    afterImageUrl?: string;
    reassessment?: ReassessmentAnalysis;
  }
): Promise<void> {
  const session = await createSessionClient();
  if (!session) throw new Error("Active session required.");

  // Ownership verification
  const existing = await session.tablesDB.getRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_IDS.inspections,
    rowId: inspectionId,
  });

  if (existing.userId !== userId) {
    throw new Error("FORBIDDEN: You do not own this inspection.");
  }

  const patchData: Record<string, string | number | boolean> = {
    updatedAt: new Date().toISOString(),
  };

  if (typeof updates.title === "string") patchData.title = updates.title.trim();
  if (typeof updates.notes === "string") patchData.notes = updates.notes;
  if (typeof updates.afterImageUrl === "string") patchData.afterImageId = updates.afterImageUrl;

  await session.tablesDB.updateRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_IDS.inspections,
    rowId: inspectionId,
    data: patchData,
  });

  // Update checklist items if provided
  if (updates.actionItems) {
    for (const item of updates.actionItems) {
      try {
        await session.tablesDB.upsertRow({
          databaseId: DATABASE_ID,
          tableId: TABLE_IDS.checklistItems,
          rowId: item.id,
          data: {
            inspectionId,
            userId,
            findingId: item.findingId || "",
            title: item.title,
            recommendation: item.recommendation,
            perspective: item.perspective,
            priority: item.priority,
            verificationRequirement: item.verificationRequirement || null,
            status: item.status,
            notes: item.notes || "",
          },
        });
      } catch {
        // ignore individual item upsert error
      }
    }
  }

  // Update reassessment if provided
  if (updates.reassessment) {
    const reassess = updates.reassessment;
    const now = new Date().toISOString();
    try {
      await session.tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_IDS.reassessments,
        rowId: ID.unique(),
        data: {
          inspectionId,
          userId,
          afterImageId: updates.afterImageUrl || existing.afterImageId || "",
          overallProgressSummary: reassess.overallProgressSummary,
          improvedCount: reassess.improvedCount,
          stillVisibleCount: reassess.stillVisibleCount,
          newlyObservedCount: reassess.newlyObservedCount,
          requiresVerificationCount: reassess.requiresVerificationCount,
          comparisons: JSON.stringify(reassess.comparisons || []),
          remainingPriorities: JSON.stringify(reassess.remainingPriorities || []),
          limitations: JSON.stringify(reassess.limitations || []),
          createdAt: now,
        },
      });
    } catch (err) {
      console.warn("Failed to update reassessment:", err);
    }
  }
}

/**
 * Deletes an inspection and all child records and files, verifying ownership
 */
export async function deleteInspectionFromAppwrite(
  inspectionId: string,
  userId: string
): Promise<void> {
  const session = await createSessionClient();
  if (!session) throw new Error("Active session required.");

  // Ownership verification
  const existing = await session.tablesDB.getRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_IDS.inspections,
    rowId: inspectionId,
  });

  if (existing.userId !== userId) {
    throw new Error("FORBIDDEN: You do not own this inspection.");
  }

  // 1. Delete Findings
  try {
    const findings = await session.tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_IDS.findings,
      queries: [
        Query.equal("inspectionId", inspectionId),
        Query.equal("userId", userId),
        Query.limit(100),
      ],
    });
    for (const r of findings.rows) {
      await session.tablesDB.deleteRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_IDS.findings,
        rowId: r.$id,
      });
    }
  } catch {}

  // 2. Delete Checklist Items
  try {
    const items = await session.tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_IDS.checklistItems,
      queries: [
        Query.equal("inspectionId", inspectionId),
        Query.equal("userId", userId),
        Query.limit(100),
      ],
    });
    for (const r of items.rows) {
      await session.tablesDB.deleteRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_IDS.checklistItems,
        rowId: r.$id,
      });
    }
  } catch {}

  // 3. Delete Reassessments
  try {
    const reassess = await session.tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_IDS.reassessments,
      queries: [
        Query.equal("inspectionId", inspectionId),
        Query.equal("userId", userId),
        Query.limit(10),
      ],
    });
    for (const r of reassess.rows) {
      await session.tablesDB.deleteRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_IDS.reassessments,
        rowId: r.$id,
      });
    }
  } catch {}

  // 4. Delete Storage Files if applicable
  if (existing.imageId && existing.imageId.startsWith("/api/storage/file/")) {
    const fileId = existing.imageId.replace("/api/storage/file/", "");
    await deletePrivateImage(fileId);
  }
  if (existing.afterImageId && existing.afterImageId.startsWith("/api/storage/file/")) {
    const fileId = existing.afterImageId.replace("/api/storage/file/", "");
    await deletePrivateImage(fileId);
  }

  // 5. Delete Parent Inspection Row
  await session.tablesDB.deleteRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_IDS.inspections,
    rowId: inspectionId,
  });
}
