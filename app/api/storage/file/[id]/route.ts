import { NextRequest, NextResponse } from "next/server";
import { getPrivateImageBuffer } from "@/lib/appwrite/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "FILE_ID_MISSING" }, { status: 400 });
    }

    const { buffer, mimeType } = await getPrivateImageBuffer(id);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    // Never expose stack trace or details
    return NextResponse.json(
      {
        error: "ACCESS_DENIED",
        message: "Image unavailable or insufficient permissions.",
      },
      { status: 403 }
    );
  }
}
