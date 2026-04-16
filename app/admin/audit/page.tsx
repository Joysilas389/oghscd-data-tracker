import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Sidebar from "@/components/Sidebar";
import AuditFilter from "@/components/AuditFilter";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-success",
  UPDATE: "bg-primary",
  DELETE: "bg-danger",
  LOGIN: "bg-info",
  LOGOUT: "bg-secondary",
  APPROVE: "bg-success",
  FLAG: "bg-warning text-dark",
  FLAGGED: "bg-warning text-dark",
  CORRECT: "bg-primary",
  CORRECTED: "bg-info",
  RESET_PASSWORD: "bg-danger",
  EXPORT: "bg-dark",
  REGISTER: "bg-success",
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: { page?: string; action?: string; entity?: string };
}) {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const page = parseInt(searchParams.page || "1");
  const pageSize = 50;
  const skip = (page - 1) * pageSize;
  const selectedAction = searchParams.action || "";
  const selectedEntity = searchParams.entity || "";

  const where: any = {};
  if (selectedAction) where.actionType = selectedAction;
  if (selectedEntity) where.entityType = selectedEntity;

  const [logs, total, actionTypes, entityTypes] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        actor: { select: { fullName: true, role: true, email: true } },
      },
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      distinct: ["actionType"],
      select: { actionType: true },
      orderBy: { actionType: "asc" },
    }),
    prisma.auditLog.findMany({
      distinct: ["entityType"],
      select: { entityType: true },
      orderBy: { entityType: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName}
        facilityName={session.facilityName} active="/admin/audit" />
      <div className="flex-grow-1 p-3 p-md-4 pb-5 pb-md-4"
        style={{ background: "#f8f9fa", minWidth: 0 }}>
        <div className="mb-3 mt-5 mt-md-0 pt-2">
          <h1 className="h4 fw-bold mb-0">Audit Log</h1>
          <p className="text-muted small">
            {total} total event{total !== 1 ? "s" : ""} · Page {page} of {Math.max(totalPages, 1)}
          </p>
        </div>

        <AuditFilter
          actionTypes={actionTypes.map(a => a.actionType)}
          entityTypes={entityTypes.map(e => e.entityType)}
          currentAction={selectedAction}
          currentEntity={selectedEntity}
          
          
        />

        {/* Mobile card view */}
        <div className="d-md-none d-flex flex-column gap-2 mb-4">
          {logs.length === 0 && (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center text-muted py-5">
                No audit logs found
              </div>
            </div>
          )}
          {logs.map(log => (
            <div key={log.id} className="card border-0 shadow-sm">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <span className={`badge ${ACTION_COLORS[log.actionType] || "bg-secondary"}`}
                    style={{ fontSize: "0.7rem" }}>
                    {log.actionType}
                  </span>
                  <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                    {new Date(log.createdAt).toLocaleString("en-GB")}
                  </span>
                </div>
                <div className="fw-semibold small">{log.actor.fullName}</div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                  {log.actor.role} · {log.actor.email}
                </div>
                <div className="mt-1" style={{ fontSize: "0.75rem" }}>
                  <span className="badge bg-light text-dark border me-1">{log.entityType}</span>
                  <span className="text-muted"
                    style={{ fontFamily: "monospace", fontSize: "0.65rem" }}>
                    {log.entityId.slice(0, 12)}...
                  </span>
                </div>
                {log.ipAddress && (
                  <div className="text-muted mt-1" style={{ fontSize: "0.7rem" }}>
                    IP: {log.ipAddress}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="card border-0 shadow-sm d-none d-md-block mb-3">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 small align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Entity ID</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        No audit logs found
                      </td>
                    </tr>
                  )}
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                        {new Date(log.createdAt).toLocaleString("en-GB")}
                      </td>
                      <td>
                        <div className="fw-semibold">{log.actor.fullName}</div>
                        <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                          {log.actor.email}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          log.actor.role === "ADMIN" ? "bg-danger" :
                          log.actor.role === "MANAGER" ? "bg-warning text-dark" : "bg-primary"}`}
                          style={{ fontSize: "0.65rem" }}>
                          {log.actor.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${ACTION_COLORS[log.actionType] || "bg-secondary"}`}
                          style={{ fontSize: "0.7rem" }}>
                          {log.actionType}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border"
                          style={{ fontSize: "0.7rem" }}>
                          {log.entityType}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#666" }}>
                        {log.entityId.slice(0, 16)}...
                      </td>
                      <td style={{ fontSize: "0.75rem", color: "#666" }}>
                        {log.ipAddress || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            {page > 1 && (
              <a href={`/admin/audit?page=${page - 1}&action=${selectedAction}&entity=${selectedEntity}`}
                className="btn btn-sm btn-outline-secondary">← Previous</a>
            )}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <a key={p}
                href={`/admin/audit?page=${p}&action=${selectedAction}&entity=${selectedEntity}`}
                className={`btn btn-sm ${p === page ? "text-white" : "btn-outline-secondary"}`}
                style={p === page ? { background: "#1a5276" } : {}}>
                {p}
              </a>
            ))}
            {page < totalPages && (
              <a href={`/admin/audit?page=${page + 1}&action=${selectedAction}&entity=${selectedEntity}`}
                className="btn btn-sm btn-outline-secondary">Next →</a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
