import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAuditLog } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ ok: false });

  const body = await req.json();
  const method = body.method || "UNKNOWN";

  await createAuditLog({
    actorId: session.userId,
    actionType: "SCREENSHOT_ATTEMPTED",
    entityType: "System",
    entityId: "screenshot",
    beforeJson: { method, page: req.headers.get("referer") || "unknown" } as object,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
