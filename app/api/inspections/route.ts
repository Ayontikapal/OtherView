import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/appwrite/server";
import { listUserInspections, saveInspectionToAppwrite } from "@/lib/appwrite/inspections";
import { isAppwriteConfigured } from "@/lib/appwrite/config";

export async function GET() {
  try {
    if (!isAppwriteConfigured()) {
      return NextResponse.json(
        {
          error: "APPWRITE_NOT_CONFIGURED",
          message: "Appwrite is not configured. Falling back to local storage.",
        },
        { status: 503 }
      );
    }

    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Sign in required to fetch cloud inspections." },
        { status: 401 }
      );
    }

    const inspections = await listUserInspections(user.$id);
    return NextResponse.json({ success: true, inspections });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("GET /api/inspections error:", err.message);
    return NextResponse.json(
      { error: "FETCH_FAILED", message: err.message || "Failed to list inspections." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAppwriteConfigured()) {
      return NextResponse.json(
        {
          error: "APPWRITE_NOT_CONFIGURED",
          message: "Appwrite is not configured. Falling back to local storage.",
        },
        { status: 503 }
      );
    }

    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Sign in required to save inspections to the cloud." },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!body || !body.analysis) {
      return NextResponse.json(
        { error: "INVALID_PAYLOAD", message: "Missing inspection analysis data." },
        { status: 400 }
      );
    }

    // Save with server-verified user ID
    const saved = await saveInspectionToAppwrite(body, user.$id);
    return NextResponse.json({ success: true, inspection: saved });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("POST /api/inspections error:", err.message);
    return NextResponse.json(
      { error: "SAVE_FAILED", message: err.message || "Failed to save inspection." },
      { status: 500 }
    );
  }
}
