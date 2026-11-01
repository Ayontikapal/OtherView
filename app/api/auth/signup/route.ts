import { NextRequest, NextResponse } from "next/server";
import { ID, Client, Account } from "node-appwrite";
import { APPWRITE_CONFIG, isAppwriteConfigured } from "@/lib/appwrite/config";
import { setSessionCookie } from "@/lib/appwrite/server";
import { setLocalSessionCookie } from "@/lib/auth/unified-auth";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
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

    const trimmedName = typeof name === "string" ? name.trim() : cleanEmail.split("@")[0];

    // 1. Try Appwrite if configured
    if (isAppwriteConfigured()) {
      try {
        const client = new Client()
          .setEndpoint(APPWRITE_CONFIG.endpoint)
          .setProject(APPWRITE_CONFIG.projectId);

        const account = new Account(client);
        const userId = ID.unique();
        const user = await account.create(userId, cleanEmail, password, trimmedName || undefined);
        const session = await account.createEmailPasswordSession(cleanEmail, password);

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
        if (msg.toLowerCase().includes("already exists")) {
          return NextResponse.json(
            { error: "USER_EXISTS", message: "An account with this email already exists." },
            { status: 409 }
          );
        }
        console.warn("Appwrite signup failed, creating local session:", msg);
      }
    }

    // 2. Built-in Local Session Fallback
    const localUserId = `usr_${crypto.createHash("md5").update(cleanEmail).digest("hex").slice(0, 16)}`;

    await setLocalSessionCookie({
      id: localUserId,
      email: cleanEmail,
      name: trimmedName,
    });

    return NextResponse.json({
      success: true,
      user: {
        $id: localUserId,
        email: cleanEmail,
        name: trimmedName,
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
      { status: 500 }
    );
  }
}
