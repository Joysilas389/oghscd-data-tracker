import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { z } from "zod";

const Schema = z.object({ screeningId: z.string() });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const screening = await prisma.screening.findUnique({
    where: { id: parsed.data.screeningId },
    select: { enteredById: true, reviewStatus: true },
  });

  if (!screening) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only the original screener can resubmit their own flagged record
  if (screening.enteredById !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (screening.reviewStatus !== "FLAGGED") {
    return NextResponse.json({ error: "Only flagged records can be resubmitted" }, { status: 400 });
  }

  await prisma.screening.update({
    where: { id: parsed.data.screeningId },
    data: { reviewStatus: "PENDING", reviewNote: null },
  });

  return NextResponse.json({ ok: true });
}
