import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      author: { select: { fullName: true, role: true } },
      reads: { where: { userId: session.userId }, select: { id: true } },
    },
  });

  // Mark all as read
  const unread = announcements.filter(a => a.reads.length === 0);
  if (unread.length > 0) {
    await prisma.announcementRead.createMany({
      data: unread.map(a => ({ announcementId: a.id, userId: session.userId })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({
    announcements: announcements.map(a => ({
      id: a.id,
      title: a.title,
      body: a.body,
      author: a.author,
      createdAt: a.createdAt,
      isRead: a.reads.length > 0,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "SCREENER") {
    return NextResponse.json({ error: "Only Managers and Admins can post announcements" }, { status: 403 });
  }

  const body = await req.json();
  const { title, annBody } = body;

  if (!title?.trim() || !annBody?.trim()) {
    return NextResponse.json({ error: "Title and body required" }, { status: 400 });
  }

  const announcement = await prisma.announcement.create({
    data: {
      authorId: session.userId,
      title: title.trim(),
      body: annBody.trim(),
    },
    include: {
      author: { select: { fullName: true, role: true } },
    },
  });

  return NextResponse.json({ ok: true, announcement });
}
