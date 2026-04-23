import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "SCREENER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, emptyAll } = await req.json();

  if (emptyAll) {
    // Permanently delete all archived screenings
    const archived = await prisma.screening.findMany({
      where: { archivedAt: { not: null } },
      select: { id: true, patientId: true },
    });

    await prisma.screening.deleteMany({
      where: { archivedAt: { not: null } },
    });

    // Delete patients that have no screenings left at all
    for (const s of archived) {
      const remaining = await prisma.screening.count({
        where: { patientId: s.patientId },
      });
      if (remaining === 0) {
        await prisma.patient.delete({ where: { id: s.patientId } }).catch(() => {});
      }
    }

    await createAuditLog({
      actorId: session.userId,
      actionType: "EMPTY_BIN",
      entityType: "System",
      entityId: "bin",
      beforeJson: { count: archived.length } as object,
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({ ok: true, deleted: archived.length });
  }

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const screening = await prisma.screening.findUnique({
    where: { id },
    select: { id: true, patientId: true },
  });
  if (!screening) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.screening.delete({ where: { id } });

  // If patient has no screenings left, delete patient too
  const remaining = await prisma.screening.count({
    where: { patientId: screening.patientId },
  });
  if (remaining === 0) {
    await prisma.patient.delete({ where: { id: screening.patientId } }).catch(() => {});
  }

  await createAuditLog({
    actorId: session.userId,
    actionType: "PERMANENT_DELETE",
    entityType: "Screening",
    entityId: id,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
