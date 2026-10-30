import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/appwrite/server";
import { isAppwriteConfigured } from "@/lib/appwrite/config";

export async function GET() {
  const configured = isAppwriteConfigured();

  if (!configured) {
    return NextResponse.json({
      user: null,
      isConfigured: false,
    });
  }

  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({
      user: null,
      isConfigured: true,
    });
  }

  return NextResponse.json({
    user: {
      $id: user.$id,
      email: user.email,
      name: user.name,
    },
    isConfigured: true,
  });
}
