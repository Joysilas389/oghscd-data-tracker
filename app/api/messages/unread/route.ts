import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ count: 0 });

  const [unreadMessages, unreadAnnouncements] = await Promise.all([
    prisma.message.count({
      where: { receiverId: session.userId, isReadByReceiver: false },
    }),
    prisma.announcement.count({
      where: {
        reads: { none: { userId: session.userId } },
      },
    }),
  ]);

  return NextResponse.json({ count: unreadMessages + unreadAnnouncements });
}
