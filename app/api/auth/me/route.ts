import { NextResponse } from "next/server";
import { getUnifiedUser } from "@/lib/auth/unified-auth";

export async function GET() {
  const user = await getUnifiedUser();

  return NextResponse.json({
    user: user
      ? {
          $id: user.$id,
          email: user.email,
          name: user.name,
          source: user.source,
        }
      : null,
    isConfigured: true,
  });
}
