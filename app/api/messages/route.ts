import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "inbox";
  const withUserId = searchParams.get("with");

  if (withUserId) {
    // Get thread between two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.userId, receiverId: withUserId },
          { senderId: withUserId, receiverId: session.userId },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
        receiver: { select: { id: true, fullName: true, role: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { id: true, fullName: true, role: true } },
          },
        },
      },
    });

    // Mark all received messages as read
    await prisma.message.updateMany({
      where: { senderId: withUserId, receiverId: session.userId, isReadByReceiver: false },
      data: { isReadByReceiver: true },
    });

    return NextResponse.json({ messages });
  }

  if (type === "sent") {
    const messages = await prisma.message.findMany({
      where: { senderId: session.userId },
      orderBy: { createdAt: "desc" },
      include: {
        receiver: { select: { id: true, fullName: true, role: true } },
        replies: { select: { id: true } },
      },
    });
    return NextResponse.json({ messages });
  }

  // Inbox
  const messages = await prisma.message.findMany({
    where: { receiverId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, fullName: true, role: true } },
      replies: { select: { id: true } },
    },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { receiverId, subject, body: msgBody, screeningId, fileUrl, fileName, fileSize } = body;

  if (!receiverId || !subject?.trim() || !msgBody?.trim()) {
    return NextResponse.json({ error: "Receiver, subject and message are required" }, { status: 400 });
  }

  if (receiverId === session.userId) {
    return NextResponse.json({ error: "You cannot message yourself" }, { status: 400 });
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) return NextResponse.json({ error: "Recipient not found" }, { status: 404 });

  const message = await prisma.message.create({
    data: {
      senderId: session.userId,
      receiverId,
      subject: subject.trim(),
      body: msgBody.trim(),
      screeningId: screeningId || null,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileSize: fileSize || null,
    },
    include: {
      sender: { select: { id: true, fullName: true, role: true } },
      receiver: { select: { id: true, fullName: true, role: true } },
    },
  });

  return NextResponse.json({ ok: true, message });
}
