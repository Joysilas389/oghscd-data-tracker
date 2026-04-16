import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword, createAuditLog } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/ratelimit";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const limit = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({
        error: `Too many login attempts. Try again in ${Math.ceil(limit.resetIn / 60000)} minutes.`
      }, { status: 429 });
    }

    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json({
        error: `Account locked. Try again in ${mins} minute(s).`
      }, { status: 429 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      const fails = user.failedLogins + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLogins: fails,
          lockedUntil: fails >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
        },
      });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    session.role = user.role as "SCREENER" | "MANAGER" | "ADMIN";
    session.fullName = user.fullName;
    session.facilityName = user.facilityName;
    await session.save();

    await createAuditLog({
      actorId: user.id,
      actionType: "LOGIN",
      entityType: "User",
      entityId: user.id,
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
