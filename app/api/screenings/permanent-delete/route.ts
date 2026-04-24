import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "SCREENER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, patientId, emptyAll } = await req.json();

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

    // Also delete any archived patients with no screenings at all
    const archivedPatients = await prisma.patient.findMany({
      where: { archivedAt: { not: null } },
      select: { id: true },
    });
    for (const p of archivedPatients) {
      await prisma.patient.delete({ where: { id: p.id } }).catch(() => {});
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

  // Single delete — try screening first, fall back to patient
  if (id) {
    const screening = await prisma.screening.findUnique({
      where: { id },
      select: { id: true, patientId: true },
    });

    if (screening) {
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
  }

  // Fall back — delete by patientId directly
  // This handles patients with no screenings
  const pid = patientId || id;
  if (!pid) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Delete all screenings for this patient first
  await prisma.screening.deleteMany({ where: { patientId: pid } }).catch(() => {});

  // Delete the patient
  const deleted = await prisma.patient.delete({ where: { id: pid } }).catch(() => null);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await createAuditLog({
    actorId: session.userId,
    actionType: "PERMANENT_DELETE",
    entityType: "Patient",
    entityId: pid,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
