import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "SCREENER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const screening = await prisma.screening.findUnique({
    where: { id },
    include: { patient: true },
  });
  if (!screening) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Restore screening
  await prisma.screening.update({
    where: { id },
    data: { archivedAt: null, reviewStatus: "PENDING" },
  });

  // Restore patient if also archived
  if (screening.patient.archivedAt) {
    await prisma.patient.update({
      where: { id: screening.patientId },
      data: { archivedAt: null },
    });
  }

  await createAuditLog({
    actorId: session.userId,
    actionType: "RESTORE",
    entityType: "Screening",
    entityId: id,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
