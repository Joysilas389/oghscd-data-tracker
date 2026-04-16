import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Sidebar from "@/components/Sidebar";
import ChangeRoleButton from "@/components/ChangeRoleButton";
import ResetPasswordButton from "@/components/ResetPasswordButton";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (session.role !== "ADMIN" && session.role !== "MANAGER") redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, fullName: true, email: true, role: true,
      cadre: true, facilityName: true, isActive: true, createdAt: true,
      failedLogins: true, lockedUntil: true,
    },
  });

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName}
        facilityName={session.facilityName} active="/admin/users" />
      <div className="flex-grow-1 p-3 p-md-4 pb-5 pb-md-4"
        style={{ background: "#f8f9fa", minWidth: 0 }}>
        <div className="mb-3 mt-5 mt-md-0">
          <h1 className="h4 fw-bold mb-0">User Management</h1>
          <p className="text-muted small">{users.length} registered user(s)</p>
        </div>

        <div className="alert alert-info small mb-3">
          <strong>Role Guide:</strong> Screeners add records. Managers review and approve.
          Admins manage users. Upgrade a screener to Manager so they can access the Review Queue.
        </div>

        {/* Mobile card view */}
        <div className="d-md-none d-flex flex-column gap-3 mb-4">
          {users.map(u => (
            <div key={u.id} className="card border-0 shadow-sm">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="fw-semibold">{u.fullName}</div>
                    <div className="text-muted small">{u.email}</div>
                    <div className="text-muted small">{u.cadre}</div>
                  </div>
                  <span className={`badge ${u.role === "ADMIN" ? "bg-danger" :
                    u.role === "MANAGER" ? "bg-warning text-dark" : "bg-primary"}`}>
                    {u.role}
                  </span>
                </div>
                {u.lockedUntil && new Date(u.lockedUntil) > new Date() && (
                  <div className="alert alert-warning py-1 small mb-2">
                    🔒 Account locked
                  </div>
                )}
                {u.id !== session.userId ? (
                  <div className="d-flex gap-2 flex-wrap">
                    <ChangeRoleButton userId={u.id} currentRole={u.role} />
                    {session.role === "ADMIN" && (
                      <ResetPasswordButton userId={u.id} userName={u.fullName} />
                    )}
                  </div>
                ) : (
                  <span className="badge bg-secondary">You</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table view */}
        <div className="card border-0 shadow-sm d-none d-md-block">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 small align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Cadre</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Change Role</th>
                    {session.role === "ADMIN" && <th>Reset Password</th>}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="fw-semibold">{u.fullName}</td>
                      <td className="text-muted" style={{ fontSize: "0.75rem" }}>{u.email}</td>
                      <td>{u.cadre}</td>
                      <td>
                        <span className={`badge ${u.role === "ADMIN" ? "bg-danger" :
                          u.role === "MANAGER" ? "bg-warning text-dark" : "bg-primary"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.lockedUntil && new Date(u.lockedUntil) > new Date() ? (
                          <span className="badge bg-danger">Locked</span>
                        ) : (
                          <span className={`badge ${u.isActive ? "bg-success" : "bg-secondary"}`}>
                            {u.isActive ? "Active" : "Inactive"}
                          </span>
                        )}
                      </td>
                      <td>
                        {u.id !== session.userId
                          ? <ChangeRoleButton userId={u.id} currentRole={u.role} />
                          : <span className="text-muted small">You</span>}
                      </td>
                      {session.role === "ADMIN" && (
                        <td>
                          {u.id !== session.userId && (
                            <ResetPasswordButton userId={u.id} userName={u.fullName} />
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
