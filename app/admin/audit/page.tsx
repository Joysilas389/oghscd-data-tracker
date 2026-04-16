import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Sidebar from "@/components/Sidebar";
import AuditSearch from "@/components/AuditSearch";

export default async function AuditLogPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      actor: { select: { fullName: true, role: true, email: true } },
    },
  });

  const serialized = logs.map(log => ({
    id: log.id,
    actionType: log.actionType,
    entityType: log.entityType,
    entityId: log.entityId,
    ipAddress: log.ipAddress ?? null,
    createdAt: log.createdAt.toISOString(),
    actor: log.actor,
  }));

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName}
        facilityName={session.facilityName} active="/admin/audit" />
      <div className="flex-grow-1 p-3 p-md-4 pb-5 pb-md-4"
        style={{ background: "#f8f9fa", minWidth: 0 }}>
        <div className="mb-3 mt-5 mt-md-0 pt-3">
          <h1 className="h4 fw-bold mb-0">Audit Log</h1>
          <p className="text-muted small">{logs.length} most recent events</p>
        </div>
        <AuditSearch logs={serialized} />
      </div>
    </div>
  );
}
