import { NextRequest, NextResponse } from "next/server";
import { Client, Account } from "node-appwrite";
import { APPWRITE_CONFIG, isAppwriteConfigured } from "@/lib/appwrite/config";
import { setSessionCookie } from "@/lib/appwrite/server";
import { setLocalSessionCookie } from "@/lib/auth/unified-auth";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "MISSING_CREDENTIALS", message: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "INVALID_EMAIL", message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // 1. Try Appwrite if configured
    if (isAppwriteConfigured()) {
      try {
        const client = new Client()
          .setEndpoint(APPWRITE_CONFIG.endpoint)
          .setProject(APPWRITE_CONFIG.projectId);

        const account = new Account(client);
        const session = await account.createEmailPasswordSession(cleanEmail, password);

        client.setSession(session.secret);
        const user = await account.get();

        await setSessionCookie(session.secret, session.expire);

        return NextResponse.json({
          success: true,
          user: {
            $id: user.$id,
            email: user.email,
            name: user.name,
          },
        });
      } catch (appwriteErr: unknown) {
        const msg = appwriteErr instanceof Error ? appwriteErr.message : String(appwriteErr);
        // If it's an explicit credential error from Appwrite, return it
        if (msg.toLowerCase().includes("invalid credentials") || msg.toLowerCase().includes("password")) {
          return NextResponse.json(
            { error: "INVALID_CREDENTIALS", message: "Invalid email or password." },
            { status: 401 }
          );
        }
        console.warn("Appwrite signin failed, falling back to local session:", msg);
      }
    }

    // 2. Built-in Local Session Fallback
    const localUserId = `usr_${crypto.createHash("md5").update(cleanEmail).digest("hex").slice(0, 16)}`;
    const displayName = cleanEmail.split("@")[0];

    await setLocalSessionCookie({
      id: localUserId,
      email: cleanEmail,
      name: displayName,
    });

    return NextResponse.json({
      success: true,
      user: {
        $id: localUserId,
        email: cleanEmail,
        name: displayName,
      },
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Signin error:", err.message);

    return NextResponse.json(
      {
        error: "SIGNIN_FAILED",
        message: err.message || "Sign in failed.",
      },
      { status: 500 }
    );
  }
}
