import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

// Link two patients as siblings (bidirectional)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { patientId, siblingId, multipleBirthType } = await req.json();

  if (!patientId || !siblingId) {
    return NextResponse.json({ error: "Both patientId and siblingId required" }, { status: 400 });
  }
  if (patientId === siblingId) {
    return NextResponse.json({ error: "Cannot link patient to themselves" }, { status: 400 });
  }

  // Create both directions
  await prisma.patientSibling.createMany({
    data: [
      { patientId, siblingId },
      { patientId: siblingId, siblingId: patientId },
    ],
    skipDuplicates: true,
  });

  // Mark both as multiple birth
  await prisma.patient.updateMany({
    where: { id: { in: [patientId, siblingId] } },
    data: {
      isMultipleBirth: true,
      multipleBirthType: multipleBirthType || null,
    },
  });

  return NextResponse.json({ ok: true });
}

// Remove sibling link
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { patientId, siblingId } = await req.json();

  // Remove both directions
  await prisma.patientSibling.deleteMany({
    where: {
      OR: [
        { patientId, siblingId },
        { patientId: siblingId, siblingId: patientId },
      ],
    },
  });

  // Check if each patient still has siblings — if not unmark multiple birth
  for (const id of [patientId, siblingId]) {
    const remaining = await prisma.patientSibling.count({ where: { patientId: id } });
    if (remaining === 0) {
      await prisma.patient.update({
        where: { id },
        data: { isMultipleBirth: false, multipleBirthType: null },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
