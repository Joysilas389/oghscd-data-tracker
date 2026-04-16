import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/ratelimit";

const Schema = z.object({
  fullName: z.string().min(2).max(100),
  cadre: z.string().min(1),
  facilityName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP - max 5 registrations per hour
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const limit = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({
        error: "Too many registration attempts. Try again in 1 hour."
      }, { status: 429 });
    }

    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { fullName, cadre, facilityName, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.create({
      data: { fullName, cadre, facilityName, email, passwordHash, role: "SCREENER" },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
