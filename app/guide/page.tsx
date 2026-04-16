import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Sidebar from "@/components/Sidebar";

export default async function GuidePage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const isManager = session.role === "MANAGER" || session.role === "ADMIN";
  const isAdmin = session.role === "ADMIN";

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName}
        facilityName={session.facilityName} active="/guide" />
      <div className="flex-grow-1 p-3 p-md-4 pb-5 pb-md-4 mb-5 mb-md-0"
        style={{ background: "#f8f9fa", minWidth: 0 }}>
        <div className="mb-3 mt-5 mt-md-0 pt-2 d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <h1 className="h4 fw-bold mb-0">Staff Guide</h1>
            <p className="text-muted small">
              How to use the OGH SCD E-Tracker — <strong>{session.role}</strong> instructions
            </p>
          </div>
          <button onClick={() => window.print()}
            className="btn btn-sm text-white no-print" style={{ background: "#1a5276" }}>
            🖨️ Print Guide
          </button>
        </div>

        <style>{`@media print { .no-print { display: none !important; } }`}</style>

        <div className="row g-3">

          {/* Getting Started */}
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header fw-semibold" style={{ background: "#1a5276", color: "#fff" }}>
                🚀 Getting Started
              </div>
              <div className="card-body">
                <p>The <strong>OGH SCD E-Tracker</strong> is used to record and manage Sickle Cell Disease screening data at Oda Government Hospital.</p>
                <div className="alert alert-info mb-0">
                  <strong>Your Role: {session.role}</strong><br />
                  {session.role === "SCREENER" && "As a Screener, you add screening records and manage your own data."}
                  {session.role === "MANAGER" && "As a Manager, you review and approve screening records entered by screeners."}
                  {session.role === "ADMIN" && "As an Admin, you have full access including user management, audit logs, and all manager functions."}
                </div>
              </div>
            </div>
          </div>

          {/* Add Screening */}
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header fw-semibold bg-white border-bottom">
                🔬 How to Add a Screening Record
              </div>
              <div className="card-body">
                <ol className="mb-0 ps-3">
                  <li className="mb-2">Tap <strong>➕ New Screening</strong> from the dashboard or bottom nav</li>
                  <li className="mb-2">Fill in the patient details — name, date of birth, sex, phone number, locality</li>
                  <li className="mb-2">If the patient already exists, a <strong>duplicate warning</strong> will appear. You can proceed to add a new visit or go back</li>
                  <li className="mb-2">Fill in the screening details — date, type (Newborn or Catch-Up), result, confirmatory action, treatment</li>
                  <li className="mb-2">Tap <strong>Submit</strong> — the record is saved with status <span className="badge bg-warning text-dark">PENDING</span></li>
                  <li>The Manager/HIM will review and approve your record</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Flagged Records */}
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header fw-semibold bg-white border-bottom">
                🚩 What to Do When a Record is Flagged
              </div>
              <div className="card-body">
                <p className="small text-muted">If a Manager flags your record, you will see a red alert on your dashboard with the reason for the flag.</p>
                <ol className="mb-0 ps-3">
                  <li className="mb-2">Check your dashboard for the 🚩 flagged alert</li>
                  <li className="mb-2">Read the <strong>reason from the Manager</strong> e.g. <em>"Wrong date of birth, please correct"</em></li>
                  <li className="mb-2">Tap <strong>✏️ Edit</strong> to correct the record</li>
                  <li className="mb-2">After editing, tap <strong>↩️ Resubmit</strong> — the record goes back to <span className="badge bg-warning text-dark">PENDING</span></li>
                  <li>The Manager will review again and approve</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Approved Records */}
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header fw-semibold bg-white border-bottom">
                🔒 Approved Records
              </div>
              <div className="card-body">
                <p>Once a record is <span className="badge bg-success">APPROVED</span> by the Manager, you <strong>cannot edit or delete it</strong>. This protects the integrity of approved data.</p>
                <div className="alert alert-warning small mb-3">
                  If you notice an error on an approved record, contact your Manager or HIM to make the correction.
                </div>
                <table className="table table-sm table-bordered small mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Status</th>
                      <th>Screener can Edit?</th>
                      <th>Screener can Delete?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="badge bg-warning text-dark">PENDING</span></td>
                      <td className="text-success fw-semibold">✅ Yes</td>
                      <td className="text-success fw-semibold">✅ Yes</td>
                    </tr>
                    <tr>
                      <td><span className="badge bg-danger">FLAGGED</span></td>
                      <td className="text-success fw-semibold">✅ Yes</td>
                      <td className="text-success fw-semibold">✅ Yes</td>
                    </tr>
                    <tr>
                      <td><span className="badge bg-success">APPROVED</span></td>
                      <td className="text-danger fw-semibold">🔒 No</td>
                      <td className="text-danger fw-semibold">🔒 No</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Review Queue - Manager/Admin only */}
          {isManager && (
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header fw-semibold bg-white border-bottom">
                  🔍 Manager — Review Queue Guide
                </div>
                <div className="card-body">
                  <ol className="mb-0 ps-3">
                    <li className="mb-2">Go to <strong>Review Queue</strong> from the sidebar or bottom nav</li>
                    <li className="mb-2">You will see all <span className="badge bg-warning text-dark">PENDING</span> screenings waiting for review</li>
                    <li className="mb-2">Tap <strong>View</strong> to see the full screening details</li>
                    <li className="mb-2">Choose one of three actions:
                      <ul className="mt-1">
                        <li><strong>✅ Approve</strong> — record is correct, mark as approved</li>
                        <li><strong>🚩 Flag with Reason</strong> — record has an error, add a reason so the screener knows what to fix</li>
                        <li><strong>✏️ Mark Corrected</strong> — you have corrected the record yourself</li>
                      </ul>
                    </li>
                    <li>Note: You <strong>must add a reason</strong> before you can flag a record</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Export */}
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header fw-semibold bg-white border-bottom">
                📊 Exporting Data
              </div>
              <div className="card-body">
                <ol className="mb-0 ps-3">
                  <li className="mb-2">Go to <strong>Reports</strong> from the sidebar</li>
                  <li className="mb-2">Tap <strong>⬇️ Download Excel</strong> to get a full export with 5 sheets — Screenings, Patients, Summary, Monthly Trend, Locality</li>
                  <li className="mb-2">Tap <strong>🖨️ Open Print View</strong> to open a printable report — use your browser to print or save as PDF</li>
                  <li>Screeners see phone numbers masked for privacy. Managers and Admins see full data.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Profile & Password */}
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header fw-semibold bg-white border-bottom">
                👤 My Profile & Password
              </div>
              <div className="card-body">
                <ol className="mb-0 ps-3">
                  <li className="mb-2">Tap <strong>👤 Profile</strong> from the sidebar or bottom nav</li>
                  <li className="mb-2">You can <strong>change your password</strong> at any time from the Profile page</li>
                  <li className="mb-2">Use a strong password with at least 8 characters</li>
                  <li>If you forget your password, contact your Admin to reset it. You will receive a temporary password by email.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* User Management - Admin only */}
          {isAdmin && (
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header fw-semibold bg-white border-bottom">
                  ⚙️ User Management — Admin Only
                </div>
                <div className="card-body">
                  <ol className="mb-0 ps-3">
                    <li className="mb-2">Go to <strong>User Management</strong> from the sidebar</li>
                    <li className="mb-2">New users register with role <span className="badge bg-primary">SCREENER</span> by default</li>
                    <li className="mb-2">To upgrade a user to Manager, tap <strong>Change Role</strong> next to their name</li>
                    <li className="mb-2">To reset a user's password, tap <strong>Reset Password</strong> — they receive a temporary password by email</li>
                    <li className="mb-2">To remove a user, tap <strong>🗑️ Delete</strong> — their screening records are preserved</li>
                    <li>Check the <strong>📜 Audit Log</strong> to see all system activity</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header fw-semibold bg-white border-bottom">
                🔐 Security Tips
              </div>
              <div className="card-body">
                <ul className="mb-0 ps-3">
                  <li className="mb-2">Never share your password with anyone including your manager</li>
                  <li className="mb-2">Always <strong>🚪 Sign Out</strong> when you finish using the system, especially on shared devices</li>
                  <li className="mb-2">After <strong>5 wrong password attempts</strong>, your account will be locked for 15 minutes</li>
                  <li>If you suspect someone is using your account, contact the Admin immediately</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="col-12">
            <div className="card border-0 shadow-sm"
              style={{ borderLeft: "4px solid #1a5276" }}>
              <div className="card-body">
                <h6 className="fw-semibold mb-2">📞 Need Help?</h6>
                <p className="mb-1 small">If you encounter any problem with the system, contact:</p>
                <div className="small">
                  <div><strong>System Administrator:</strong> Dr. Silas Agbesi</div>
                  <div><strong>Email:</strong> silasagbesi@gmail.com</div>
                  <div><strong>Hospital:</strong> Oda Government Hospital</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
