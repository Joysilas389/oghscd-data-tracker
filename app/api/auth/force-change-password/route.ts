import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { hashPassword, createAuditLog } from "@/lib/auth";
import { z } from "zod";

const Schema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  if (parsed.data.newPassword !== parsed.data.confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }

  const hash = await hashPassword(parsed.data.newPassword);

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      passwordHash: hash,
      mustChangePassword: false,
      failedLogins: 0,
      lockedUntil: null,
    },
  });

  await createAuditLog({
    actorId: session.userId,
    actionType: "FORCE_PASSWORD_CHANGE",
    entityType: "User",
    entityId: session.userId,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
