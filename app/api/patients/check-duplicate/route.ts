import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { generateMatchHash } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { firstName, lastName, dateOfBirth, phoneNumber } = await req.json();
  if (!firstName || !lastName || !dateOfBirth) {
    return NextResponse.json({ duplicate: false });
  }

  const matchHash = generateMatchHash(firstName, lastName, dateOfBirth, phoneNumber || "");

  const existing = await prisma.patient.findFirst({
    where: { matchHash, archivedAt: null },
    include: {
      screenings: {
        where: { archivedAt: null },
        orderBy: { screeningDatetime: "desc" },
        take: 5,
        select: {
          id: true,
          screeningDatetime: true,
          screeningType: true,
          screeningResult: true,
          treatmentStarted: true,
          reviewStatus: true,
        },
      },
    },
  });

  if (!existing) return NextResponse.json({ duplicate: false });

  return NextResponse.json({
    duplicate: true,
    patient: {
      id: existing.id,
      patientCode: existing.patientCode,
      firstName: existing.firstName,
      lastName: existing.lastName,
      dateOfBirth: existing.dateOfBirth,
      sex: existing.sex,
      screenings: existing.screenings,
    },
  });
}
