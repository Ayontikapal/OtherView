import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { Client, Account } from "node-appwrite";
import { APPWRITE_CONFIG, isAppwriteConfigured } from "@/lib/appwrite/config";
import { setSessionCookie } from "@/lib/appwrite/server";

export async function POST(request: NextRequest) {
  try {
    if (!isAppwriteConfigured()) {
      return NextResponse.json(
        {
          error: "APPWRITE_NOT_CONFIGURED",
          message:
            "Appwrite Cloud project is not configured. Please add NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT_ID to your environment variables.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "INVALID_EMAIL", message: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        {
          error: "INVALID_PASSWORD",
          message: "Password must be at least 8 characters long.",
        },
        { status: 400 }
      );
    }

    const trimmedName = typeof name === "string" ? name.trim() : "";

    // Client for unauthenticated user creation
    const client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);

    const account = new Account(client);

    // Create user in Appwrite
    const userId = ID.unique();
    const user = await account.create(userId, email.trim(), password, trimmedName || undefined);

    // Create session
    const session = await account.createEmailPasswordSession(email.trim(), password);

    // Set HTTP-only session cookie
    await setSessionCookie(session.secret, session.expire);

    return NextResponse.json({
      success: true,
      user: {
        $id: user.$id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Signup error:", err.message);

    return NextResponse.json(
      {
        error: "SIGNUP_FAILED",
        message: err.message || "Failed to create account. Please check your credentials.",
      },
      { status: 400 }
    );
  }
}
