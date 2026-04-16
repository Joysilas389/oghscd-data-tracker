import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const screening = await prisma.screening.findUnique({
    where: { id },
    include: { patient: true, enteredBy: { select: { fullName: true, cadre: true } } },
  });
  if (!screening) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ screening });
}

const UpdateSchema = z.object({
  screeningDatetime: z.string(),
  screeningType: z.enum(["CATCH_UP", "NEWBORN"]),
  screeningResult: z.string().min(1),
  confirmedTest: z.boolean().default(false),
  confirmedResult: z.string().optional().default(""),
  confirmatoryAction: z.enum(["DONE", "REFERRED", "NONE"]).default("NONE"),
  remarks: z.string().optional().default(""),
  treatmentStarted: z.boolean().default(false),
  treatmentStartDate: z.string().optional(),
  treatmentNotes: z.string().optional().default(""),
  medicationPlan: z.string().optional().default(""),
  referralNotes: z.string().optional().default(""),
  facilityName: z.string().optional().default(""),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.screening.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.role === "SCREENER" && existing.enteredById !== session.userId) {
    return NextResponse.json({ error: "You can only edit your own records" }, { status: 403 });
  }

  if (session.role === "SCREENER" && existing.reviewStatus === "APPROVED") {
    return NextResponse.json({ error: "Approved records cannot be edited" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updated = await prisma.screening.update({
    where: { id },
    data: {
      screeningDatetime: new Date(parsed.data.screeningDatetime),
      screeningType: parsed.data.screeningType,
      screeningResult: parsed.data.screeningResult,
      confirmedTest: parsed.data.confirmedTest,
      confirmedResult: parsed.data.confirmedResult,
      confirmatoryAction: parsed.data.confirmatoryAction,
      remarks: parsed.data.remarks,
      treatmentStarted: parsed.data.treatmentStarted,
      treatmentStartDate: parsed.data.treatmentStartDate ? new Date(parsed.data.treatmentStartDate) : null,
      treatmentNotes: parsed.data.treatmentNotes,
      medicationPlan: parsed.data.medicationPlan,
      referralNotes: parsed.data.referralNotes,
      facilityName: parsed.data.facilityName,
      reviewStatus: "PENDING",
    },
  });

  await createAuditLog({
    actorId: session.userId,
    actionType: "EDIT_SCREENING",
    entityType: "Screening",
    entityId: id,
    beforeJson: existing as object,
    afterJson: updated as object,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.screening.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.role === "SCREENER" && existing.enteredById !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.screening.update({
    where: { id },
    data: { archivedAt: new Date() },
  });

  await createAuditLog({
    actorId: session.userId,
    actionType: "ARCHIVE_SCREENING",
    entityType: "Screening",
    entityId: id,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
