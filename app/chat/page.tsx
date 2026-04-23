import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Sidebar from "@/components/Sidebar";
import ChatClient from "@/components/ChatClient";

export default async function ChatPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const users = await prisma.user.findMany({
    where: { isActive: true, id: { not: session.userId } },
    select: { id: true, fullName: true, role: true, cadre: true },
    orderBy: { fullName: "asc" },
  });

  const inbox = await prisma.message.findMany({
    where: { receiverId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, fullName: true, role: true } },
      replies: { select: { id: true } },
    },
  });

  const sent = await prisma.message.findMany({
    where: { senderId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      receiver: { select: { id: true, fullName: true, role: true } },
      replies: { select: { id: true } },
    },
  });

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      author: { select: { fullName: true, role: true } },
      reads: { where: { userId: session.userId }, select: { id: true } },
    },
  });

  // Mark announcements as read
  const unreadAnn = announcements.filter(a => a.reads.length === 0);
  if (unreadAnn.length > 0) {
    await prisma.announcementRead.createMany({
      data: unreadAnn.map(a => ({ announcementId: a.id, userId: session.userId })),
      skipDuplicates: true,
    });
  }

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName}
        facilityName={session.facilityName} active="/chat" />
      <div className="flex-grow-1" style={{ background: "#f8f9fa", minWidth: 0 }}>
        <ChatClient
          currentUser={{ id: session.userId, fullName: session.fullName, role: session.role }}
          users={users}
          initialInbox={inbox.map(m => ({
            id: m.id,
            subject: m.subject,
            body: m.body,
            sender: m.sender,
            receiver: { id: session.userId, fullName: session.fullName, role: session.role },
            isReadByReceiver: m.isReadByReceiver,
            fileUrl: m.fileUrl,
            fileName: m.fileName,
            fileSize: m.fileSize,
            screeningId: m.screeningId,
            createdAt: m.createdAt.toISOString(),
            replyCount: m.replies.length,
          }))}
          initialSent={sent.map(m => ({
            id: m.id,
            subject: m.subject,
            body: m.body,
            sender: { id: session.userId, fullName: session.fullName, role: session.role },
            receiver: m.receiver,
            isReadByReceiver: m.isReadByReceiver,
            fileUrl: m.fileUrl,
            fileName: m.fileName,
            fileSize: m.fileSize,
            screeningId: m.screeningId,
            createdAt: m.createdAt.toISOString(),
            replyCount: m.replies.length,
          }))}
          initialAnnouncements={announcements.map(a => ({
            id: a.id,
            title: a.title,
            body: a.body,
            author: a.author,
            createdAt: a.createdAt.toISOString(),
            isRead: a.reads.length > 0,
          }))}
        />
      </div>
    </div>
  );
}
