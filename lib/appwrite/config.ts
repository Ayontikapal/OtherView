/**
 * Appwrite configuration and environment variables helper
 */

export const APPWRITE_CONFIG = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  apiKey: process.env.APPWRITE_API_KEY || "",
  databaseId: process.env.APPWRITE_DATABASE_ID || "otherview_db",
  storageBucketId: process.env.APPWRITE_STORAGE_BUCKET_ID || "inspection_images",
  // TablesDB Table Identifiers
  tables: {
    inspections: "inspections",
    findings: "findings",
    checklistItems: "checklist_items",
    reassessments: "reassessments",
  },
  sessionCookieName: "appwrite-session",
} as const;

/**
 * Checks if the minimal public configuration for Appwrite is provided
 */
export function isAppwriteConfigured(): boolean {
  return (
    typeof APPWRITE_CONFIG.endpoint === "string" &&
    APPWRITE_CONFIG.endpoint.trim().length > 0 &&
    typeof APPWRITE_CONFIG.projectId === "string" &&
    APPWRITE_CONFIG.projectId.trim().length > 0 &&
    APPWRITE_CONFIG.projectId !== "YOUR_PROJECT_ID"
  );
}

/**
 * Checks if the server admin configuration (API Key) is provided
 */
export function isAppwriteAdminConfigured(): boolean {
  return (
    isAppwriteConfigured() &&
    typeof APPWRITE_CONFIG.apiKey === "string" &&
    APPWRITE_CONFIG.apiKey.trim().length > 0 &&
    APPWRITE_CONFIG.apiKey !== "YOUR_SERVER_API_KEY"
  );
}
