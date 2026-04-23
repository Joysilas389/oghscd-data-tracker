import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/auth";
import { z } from "zod";

const Schema = z.object({
  ids: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "SCREENER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { ids } = parsed.data;

  // Only approve PENDING or FLAGGED records
  const screenings = await prisma.screening.findMany({
    where: {
      id: { in: ids },
      archivedAt: null,
      reviewStatus: { in: ["PENDING", "FLAGGED"] },
    },
  });

  if (screenings.length === 0) {
    return NextResponse.json({ error: "No eligible records found" }, { status: 400 });
  }

  await prisma.screening.updateMany({
    where: { id: { in: screenings.map(s => s.id) } },
    data: {
      reviewStatus: "APPROVED",
      reviewNote: null,
      reviewedAt: new Date(),
      reviewedById: session.userId,
    },
  });

  // Audit log for each
  await Promise.all(
    screenings.map(s =>
      createAuditLog({
        actorId: session.userId,
        actionType: "APPROVE",
        entityType: "Screening",
        entityId: s.id,
        ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      })
    )
  );

  return NextResponse.json({ ok: true, approved: screenings.length });
}
