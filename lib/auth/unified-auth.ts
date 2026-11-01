import { cookies } from "next/headers";
import { getAuthenticatedUser } from "@/lib/appwrite/server";
import { isAppwriteConfigured } from "@/lib/appwrite/config";
import crypto from "crypto";

export interface UnifiedUser {
  $id: string;
  email: string;
  name?: string;
  source?: "cloud" | "local";
}

const LOCAL_SESSION_COOKIE = "otherview_local_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "otherview_dev_secret_key_849204";

/**
 * Creates a signed local session token containing user details
 */
export function createLocalSessionToken(user: { id: string; email: string; name?: string }): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name || user.email.split("@")[0],
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}

/**
 * Verifies and decodes a signed local session token
 */
export function verifyLocalSessionToken(token: string): UnifiedUser | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const json = Buffer.from(data, "base64url").toString("utf-8");
    const payload = JSON.parse(json);

    if (payload.expiresAt && payload.expiresAt < Date.now()) {
      return null;
    }

    return {
      $id: payload.id,
      email: payload.email,
      name: payload.name,
      source: "local",
    };
  } catch {
    return null;
  }
}

/**
 * Sets a local session cookie
 */
export async function setLocalSessionCookie(user: { id: string; email: string; name?: string }): Promise<void> {
  const cookieStore = await cookies();
  const token = createLocalSessionToken(user);

  cookieStore.set(LOCAL_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

/**
 * Clears the local session cookie
 */
export async function clearLocalSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(LOCAL_SESSION_COOKIE);
}

/**
 * Universally retrieves the authenticated user from Appwrite (if available) or local session
 */
export async function getUnifiedUser(): Promise<UnifiedUser | null> {
  // 1. Check Appwrite if configured
  if (isAppwriteConfigured()) {
    try {
      const appwriteUser = await getAuthenticatedUser();
      if (appwriteUser) {
        return {
          $id: appwriteUser.$id,
          email: appwriteUser.email,
          name: appwriteUser.name,
          source: "cloud",
        };
      }
    } catch {
      // Fall through to local session
    }
  }

  // 2. Check Local Cookie Session
  try {
    const cookieStore = await cookies();
    const localCookie = cookieStore.get(LOCAL_SESSION_COOKIE);
    if (localCookie?.value) {
      return verifyLocalSessionToken(localCookie.value);
    }
  } catch {
    // Ignore cookie read failure
  }

  return null;
}
