import { ID, Permission, Role } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { createSessionClient, createAdminClient, getAuthenticatedUser } from "./server";
import { STORAGE_BUCKET_ID } from "./schema";

export interface UploadResult {
  fileId: string;
  url: string;
  name: string;
  sizeOriginal: number;
}

/**
 * Uploads an image buffer to the private Appwrite storage bucket
 */
export async function uploadPrivateImage(
  buffer: Buffer,
  filename: string
): Promise<UploadResult> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("Authentication required to upload inspection images.");
  }

  const session = await createSessionClient();
  if (!session) {
    throw new Error("Unable to establish Appwrite storage session.");
  }

  const fileId = ID.unique();
  const inputFile = InputFile.fromBuffer(buffer, filename || `photo-${Date.now()}.jpg`);

  // Restrict access: only the authenticated user can read or delete their file
  const permissions = [
    Permission.read(Role.user(user.$id)),
    Permission.update(Role.user(user.$id)),
    Permission.delete(Role.user(user.$id)),
  ];

  const file = await session.storage.createFile({
    bucketId: STORAGE_BUCKET_ID,
    fileId,
    file: inputFile,
    permissions,
  });

  return {
    fileId: file.$id,
    url: `/api/storage/file/${file.$id}`,
    name: file.name,
    sizeOriginal: file.sizeOriginal,
  };
}

/**
 * Retrieves the raw image buffer of a private file from Appwrite Storage
 */
export async function getPrivateImageBuffer(fileId: string): Promise<{
  buffer: Buffer;
  mimeType: string;
  filename: string;
}> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("Authentication required to view private inspection images.");
  }

  const session = await createSessionClient();
  if (!session) {
    throw new Error("Unable to establish Appwrite session.");
  }

  // Get file metadata first (verifies permission)
  const meta = await session.storage.getFile({
    bucketId: STORAGE_BUCKET_ID,
    fileId,
  });

  // Download binary content
  const arrayBuffer = await session.storage.getFileDownload({
    bucketId: STORAGE_BUCKET_ID,
    fileId,
  });

  return {
    buffer: Buffer.from(arrayBuffer),
    mimeType: meta.mimeType || "image/jpeg",
    filename: meta.name || `${fileId}.jpg`,
  };
}

/**
 * Deletes a private file from Appwrite Storage
 */
export async function deletePrivateImage(fileId: string): Promise<void> {
  const session = await createSessionClient();
  if (!session) {
    // Attempt admin client as cleanup fallback if session client is unavailable
    const admin = createAdminClient();
    if (admin) {
      try {
        await admin.storage.deleteFile({ bucketId: STORAGE_BUCKET_ID, fileId });
      } catch {
        // Silently handle if already removed
      }
    }
    return;
  }

  try {
    await session.storage.deleteFile({
      bucketId: STORAGE_BUCKET_ID,
      fileId,
    });
  } catch {
    // If not found or already deleted, don't throw
  }
}
