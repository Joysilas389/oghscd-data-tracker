"use client";
import { useState, useMemo } from "react";

interface Log {
  id: string;
  actionType: string;
  entityType: string;
  entityId: string;
  ipAddress: string | null;
  createdAt: string;
  actor: { fullName: string; role: string; email: string };
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-success", UPDATE: "bg-primary", DELETE: "bg-danger",
  LOGIN: "bg-info", LOGOUT: "bg-secondary", APPROVE: "bg-success",
  FLAG: "bg-warning text-dark", FLAGGED: "bg-warning text-dark",
  CORRECT: "bg-primary", CORRECTED: "bg-info text-white",
  RESET_PASSWORD: "bg-danger", EXPORT: "bg-dark", REGISTER: "bg-success",
};

export default function AuditSearch({ logs }: { logs: Log[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return logs;
    const q = query.toLowerCase();
    return logs.filter(log =>
      log.actionType.toLowerCase().includes(q) ||
      log.entityType.toLowerCase().includes(q) ||
      log.actor.fullName.toLowerCase().includes(q) ||
      log.actor.email.toLowerCase().includes(q) ||
      log.actor.role.toLowerCase().includes(q) ||
      (log.ipAddress || "").toLowerCase().includes(q)
    );
  }, [query, logs]);

  return (
    <div>
      {/* Search box */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body p-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by action, entity, user, email, role or IP..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
          />
          <div className="text-muted small mt-1">
            Showing {filtered.length} of {logs.length} events
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="d-md-none d-flex flex-column gap-2 mb-4">
        {filtered.length === 0 && (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center text-muted py-5">
              No matching audit logs
            </div>
          </div>
        )}
        {filtered.map(log => (
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
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      No matching audit logs
                    </td>
                  </tr>
                )}
                {filtered.map(log => (
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
    </div>
  );
}
