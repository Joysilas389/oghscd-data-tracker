import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/auth";
import { z } from "zod";

const Schema = z.object({ userId: z.string() });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  if (parsed.data.userId === session.userId) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { role: true, fullName: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await createAuditLog({
    actorId: session.userId,
    actionType: "DELETE",
    entityType: "User",
    entityId: parsed.data.userId,
    ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
    afterJson: { deletedUser: user.fullName, role: user.role },
  });

  await prisma.user.delete({ where: { id: parsed.data.userId } });

  return NextResponse.json({ ok: true });
}
