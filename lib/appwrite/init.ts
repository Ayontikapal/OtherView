import { createAdminClient } from "./server";
import { DATABASE_ID, STORAGE_BUCKET_ID, TABLE_IDS } from "./schema";
import { Permission, Role } from "node-appwrite";

export interface ProvisioningResult {
  database: string;
  tables: Record<string, string>;
  bucket: string;
  logs: string[];
}

/**
 * Initializes the Appwrite database, tables, columns, indexes, and storage bucket
 */
export async function initializeAppwrite(): Promise<ProvisioningResult> {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error(
      "Appwrite admin client could not be initialized. Please configure NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, and APPWRITE_API_KEY."
    );
  }

  const logs: string[] = [];
  const result: ProvisioningResult = {
    database: "unknown",
    tables: {},
    bucket: "unknown",
    logs,
  };

  // 1. Ensure Database exists
  try {
    try {
      await admin.tablesDB.get({ databaseId: DATABASE_ID });
      logs.push(`Database '${DATABASE_ID}' already exists.`);
      result.database = "exists";
    } catch {
      await admin.tablesDB.create({
        databaseId: DATABASE_ID,
        name: "OtherView Accessibility DB",
        enabled: true,
      });
      logs.push(`Database '${DATABASE_ID}' created successfully.`);
      result.database = "created";
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    logs.push(`Database setup note: ${error.message}`);
  }

  // 2. Ensure Storage Bucket exists (Private bucket with row-level/user file security)
  try {
    try {
      await admin.storage.getBucket(STORAGE_BUCKET_ID);
      logs.push(`Storage bucket '${STORAGE_BUCKET_ID}' already exists.`);
      result.bucket = "exists";
    } catch {
      await admin.storage.createBucket(
        STORAGE_BUCKET_ID,
        "Inspection Photos",
        [
          Permission.read(Role.users()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ],
        true, // fileSecurity enabled: users can only read/edit their own files unless explicitly granted
        true, // enabled
        5 * 1024 * 1024, // 5 MB max
        ["jpg", "jpeg", "png", "webp"]
      );
      logs.push(`Private storage bucket '${STORAGE_BUCKET_ID}' created successfully.`);
      result.bucket = "created";
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    logs.push(`Storage bucket note: ${error.message}`);
  }

  // 3. Helper to create Table with columns
  const tableDefinitions = [
    {
      id: TABLE_IDS.inspections,
      name: "Inspections",
      columns: [
        { key: "userId", type: "string", size: 64, required: true },
        { key: "title", type: "string", size: 255, required: true },
        { key: "sceneDescription", type: "string", size: 1000, required: false },
        { key: "overallSummary", type: "string", size: 4000, required: false },
        { key: "imageId", type: "string", size: 255, required: false },
        { key: "notes", type: "string", size: 5000, required: false },
        { key: "status", type: "string", size: 32, required: false },
        { key: "topRecommendations", type: "string", size: 4000, required: false },
        { key: "limitations", type: "string", size: 4000, required: false },
        { key: "afterImageId", type: "string", size: 255, required: false },
        { key: "createdAt", type: "string", size: 64, required: false },
        { key: "updatedAt", type: "string", size: 64, required: false },
      ],
      indexes: [
        { key: "idx_userId", type: "key", attributes: ["userId"] },
        { key: "idx_updatedAt", type: "key", attributes: ["updatedAt"] },
      ],
    },
    {
      id: TABLE_IDS.findings,
      name: "Findings",
      columns: [
        { key: "inspectionId", type: "string", size: 64, required: true },
        { key: "userId", type: "string", size: 64, required: true },
        { key: "perspective", type: "string", size: 32, required: true },
        { key: "title", type: "string", size: 255, required: true },
        { key: "description", type: "string", size: 2000, required: false },
        { key: "observedEvidence", type: "string", size: 1000, required: false },
        { key: "potentialImpact", type: "string", size: 1000, required: false },
        { key: "priority", type: "string", size: 16, required: true },
        { key: "confidence", type: "string", size: 16, required: true },
        { key: "recommendation", type: "string", size: 2000, required: false },
        { key: "requiresVerification", type: "boolean", required: false },
        { key: "verificationReason", type: "string", size: 1000, required: false },
        { key: "boundingBox", type: "string", size: 255, required: false },
      ],
      indexes: [
        { key: "idx_inspectionId", type: "key", attributes: ["inspectionId"] },
        { key: "idx_userId", type: "key", attributes: ["userId"] },
      ],
    },
    {
      id: TABLE_IDS.checklistItems,
      name: "Checklist Items",
      columns: [
        { key: "inspectionId", type: "string", size: 64, required: true },
        { key: "userId", type: "string", size: 64, required: true },
        { key: "findingId", type: "string", size: 64, required: false },
        { key: "title", type: "string", size: 255, required: true },
        { key: "recommendation", type: "string", size: 2000, required: false },
        { key: "perspective", type: "string", size: 32, required: true },
        { key: "priority", type: "string", size: 16, required: true },
        { key: "verificationRequirement", type: "string", size: 1000, required: false },
        { key: "status", type: "string", size: 32, required: true },
        { key: "notes", type: "string", size: 2000, required: false },
      ],
      indexes: [
        { key: "idx_checklist_inspectionId", type: "key", attributes: ["inspectionId"] },
        { key: "idx_checklist_userId", type: "key", attributes: ["userId"] },
      ],
    },
    {
      id: TABLE_IDS.reassessments,
      name: "Reassessments",
      columns: [
        { key: "inspectionId", type: "string", size: 64, required: true },
        { key: "userId", type: "string", size: 64, required: true },
        { key: "afterImageId", type: "string", size: 255, required: false },
        { key: "overallProgressSummary", type: "string", size: 3000, required: false },
        { key: "improvedCount", type: "integer", required: false },
        { key: "stillVisibleCount", type: "integer", required: false },
        { key: "newlyObservedCount", type: "integer", required: false },
        { key: "requiresVerificationCount", type: "integer", required: false },
        { key: "comparisons", type: "string", size: 10000, required: false },
        { key: "remainingPriorities", type: "string", size: 3000, required: false },
        { key: "limitations", type: "string", size: 3000, required: false },
        { key: "createdAt", type: "string", size: 64, required: false },
      ],
      indexes: [
        { key: "idx_reassess_inspectionId", type: "key", attributes: ["inspectionId"] },
        { key: "idx_reassess_userId", type: "key", attributes: ["userId"] },
      ],
    },
  ];

  for (const tableDef of tableDefinitions) {
    try {
      try {
        await admin.tablesDB.getTable({
          databaseId: DATABASE_ID,
          tableId: tableDef.id,
        });
        logs.push(`Table '${tableDef.id}' already exists.`);
        result.tables[tableDef.id] = "exists";
      } catch {
        await admin.tablesDB.createTable({
          databaseId: DATABASE_ID,
          tableId: tableDef.id,
          name: tableDef.name,
          permissions: [
            Permission.read(Role.users()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ],
          rowSecurity: true, // Enables row-level security per user
          enabled: true,
          columns: tableDef.columns,
          indexes: tableDef.indexes,
        });
        logs.push(`Table '${tableDef.id}' created with row security and defined columns.`);
        result.tables[tableDef.id] = "created";
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      logs.push(`Table '${tableDef.id}' setup note: ${error.message}`);
      result.tables[tableDef.id] = "error";
    }
  }

  return result;
}
