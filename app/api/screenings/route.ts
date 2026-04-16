import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { generatePatientCode, generateMatchHash, createAuditLog } from "@/lib/auth";

const Schema = z.object({
  patient: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    sex: z.enum(["MALE","FEMALE"]),
    phoneNumber: z.string().optional().default(""),
    dateOfBirth: z.string(),
    ethnicity: z.string().optional().default(""),
    nhisStatus: z.enum(["ACTIVE","EXPIRED","NONE"]).default("NONE"),
    address: z.string().optional().default(""),
    district: z.string().optional().default("Birim Central Municipal"),
    locality: z.string().optional().default(""),
  }),
  screening: z.object({
    screeningDatetime: z.string(),
    screeningType: z.enum(["CATCH_UP","NEWBORN"]),
    screeningResult: z.string().min(1),
    confirmedTest: z.boolean().default(false),
    confirmedResult: z.string().optional().default(""),
    confirmatoryAction: z.enum(["DONE","REFERRED","NONE"]).default("NONE"),
    remarks: z.string().optional().default(""),
    treatmentStarted: z.boolean().default(false),
    treatmentStartDate: z.string().optional(),
    treatmentNotes: z.string().optional().default(""),
    medicationPlan: z.string().optional().default(""),
    referralNotes: z.string().optional().default(""),
    facilityName: z.string().optional().default("Oda Government Hospital"),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId) return NextResponse.json({error:"Unauthorized"},{status:401});

    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({error:"Invalid input"},{status:400});

    const {patient: pd, screening: sd} = parsed.data;

    const count = await prisma.patient.count();
    const patientCode = generatePatientCode(count + 1);
    const matchHash = generateMatchHash(pd.firstName, pd.lastName, pd.dateOfBirth, pd.phoneNumber || "");

    const patient = await prisma.patient.create({
      data: {
        patientCode,
        firstName: pd.firstName,
        lastName: pd.lastName,
        sex: pd.sex,
        phoneNumber: pd.phoneNumber || "",
        dateOfBirth: new Date(pd.dateOfBirth),
        ethnicity: pd.ethnicity || "",
        nhisStatus: pd.nhisStatus,
        address: pd.address || "",
        district: pd.district || "Birim Central Municipal",
        locality: pd.locality || "",
        matchHash,
        createdById: session.userId,
      },
    });

    const screening = await prisma.screening.create({
      data: {
        patientId: patient.id,
        screeningDatetime: new Date(sd.screeningDatetime),
        screeningType: sd.screeningType,
        screeningResult: sd.screeningResult,
        confirmedTest: sd.confirmedTest,
        confirmedResult: sd.confirmedResult || "",
        confirmatoryAction: sd.confirmatoryAction,
        remarks: sd.remarks || "",
        treatmentStarted: sd.treatmentStarted,
        treatmentStartDate: sd.treatmentStartDate ? new Date(sd.treatmentStartDate) : null,
        treatmentNotes: sd.treatmentNotes || "",
        medicationPlan: sd.medicationPlan || "",
        referralNotes: sd.referralNotes || "",
        facilityName: sd.facilityName || "Oda Government Hospital",
        enteredById: session.userId,
        reviewStatus: "PENDING",
      },
    });

    await createAuditLog({
      actorId: session.userId,
      actionType: "CREATE_SCREENING",
      entityType: "Screening",
      entityId: screening.id,
      afterJson: { patientCode, screeningType: sd.screeningType },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({ ok: true, screeningId: screening.id, patientCode });
  } catch (err) {
    console.error(err);
    return NextResponse.json({error:"Server error"},{status:500});
  }
}
