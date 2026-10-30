import { NextResponse } from "next/server";
import { createSessionClient, clearSessionCookie } from "@/lib/appwrite/server";

export async function POST() {
  try {
    const session = await createSessionClient();
    if (session) {
      try {
        await session.account.deleteSession("current");
      } catch {
        // Session may already be expired or invalid on the server
      }
    }

    await clearSessionCookie();

    return NextResponse.json({ success: true, message: "Signed out successfully." });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Signout error:", err.message);
    await clearSessionCookie();
    return NextResponse.json({ success: true, message: "Session cleared." });
  }
}
