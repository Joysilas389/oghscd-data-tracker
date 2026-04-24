import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (q.length < 2) return NextResponse.json({ patients: [] });

  const patients = await prisma.patient.findMany({
    where: {
      archivedAt: null,
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { patientCode: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      patientCode: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      sex: true,
    },
    take: 10,
  });

  return NextResponse.json({ patients });
}
