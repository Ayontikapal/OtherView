import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/appwrite/server";
import {
  getInspectionById,
  updateInspectionMetadata,
  deleteInspectionFromAppwrite,
} from "@/lib/appwrite/inspections";
import { isAppwriteConfigured } from "@/lib/appwrite/config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAppwriteConfigured()) {
      return NextResponse.json(
        { error: "APPWRITE_NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Sign in required to view cloud inspection." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const inspection = await getInspectionById(id, user.$id);

    if (!inspection) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Inspection not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, inspection });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (err.message.includes("FORBIDDEN")) {
      return NextResponse.json(
        { error: "FORBIDDEN", message: "You do not have permission to view this inspection." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "FETCH_FAILED", message: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAppwriteConfigured()) {
      return NextResponse.json(
        { error: "APPWRITE_NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Sign in required to update inspection." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    await updateInspectionMetadata(id, user.$id, body);
    return NextResponse.json({ success: true, message: "Inspection updated." });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (err.message.includes("FORBIDDEN")) {
      return NextResponse.json(
        { error: "FORBIDDEN", message: "You do not have permission to modify this inspection." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "UPDATE_FAILED", message: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAppwriteConfigured()) {
      return NextResponse.json(
        { error: "APPWRITE_NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Sign in required to delete inspection." },
        { status: 401 }
      );
    }

    const { id } = await params;
    await deleteInspectionFromAppwrite(id, user.$id);

    return NextResponse.json({
      success: true,
      message: "Inspection and associated resources deleted.",
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (err.message.includes("FORBIDDEN")) {
      return NextResponse.json(
        { error: "FORBIDDEN", message: "You do not have permission to delete this inspection." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "DELETE_FAILED", message: err.message },
      { status: 500 }
    );
  }
}
