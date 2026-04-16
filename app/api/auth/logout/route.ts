import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAuditLog } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  const userId = session.userId;
  session.destroy();
  if (userId) {
    await createAuditLog({
      actorId: userId,
      actionType: "LOGOUT",
      entityType: "User",
      entityId: userId,
      ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
    });
  }
  return NextResponse.json({ ok: true });
}
