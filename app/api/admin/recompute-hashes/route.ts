import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { generateMatchHash } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const patients = await prisma.patient.findMany({
    select: { id: true, firstName: true, lastName: true, dateOfBirth: true },
  });

  let updated = 0;
  for (const p of patients) {
    const newHash = generateMatchHash(
      p.firstName,
      p.lastName,
      p.dateOfBirth.toISOString().slice(0, 10),
      "" // no phone number in hash anymore
    );
    await prisma.patient.update({
      where: { id: p.id },
      data: { matchHash: newHash },
    });
    updated++;
  }

  return NextResponse.json({ ok: true, updated });
}
