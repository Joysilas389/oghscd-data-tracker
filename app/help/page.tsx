import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

export default async function HelpPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const isManager = session.role === "MANAGER" || session.role === "ADMIN";
  const isAdmin = session.role === "ADMIN";

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName}
        facilityName={session.facilityName} active="/help" />
      <div className="flex-grow-1 p-3 p-md-4 pb-5 pb-md-4 mb-5 mb-md-0"
        style={{ background: "#f8f9fa", minWidth: 0 }}>

        <div className="mb-4 mt-5 mt-md-0 pt-2">
          <h1 className="h4 fw-bold mb-0">Help & Documentation</h1>
          <p className="text-muted small">OGH SCD E-Tracker — Staff Guide</p>
        </div>

        {/* Developer Card */}
        <div className="card border-0 shadow-sm mb-4"
          style={{ borderLeft: "4px solid #1a5276" }}>
          <div className="card-body p-4">
            <div className="d-flex align-items-start gap-3 flex-wrap">
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "#1a5276", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.5rem", flexShrink: 0,
              }}>👨‍⚕️</div>
              <div className="flex-grow-1">
                <div className="fw-bold" style={{ fontSize: "1rem" }}>
                  Dr. Silas Agbesi
                </div>
                <div className="text-muted small">
                  Medical Officer · Clinical Data Scientist
                </div>
                <div className="text-muted small">
                  Platform Developer — OGH SCD E-Tracker
                </div>
                <div className="mt-2 d-flex flex-wrap gap-2">
                  <a href="tel:+233249204110"
                    className="btn btn-sm text-white" style={{ background: "#1a5276" }}>
                    📞 +233 249 204 110
                  </a>
                  <a href="https://moh-scd-guidelines.netlify.app/" target="_blank"
                    rel="noreferrer" className="btn btn-sm btn-outline-secondary">
                    📋 MOH SCD Guidelines App
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold" style={{ color: "#1a5276" }}>
            🚀 Getting Started
          </div>
          <div className="card-body p-4">
            <ol className="mb-0" style={{ lineHeight: 2 }}>
              <li>Go to <strong>oghscdtracker.vercel.app</strong> on your phone or computer</li>
              <li>Tap <strong>Register</strong> to create your account using your work email</li>
              <li>You will receive a <strong>welcome email</strong> after registration</li>
              <li>Your default role is <strong>Screener</strong></li>
              <li>Contact the system administrator to upgrade your role if needed</li>
              <li>Log in and start adding screening records immediately</li>
            </ol>
          </div>
        </div>

        {/* Screener Guide */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold" style={{ color: "#1a5276" }}>
            🔬 Screener Guide
          </div>
          <div className="card-body p-4">
            <p className="fw-semibold mb-2">Adding a New Screening Record:</p>
            <ol style={{ lineHeight: 2 }}>
              <li>Tap <strong>➕ New</strong> from the bottom nav or sidebar</li>
              <li>Fill in the patient details — name, date of birth, sex, locality</li>
              <li>The system will check for <strong>duplicate patients</strong> automatically</li>
              <li>If a duplicate is found, you can link to the existing patient</li>
              <li>Fill in the screening details — type, result, confirmatory action</li>
              <li>Tap <strong>Submit</strong> — record is saved as <strong>Pending</strong></li>
            </ol>

            <p className="fw-semibold mb-2 mt-3">Editing a Record:</p>
            <ul style={{ lineHeight: 2 }}>
              <li>You can only edit records with status <strong>PENDING</strong> or <strong>FLAGGED</strong></li>
              <li>Once a record is <strong>APPROVED</strong> by the Manager, it is locked</li>
              <li>To correct an approved record, contact the HIM or Manager</li>
            </ul>

            <p className="fw-semibold mb-2 mt-3">Flagged Records:</p>
            <ul style={{ lineHeight: 2 }}>
              <li>If the Manager flags your record, you will see a <strong>🚩 red alert</strong> on your dashboard</li>
              <li>The alert shows the <strong>reason</strong> from the Manager e.g. "Wrong date of birth"</li>
              <li>Tap <strong>✏️ Edit</strong> to correct the record</li>
              <li>Tap <strong>↩️ Resubmit</strong> to send it back for review</li>
            </ul>
          </div>
        </div>

        {/* Manager Guide */}
        {isManager && (
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold" style={{ color: "#1a5276" }}>
              🔍 Manager / HIM Guide
            </div>
            <div className="card-body p-4">
              <p className="fw-semibold mb-2">Review Queue:</p>
              <ol style={{ lineHeight: 2 }}>
                <li>Go to <strong>Review Queue</strong> from the sidebar or bottom nav</li>
                <li>You will see all <strong>Pending</strong> screening records</li>
                <li>Tap a record to review the full details</li>
                <li>Choose one of three actions:</li>
              </ol>
              <div className="row g-2 mt-1 mb-3">
                <div className="col-12 col-md-4">
                  <div className="p-3 rounded" style={{ background: "#d1e7dd" }}>
                    <div className="fw-semibold">✅ Approve</div>
                    <div className="small">Record is correct. Locks it from screener editing.</div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="p-3 rounded" style={{ background: "#f8d7da" }}>
                    <div className="fw-semibold">🚩 Flag with Reason</div>
                    <div className="small">Record has an error. Add a reason. Screener is alerted to correct and resubmit.</div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="p-3 rounded" style={{ background: "#cff4fc" }}>
                    <div className="fw-semibold">✏️ Mark Corrected</div>
                    <div className="small">You corrected the record yourself directly.</div>
                  </div>
                </div>
              </div>

              <p className="fw-semibold mb-2">Reports & Export:</p>
              <ul style={{ lineHeight: 2 }}>
                <li>Go to <strong>Reports</strong> to download the Excel file with 5 sheets</li>
                <li>Excel includes: Screenings, Patients, Summary Stats, Monthly Trend, Locality</li>
                <li>Use <strong>Print View</strong> to generate a printable PDF report</li>
                <li>Phone numbers are visible to Managers and Admins only</li>
              </ul>
            </div>
          </div>
        )}

        {/* Admin Guide */}
        {isAdmin && (
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold" style={{ color: "#1a5276" }}>
              ⚙️ Administrator Guide
            </div>
            <div className="card-body p-4">
              <p className="fw-semibold mb-2">User Management:</p>
              <ul style={{ lineHeight: 2 }}>
                <li>Go to <strong>User Management</strong> to see all registered users</li>
                <li>Change a user role: <strong>SCREENER → MANAGER → ADMIN</strong></li>
                <li>Reset a user's password — they receive an email with the temporary password</li>
                <li>Delete a user — they can re-register with a new password if needed</li>
                <li>Screeners register automatically with <strong>SCREENER</strong> role</li>
                <li>Upgrade HIM staff to <strong>MANAGER</strong> so they can access the Review Queue</li>
              </ul>

              <p className="fw-semibold mb-2 mt-2">Audit Log:</p>
              <ul style={{ lineHeight: 2 }}>
                <li>Go to <strong>📜 Audit Log</strong> to see all system activity</li>
                <li>Filter by action type (LOGIN, LOGOUT, CREATE, DELETE etc.)</li>
                <li>Filter by entity type (User, Screening, Patient etc.)</li>
                <li>Every action is recorded with timestamp, user and IP address</li>
              </ul>

              <p className="fw-semibold mb-2 mt-2">Security Features:</p>
              <ul style={{ lineHeight: 2 }}>
                <li>Accounts are locked after <strong>5 wrong password attempts</strong> for 15 minutes</li>
                <li>Login is rate limited — max 10 attempts per 15 minutes per device</li>
                <li>Registration is rate limited — max 5 per hour per device</li>
                <li>All passwords are encrypted with bcrypt</li>
              </ul>
            </div>
          </div>
        )}

        {/* Role Summary */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold" style={{ color: "#1a5276" }}>
            👥 Role Summary
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-bordered mb-0 small">
                <thead className="table-light">
                  <tr>
                    <th>Feature</th>
                    <th className="text-center">Screener</th>
                    <th className="text-center">Manager</th>
                    <th className="text-center">Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Add screening", "✅", "✅", "✅"],
                    ["Edit own PENDING records", "✅", "✅", "✅"],
                    ["Edit own FLAGGED records", "✅", "✅", "✅"],
                    ["Edit APPROVED records", "❌", "✅", "✅"],
                    ["Review Queue", "❌", "✅", "✅"],
                    ["Approve / Flag records", "❌", "✅", "✅"],
                    ["Export Excel", "✅*", "✅", "✅"],
                    ["View phone numbers", "❌", "✅", "✅"],
                    ["User Management", "❌", "❌", "✅"],
                    ["Reset passwords", "❌", "❌", "✅"],
                    ["Delete users", "❌", "❌", "✅"],
                    ["Audit Log", "❌", "❌", "✅"],
                  ].map(([feature, ...roles]) => (
                    <tr key={feature}>
                      <td>{feature}</td>
                      {roles.map((val, i) => (
                        <td key={i} className="text-center">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3">
              <small className="text-muted">* Screener Excel export masks patient phone numbers</small>
            </div>
          </div>
        </div>

        {/* MOH Guidelines */}
        <div className="card border-0 shadow-sm mb-3"
          style={{ borderLeft: "4px solid #198754" }}>
          <div className="card-body p-4">
            <h6 className="fw-bold mb-2">📋 MOH SCD Guidelines</h6>
            <p className="small text-muted mb-3">
              Access the Ghana Ministry of Health Sickle Cell Disease screening guidelines
              developed by Dr. Silas Agbesi.
            </p>
            <a href="https://moh-scd-guidelines.netlify.app/" target="_blank"
              rel="noreferrer" className="btn btn-sm btn-success">
              Open MOH SCD Guidelines App →
            </a>
          </div>
        </div>

        {/* Contact */}
        <div className="card border-0 shadow-sm mb-3"
          style={{ borderLeft: "4px solid #dc3545" }}>
          <div className="card-body p-4">
            <h6 className="fw-bold mb-2">🆘 Need Help?</h6>
            <p className="small text-muted mb-2">
              For technical issues, account problems, or training requests contact
              the system administrator:
            </p>
            <div className="fw-semibold">Dr. Silas Agbesi</div>
            <div className="small text-muted mb-3">Medical Officer · Clinical Data Scientist</div>
            <a href="tel:+233249204110"
              className="btn btn-sm btn-danger">
              📞 Call +233 249 204 110
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
