import { SavedInspection, ActionPlanItem, ReassessmentAnalysis } from "@/types/analysis";

const DB_NAME = "otherview_db";
const DB_VERSION = 1;
const STORE_NAME = "inspections";

/**
 * Check if IndexedDB is available in the current environment
 */
export function isIndexedDBAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.indexedDB !== "undefined"
  );
}

/**
 * Open or initialize the OtherView IndexedDB database
 */
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error("IndexedDB is not supported in this browser environment."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error("Failed to open IndexedDB database."));
    };
  });
}

/**
 * Save or update a complete inspection record in IndexedDB
 */
export async function saveInspectionToDB(inspection: SavedInspection): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const record: SavedInspection = {
        ...inspection,
        updatedAt: new Date().toISOString(),
      };

      const request = store.put(record);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error || new Error("Failed to save inspection record to IndexedDB."));
      };

      transaction.onabort = () => {
        reject(transaction.error || new Error("Transaction aborted while saving inspection."));
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Retrieve a specific inspection by its ID
 */
export async function getInspectionFromDB(id: string): Promise<SavedInspection | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error || new Error(`Failed to retrieve inspection ${id}.`));
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Retrieve all saved inspections, sorted with newest first
 */
export async function getAllInspectionsFromDB(): Promise<SavedInspection[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results: SavedInspection[] = request.result || [];
        // Sort descending by updatedAt
        results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        resolve(results);
      };

      request.onerror = () => {
        reject(request.error || new Error("Failed to retrieve inspections list."));
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Delete an inspection record and associated data
 */
export async function deleteInspectionFromDB(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error || new Error(`Failed to delete inspection ${id}.`));
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Update general inspection notes on an existing inspection
 */
export async function updateInspectionNotesInDB(id: string, notes: string): Promise<void> {
  const existing = await getInspectionFromDB(id);
  if (!existing) {
    throw new Error(`Cannot update notes: Inspection ${id} not found.`);
  }

  existing.notes = notes;
  existing.updatedAt = new Date().toISOString();
  await saveInspectionToDB(existing);
}

/**
 * Update action items checklist state on an existing inspection
 */
export async function updateActionItemsInDB(id: string, actionItems: ActionPlanItem[]): Promise<void> {
  const existing = await getInspectionFromDB(id);
  if (!existing) {
    throw new Error(`Cannot update action plan: Inspection ${id} not found.`);
  }

  existing.actionItems = actionItems;
  existing.updatedAt = new Date().toISOString();
  await saveInspectionToDB(existing);
}

/**
 * Update reassessment follow-up results on an existing inspection
 */
export async function updateReassessmentInDB(
  id: string,
  afterImageUrl: string,
  reassessment: ReassessmentAnalysis
): Promise<void> {
  const existing = await getInspectionFromDB(id);
  if (!existing) {
    throw new Error(`Cannot update reassessment: Inspection ${id} not found.`);
  }

  existing.afterImageUrl = afterImageUrl;
  existing.reassessment = reassessment;
  existing.updatedAt = new Date().toISOString();
  await saveInspectionToDB(existing);
}
