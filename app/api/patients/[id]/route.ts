import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/auth";
import { z } from "zod";

const UpdatePatientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  sex: z.enum(["MALE", "FEMALE", "OTHER"]),
  dateOfBirth: z.string().min(1),
  phoneNumber: z.string().default(""),
  ethnicity: z.string().optional().default(""),
  nhisStatus: z.enum(["NONE", "ACTIVE", "EXPIRED"]).default("NONE"),
  address: z.string().optional().default(""),
  district: z.string().optional().default(""),
  locality: z.string().optional().default(""),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.patient.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Screener can only edit patients they created
  if (session.role === "SCREENER" && existing.createdById !== session.userId) {
    return NextResponse.json({ error: "You can only edit patients you registered" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = UpdatePatientSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updated = await prisma.patient.update({
    where: { id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      sex: parsed.data.sex,
      dateOfBirth: new Date(parsed.data.dateOfBirth),
      phoneNumber: parsed.data.phoneNumber,
      ethnicity: parsed.data.ethnicity,
      nhisStatus: parsed.data.nhisStatus,
      address: parsed.data.address,
      district: parsed.data.district,
      locality: parsed.data.locality,
    },
  });

  await createAuditLog({
    actorId: session.userId,
    actionType: "EDIT_PATIENT",
    entityType: "Patient",
    entityId: id,
    beforeJson: existing as object,
    afterJson: updated as object,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
