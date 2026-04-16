import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { sendEmail, passwordResetEmailHtml } from "@/lib/email";
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
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { email: true, fullName: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const hash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { passwordHash: hash, failedLogins: 0, lockedUntil: null },
  });

  try {
    await sendEmail({
      to: user.email,
      subject: "Your OGH SCD E-Tracker password has been reset",
      html: passwordResetEmailHtml(user.fullName, parsed.data.newPassword),
    });
  } catch (emailErr) {
    console.warn("Reset email failed:", emailErr);
  }

  return NextResponse.json({ ok: true });
}
