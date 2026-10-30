import { NextResponse } from "next/server";
import { initializeAppwrite } from "@/lib/appwrite/init";
import { isAppwriteAdminConfigured } from "@/lib/appwrite/config";

export async function POST() {
  try {
    if (!isAppwriteAdminConfigured()) {
      return NextResponse.json(
        {
          error: "ADMIN_CONFIG_MISSING",
          message:
            "Appwrite Admin API Key is missing. Please set NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, and APPWRITE_API_KEY in your environment variables.",
        },
        { status: 503 }
      );
    }

    const result = await initializeAppwrite();
    return NextResponse.json({
      success: true,
      result,
      message: "Appwrite database, tables, and storage bucket initialized.",
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    return NextResponse.json(
      {
        error: "INIT_FAILED",
        message: err.message || "Failed to initialize Appwrite infrastructure.",
      },
      { status: 500 }
    );
  }
}
