import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Body required" }, { status: 400 });

  const reply = await prisma.reply.findUnique({ where: { id } });
  if (!reply) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (reply.senderId !== session.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await prisma.reply.update({
    where: { id },
    data: { body: body.trim() },
  });
  return NextResponse.json({ ok: true, reply: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const reply = await prisma.reply.findUnique({ where: { id } });
  if (!reply) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (reply.senderId !== session.userId && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.reply.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
