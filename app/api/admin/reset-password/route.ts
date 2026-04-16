import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const Schema = z.object({
  userId: z.string(),
  newPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const hash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { passwordHash: hash, failedLogins: 0, lockedUntil: null },
  });

  return NextResponse.json({ ok: true });
}
