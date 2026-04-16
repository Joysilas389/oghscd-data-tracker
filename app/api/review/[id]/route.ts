import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/auth";
import { z } from "zod";

const Schema = z.object({
  action: z.enum(["APPROVED", "FLAGGED", "CORRECTED"]),
  note: z.string().optional().default(""),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "SCREENER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { action, note } = parsed.data;

  const screening = await prisma.screening.findUnique({ where: { id } });
  if (!screening) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.screening.update({
    where: { id },
    data: {
      reviewStatus: action,
      reviewNote: note || null,
      reviewedById: session.userId,
      reviewedAt: new Date(),
    },
  });

  await createAuditLog({
    actorId: session.userId,
    actionType: `REVIEW_${action}`,
    entityType: "Screening",
    entityId: id,
    afterJson: { reviewStatus: action, note },
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
