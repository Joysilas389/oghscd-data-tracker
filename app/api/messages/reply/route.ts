import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { messageId, body: replyBody, fileUrl, fileName, fileSize } = body;

  if (!messageId || !replyBody?.trim()) {
    return NextResponse.json({ error: "Message and reply body required" }, { status: 400 });
  }

  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });

  // Only sender or receiver can reply
  if (message.senderId !== session.userId && message.receiverId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const reply = await prisma.reply.create({
    data: {
      messageId,
      senderId: session.userId,
      body: replyBody.trim(),
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileSize: fileSize || null,
    },
    include: {
      sender: { select: { id: true, fullName: true, role: true } },
    },
  });

  // Mark original as read if receiver is replying
  if (message.receiverId === session.userId) {
    await prisma.message.update({
      where: { id: messageId },
      data: { isReadByReceiver: true },
    });
  }

  return NextResponse.json({ ok: true, reply });
}
