import { NextRequest, NextResponse } from "next/server";
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
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "MISSING_CREDENTIALS", message: "Email and password are required." },
        { status: 400 }
      );
    }

    const client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);

    const account = new Account(client);

    // Create session
    const session = await account.createEmailPasswordSession(email.trim(), password);

    // Read user details with the newly established session
    client.setSession(session.secret);
    const user = await account.get();

    // Store in HTTP-only cookie
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
    console.error("Signin error:", err.message);

    return NextResponse.json(
      {
        error: "SIGNIN_FAILED",
        message: err.message || "Invalid email or password.",
      },
      { status: 401 }
    );
  }
}
