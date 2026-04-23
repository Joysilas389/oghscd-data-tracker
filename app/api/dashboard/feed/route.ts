import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const screenings = await prisma.screening.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      patient: { select: { firstName: true, lastName: true, patientCode: true, locality: true } },
    },
  });

  const items = screenings.map(s => ({
    id: s.id,
    patientName: `${s.patient.firstName} ${s.patient.lastName}`,
    patientCode: s.patient.patientCode,
    result: s.screeningResult,
    locality: s.patient.locality || "",
    createdAt: s.createdAt.toISOString(),
  }));

  return NextResponse.json({ items });
}
