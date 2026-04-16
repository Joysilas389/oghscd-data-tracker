import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Sidebar from "@/components/Sidebar";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName}
        facilityName={session.facilityName} active="/profile" />
      <div className="flex-grow-1 p-3 p-md-4 pb-5 pb-md-4"
        style={{ background: "#f8f9fa" }}>
        <div className="mb-4 mt-5 mt-md-0 pt-2">
          <h1 className="h4 fw-bold mb-0">My Profile</h1>
          <p className="text-muted small">Manage your account details</p>
        </div>
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white fw-semibold">Account Information</div>
              <div className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label small text-muted">Full Name</label>
                  <div className="fw-semibold">{session.fullName}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted">Email Address</label>
                  <div className="fw-semibold">{session.email}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted">Role</label>
                  <div>
                    <span className={`badge ${
                      session.role === "ADMIN" ? "bg-danger" :
                      session.role === "MANAGER" ? "bg-warning text-dark" :
                      "bg-primary"}`}>
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
                    To be upgraded to Manager, contact your system administrator.
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white fw-semibold">Change Password</div>
              <div className="card-body p-4">
                <p className="text-muted small mb-3">
                  Choose a strong password with at least 8 characters.
                </p>
                <ChangePasswordForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
