import { SavedInspection, ActionPlanItem, ReassessmentAnalysis } from "@/types/analysis";
import {
  saveInspectionToDB,
  getInspectionFromDB,
  getAllInspectionsFromDB,
  deleteInspectionFromDB,
  updateInspectionNotesInDB,
  updateActionItemsInDB,
  updateReassessmentInDB,
  isIndexedDBAvailable,
} from "./indexed-db";

export type StorageSource = "cloud" | "local" | "demo";

export interface UnifiedSaveResult {
  success: boolean;
  source: StorageSource;
  error?: string;
}

/**
 * Universal Inspection Service that coordinates Appwrite Cloud and local IndexedDB
 */
export class InspectionService {
  /**
   * Save an inspection to Appwrite Cloud (if logged in) or IndexedDB (if guest/offline)
   */
  static async saveInspection(
    inspection: SavedInspection,
    isAuthenticated: boolean
  ): Promise<UnifiedSaveResult> {
    const updatedInspection: SavedInspection = {
      ...inspection,
      updatedAt: new Date().toISOString(),
    };

    // 1. If user is authenticated, attempt Cloud save first
    if (isAuthenticated) {
      try {
        const res = await fetch("/api/inspections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedInspection),
        });

        if (res.ok) {
          const data = await res.json();
          // Keep local IndexedDB in sync as fallback cache
          if (isIndexedDBAvailable()) {
            await saveInspectionToDB(data.inspection || updatedInspection).catch(() => {});
          }
          return { success: true, source: "cloud" };
        } else {
          const err = await res.json();
          console.warn("Cloud save failed, falling back to local storage:", err.message);
        }
      } catch (cloudErr) {
        console.warn("Network error during cloud save, falling back to local:", cloudErr);
      }
    }

    // 2. Local fallback save in IndexedDB
    try {
      if (isIndexedDBAvailable()) {
        await saveInspectionToDB(updatedInspection);
        return { success: true, source: "local" };
      }
      return { success: false, source: "local", error: "Browser storage not available" };
    } catch (localErr: unknown) {
      const err = localErr instanceof Error ? localErr : new Error(String(localErr));
      return { success: false, source: "local", error: err.message };
    }
  }

  /**
   * Retrieve a specific inspection by ID from Cloud or Local
   */
  static async getInspection(
    id: string,
    isAuthenticated: boolean
  ): Promise<{ inspection: SavedInspection | null; source: StorageSource }> {
    // 1. Try Cloud if authenticated
    if (isAuthenticated) {
      try {
        const res = await fetch(`/api/inspections/${id}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.inspection) {
            // Update local cache
            if (isIndexedDBAvailable()) {
              await saveInspectionToDB(data.inspection).catch(() => {});
            }
            return { inspection: data.inspection, source: "cloud" };
          }
        }
      } catch {
        // Fall back to local
      }
    }

    // 2. Try IndexedDB
    try {
      if (isIndexedDBAvailable()) {
        const local = await getInspectionFromDB(id);
        if (local) {
          return { inspection: local, source: "local" };
        }
      }
    } catch {
      // not found
    }

    return { inspection: null, source: "local" };
  }

  /**
   * Retrieve all saved inspections
   */
  static async getAllInspections(
    isAuthenticated: boolean,
    userId?: string
  ): Promise<{ inspections: SavedInspection[]; source: StorageSource; hasLocalOnly?: boolean }> {
    let cloudList: SavedInspection[] = [];
    let localList: SavedInspection[] = [];

    // Read local list
    if (isIndexedDBAvailable()) {
      try {
        localList = await getAllInspectionsFromDB(userId);
      } catch {
        localList = [];
      }
    }

    // Read cloud list if authenticated
    if (isAuthenticated) {
      try {
        const res = await fetch("/api/inspections", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          cloudList = data.inspections || [];

          // Check if there are local-only inspections that can be synced to cloud
          const cloudIds = new Set(cloudList.map((i) => i.id));
          const hasLocalOnly = localList.some((l) => !cloudIds.has(l.id) && !l.isDemo);

          return {
            inspections: cloudList,
            source: "cloud",
            hasLocalOnly,
          };
        }
      } catch {
        // Fall back to local list
      }
    }

    return {
      inspections: localList,
      source: "local",
      hasLocalOnly: false,
    };
  }

  /**
   * Delete an inspection across Cloud and Local
   */
  static async deleteInspection(id: string, isAuthenticated: boolean): Promise<boolean> {
    let success = false;

    // Delete in cloud
    if (isAuthenticated) {
      try {
        const res = await fetch(`/api/inspections/${id}`, { method: "DELETE" });
        if (res.ok) success = true;
      } catch {}
    }

    // Delete in local
    if (isIndexedDBAvailable()) {
      try {
        await deleteInspectionFromDB(id);
        success = true;
      } catch {}
    }

    return success;
  }

  /**
   * Update notes on an inspection
   */
  static async updateNotes(
    id: string,
    notes: string,
    isAuthenticated: boolean
  ): Promise<boolean> {
    if (isAuthenticated) {
      try {
        const res = await fetch(`/api/inspections/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes }),
        });
        if (res.ok) {
          if (isIndexedDBAvailable()) {
            await updateInspectionNotesInDB(id, notes).catch(() => {});
          }
          return true;
        }
      } catch {}
    }

    if (isIndexedDBAvailable()) {
      try {
        await updateInspectionNotesInDB(id, notes);
        return true;
      } catch {}
    }

    return false;
  }

  /**
   * Update action checklist items
   */
  static async updateActionItems(
    id: string,
    actionItems: ActionPlanItem[],
    isAuthenticated: boolean
  ): Promise<boolean> {
    if (isAuthenticated) {
      try {
        const res = await fetch(`/api/inspections/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actionItems }),
        });
        if (res.ok) {
          if (isIndexedDBAvailable()) {
            await updateActionItemsInDB(id, actionItems).catch(() => {});
          }
          return true;
        }
      } catch {}
    }

    if (isIndexedDBAvailable()) {
      try {
        await updateActionItemsInDB(id, actionItems);
        return true;
      } catch {}
    }

    return false;
  }

  /**
   * Update reassessment results
   */
  static async updateReassessment(
    id: string,
    afterImageUrl: string,
    reassessment: ReassessmentAnalysis,
    isAuthenticated: boolean
  ): Promise<boolean> {
    if (isAuthenticated) {
      try {
        const res = await fetch(`/api/inspections/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ afterImageUrl, reassessment }),
        });
        if (res.ok) {
          if (isIndexedDBAvailable()) {
            await updateReassessmentInDB(id, afterImageUrl, reassessment).catch(() => {});
          }
          return true;
        }
      } catch {}
    }

    if (isIndexedDBAvailable()) {
      try {
        await updateReassessmentInDB(id, afterImageUrl, reassessment);
        return true;
      } catch {}
    }

    return false;
  }

  /**
   * Syncs existing browser IndexedDB inspections into Appwrite Cloud
   */
  static async syncLocalInspectionsToCloud(isAuthenticated: boolean): Promise<number> {
    if (!isAuthenticated || !isIndexedDBAvailable()) return 0;

    let synced = 0;
    try {
      const localList = await getAllInspectionsFromDB();
      for (const item of localList) {
        if (item.isDemo) continue; // Skip demo sample records
        const res = await fetch("/api/inspections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        if (res.ok) synced++;
      }
    } catch (err) {
      console.error("Failed to sync local inspections to cloud:", err);
    }
    return synced;
  }
}
