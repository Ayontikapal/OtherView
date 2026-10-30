import { NextRequest, NextResponse } from "next/server";
import { uploadPrivateImage } from "@/lib/appwrite/storage";
import { getAuthenticatedUser } from "@/lib/appwrite/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Sign in required to upload photos." },
        { status: 401 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let buffer: Buffer | null = null;
    let filename = `photo-${Date.now()}.jpg`;
    let mimeType = "image/jpeg";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "NO_FILE", message: "No file provided in form data." },
          { status: 400 }
        );
      }
      filename = file.name || filename;
      mimeType = file.type || mimeType;
      const ab = await file.arrayBuffer();
      buffer = Buffer.from(ab);
    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      const { image, name, mimeType: declaredMime } = body;
      if (!image || typeof image !== "string") {
        return NextResponse.json(
          { error: "NO_IMAGE", message: "No image payload provided." },
          { status: 400 }
        );
      }
      filename = name || filename;
      mimeType = declaredMime || mimeType;
      const cleanBase64 = image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      buffer = Buffer.from(cleanBase64, "base64");
    } else {
      return NextResponse.json(
        { error: "UNSUPPORTED_MEDIA_TYPE", message: "Use multipart/form-data or application/json." },
        { status: 415 }
      );
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json(
        { error: "EMPTY_FILE", message: "Image buffer is empty." },
        { status: 400 }
      );
    }

    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "FILE_TOO_LARGE", message: "File exceeds 5 MB limit." },
        { status: 413 }
      );
    }

    const result = await uploadPrivateImage(buffer, filename);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Storage upload error:", err.message);
    return NextResponse.json(
      { error: "UPLOAD_FAILED", message: err.message || "Failed to upload image." },
      { status: 500 }
    );
  }
}
