import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Sidebar from "@/components/Sidebar";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName} facilityName={session.facilityName} active="/profile" />
      <div className="flex-grow-1 p-3 p-md-4" style={{ background: "#f8f9fa" }}>
        <div className="mb-4 mt-5 mt-md-0">
          <h1 className="h4 fw-bold mb-0">My Profile</h1>
        </div>
        <div className="card border-0 shadow-sm" style={{ maxWidth: 500 }}>
          <div className="card-body p-4">
            <div className="mb-3">
              <label className="form-label small text-muted">Full Name</label>
              <div className="fw-semibold">{session.fullName}</div>
            </div>
            <div className="mb-3">
              <label className="form-label small text-muted">Email</label>
              <div className="fw-semibold">{session.email}</div>
            </div>
            <div className="mb-3">
              <label className="form-label small text-muted">Role</label>
              <div>
                <span className={`badge ${session.role === "ADMIN" ? "bg-danger" : session.role === "MANAGER" ? "bg-warning text-dark" : "bg-primary"}`}>
                  {session.role}
                </span>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label small text-muted">Facility</label>
              <div className="fw-semibold">{session.facilityName}</div>
            </div>
            {session.role === "SCREENER" && (
              <div className="alert alert-info small mt-3 mb-0">
                To be upgraded to Manager or Admin, contact your system administrator.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
