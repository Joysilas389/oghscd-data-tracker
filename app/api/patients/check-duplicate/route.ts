import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { generateMatchHash, duplicateScore } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { firstName, lastName, dateOfBirth, phoneNumber } = await req.json();
  if (!firstName || !lastName || !dateOfBirth) {
    return NextResponse.json({ duplicate: false });
  }

  const screeningInclude = {
    where: { archivedAt: null },
    orderBy: { screeningDatetime: "desc" as const },
    take: 5,
    select: {
      id: true,
      screeningDatetime: true,
      screeningType: true,
      screeningResult: true,
      treatmentStarted: true,
      reviewStatus: true,
    },
  };

  // ── Layer 1: Exact hash match (name + DOB) ──────────────────────────────
  const matchHash = generateMatchHash(firstName, lastName, dateOfBirth, "");
  const exactMatch = await prisma.patient.findFirst({
    where: { matchHash, archivedAt: null },
    include: { screenings: screeningInclude },
  });

  if (exactMatch) {
    return NextResponse.json({
      duplicate: true,
      confidence: 100,
      reason: "Exact match on name and date of birth",
      patient: formatPatient(exactMatch),
    });
  }

  // ── Layers 2-5: Fuzzy matching against all active patients ─────────────
  // Fetch candidates — same year of birth to limit scope
  const dobYear = new Date(dateOfBirth).getFullYear();
  const candidates = await prisma.patient.findMany({
    where: {
      archivedAt: null,
      dateOfBirth: {
        gte: new Date(`${dobYear - 1}-01-01`),
        lte: new Date(`${dobYear + 1}-12-31`),
      },
    },
    include: { screenings: screeningInclude },
  });

  // Score each candidate
  let bestMatch = null;
  let bestScore = 0;

  for (const candidate of candidates) {
    const score = duplicateScore(
      firstName, lastName, dateOfBirth, phoneNumber || "",
      candidate.firstName, candidate.lastName,
      candidate.dateOfBirth.toISOString().slice(0, 10),
      candidate.phoneNumber || ""
    );

    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
    }
  }

  // ── Threshold: 70+ = possible duplicate, 90+ = likely duplicate ────────
  if (bestScore >= 70 && bestMatch) {
    const confidence = bestScore;
    let reason = "";

    if (bestScore >= 95) {
      reason = "Very likely the same person — name and date of birth are nearly identical";
    } else if (bestScore >= 85) {
      reason = "Likely the same person — strong name and date of birth similarity";
    } else if (bestScore >= 70) {
      reason = "Possible duplicate — similar name or date of birth detected";
    }

    return NextResponse.json({
      duplicate: true,
      confidence,
      reason,
      patient: formatPatient(bestMatch),
    });
  }

  // ── Layer 5: Phone number cross-check ──────────────────────────────────
  if (phoneNumber && phoneNumber.replace(/\D/g, "").length >= 9) {
    const phone = phoneNumber.replace(/\D/g, "").slice(-9);
    const phoneMatch = await prisma.patient.findFirst({
      where: {
        archivedAt: null,
        phoneNumber: { endsWith: phone },
      },
      include: { screenings: screeningInclude },
    });

    if (phoneMatch) {
      return NextResponse.json({
        duplicate: true,
        confidence: 60,
        reason: "Same phone number found on an existing patient record",
        patient: formatPatient(phoneMatch),
      });
    }
  }

  return NextResponse.json({ duplicate: false });
}

function formatPatient(p: any) {
  return {
    id: p.id,
    patientCode: p.patientCode,
    firstName: p.firstName,
    lastName: p.lastName,
    dateOfBirth: p.dateOfBirth,
    sex: p.sex,
    screenings: p.screenings,
  };
}
