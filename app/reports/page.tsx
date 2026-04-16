import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName}
        facilityName={session.facilityName} active="/reports" />
      <div className="flex-grow-1 p-3 p-md-4 pb-5 pb-md-4"
        style={{ background: "#f8f9fa" }}>
        <div className="mb-4 mt-5 mt-md-0 pt-3">
          <h1 className="h4 fw-bold mb-0">Reports & Export</h1>
          <p className="text-muted small">Download or print screening data</p>
        </div>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="fw-semibold mb-1">📊 Export to Excel</h5>
                <p className="text-muted small mb-3">
                  {session.role === "SCREENER"
                    ? "Phone numbers masked for privacy."
                    : "Full data included (Manager/Admin)."}
                  5 sheets included.
                </p>
                <a href="/api/export/screenings"
                  className="btn text-white" style={{ background: "#1a5276" }}>
                  ⬇️ Download Excel (.xlsx)
                </a>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="fw-semibold mb-1">🖨️ Print Report</h5>
                <p className="text-muted small mb-3">
                  Open a print-friendly view of all screenings.
                  Can also save as PDF from browser.
                </p>
                <Link href="/print"
                  className="btn btn-outline-secondary" target="_blank">
                  Open Print View
                </Link>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="fw-semibold mb-1">📋 View All Screenings</h5>
                <p className="text-muted small mb-3">
                  Browse, search and filter all records online.
                </p>
                <Link href="/screenings" className="btn btn-outline-secondary">
                  Open Screenings Table
                </Link>
              </div>
            </div>
          </div>

          {(session.role === "MANAGER" || session.role === "ADMIN") && (
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm h-100"
                style={{ borderLeft: "4px solid #ffc107" }}>
                <div className="card-body p-4">
                  <h5 className="fw-semibold mb-1">🔐 Review Queue</h5>
                  <p className="text-muted small mb-3">
                    Approve, flag or correct pending screenings.
                  </p>
                  <Link href="/review" className="btn btn-warning">
                    Go to Review Queue
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
