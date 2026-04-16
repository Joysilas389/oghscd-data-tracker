import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Sidebar from "@/components/Sidebar";

export default async function HelpPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const isManager = session.role === "MANAGER" || session.role === "ADMIN";

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName}
        facilityName={session.facilityName} active="/help" />
      <div className="flex-grow-1 p-3 p-md-4 pb-5 pb-md-4 mb-5 mb-md-0"
        style={{ background: "#f8f9fa", minWidth: 0 }}>
        <div className="mb-4 mt-5 mt-md-0 pt-2">
          <h1 className="h4 fw-bold mb-0">📖 Staff Guide</h1>
          <p className="text-muted small">
            How to use the OGH SCD E-Tracker — {session.role} instructions
          </p>
        </div>

        {/* Getting Started */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold"
            style={{ borderLeft: "4px solid #1a5276" }}>
            🚀 Getting Started
          </div>
          <div className="card-body p-3 small">
            <p className="mb-2">
              The <strong>OGH SCD E-Tracker</strong> is used to record and manage
              Sickle Cell Disease screening data at Oda Government Hospital.
            </p>
            <div className="mb-2">
              <strong>Your Role: </strong>
              <span className={`badge ${
                session.role === "ADMIN" ? "bg-danger" :
                session.role === "MANAGER" ? "bg-warning text-dark" : "bg-primary"}`}>
                {session.role}
              </span>
            </div>
            <div className="p-2 rounded" style={{ background: "#e8f4fd" }}>
              {session.role === "SCREENER" && (
                <p className="mb-0">
                  As a <strong>Screener</strong>, you can add new screening records,
                  view your records, edit pending records, and view patient history.
                </p>
              )}
              {session.role === "MANAGER" && (
                <p className="mb-0">
                  As a <strong>Manager/HIM</strong>, you can review and approve screening
                  records, flag incorrect records with reasons, export data, and manage
                  the review queue.
                </p>
              )}
              {session.role === "ADMIN" && (
                <p className="mb-0">
                  As an <strong>Admin</strong>, you have full access including user
                  management, audit logs, and all manager functions.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Screener Guide */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold"
            style={{ borderLeft: "4px solid #0d6efd" }}>
            🔬 How to Add a Screening Record
          </div>
          <div className="card-body p-3 small">
            <ol className="mb-0 ps-3">
              <li className="mb-2">
                Tap <strong>➕ New Screening</strong> from the dashboard or bottom nav
              </li>
              <li className="mb-2">
                Fill in the <strong>patient details</strong> — name, date of birth,
                sex, phone number, locality
              </li>
              <li className="mb-2">
                If the patient already exists, a <strong>duplicate warning</strong> will
                appear. You can proceed to add a new visit or go back
              </li>
              <li className="mb-2">
                Fill in the <strong>screening details</strong> — date, type
                (Newborn or Catch-Up), result, confirmatory action, treatment
              </li>
              <li className="mb-2">
                Tap <strong>Submit</strong> — the record is saved with status{" "}
                <span className="badge bg-warning text-dark">PENDING</span>
              </li>
              <li className="mb-0">
                The Manager/HIM will review and approve your record
              </li>
            </ol>
          </div>
        </div>

        {/* Flagged Records */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold"
            style={{ borderLeft: "4px solid #dc3545" }}>
            🚩 What to Do When a Record is Flagged
          </div>
          <div className="card-body p-3 small">
            <p className="mb-2">
              If a Manager flags your record, you will see a <strong>red alert</strong> on
              your dashboard with the reason for the flag.
            </p>
            <ol className="mb-0 ps-3">
              <li className="mb-2">
                Check your dashboard for the <strong>🚩 flagged alert</strong>
              </li>
              <li className="mb-2">
                Read the <strong>reason from the Manager</strong> e.g.
                "Wrong date of birth, please correct"
              </li>
              <li className="mb-2">
                Tap <strong>✏️ Edit</strong> to correct the record
              </li>
              <li className="mb-2">
                After editing, tap <strong>↩️ Resubmit</strong> — the record goes back
                to <span className="badge bg-warning text-dark">PENDING</span>
              </li>
              <li className="mb-0">
                The Manager will review again and approve
              </li>
            </ol>
          </div>
        </div>

        {/* Approved Records */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold"
            style={{ borderLeft: "4px solid #198754" }}>
            🔒 Approved Records
          </div>
          <div className="card-body p-3 small">
            <p className="mb-0">
              Once a record is <span className="badge bg-success">APPROVED</span> by the
              Manager, you <strong>cannot edit or delete it</strong>. This protects the
              integrity of approved data. If you notice an error on an approved record,
              contact your Manager or HIM to make the correction.
            </p>
          </div>
        </div>

        {/* Editing Records */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold"
            style={{ borderLeft: "4px solid #6f42c1" }}>
            ✏️ Editing and Deleting Records
          </div>
          <div className="card-body p-3 small">
            <div className="table-responsive">
              <table className="table table-bordered table-sm mb-0">
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

        {/* Manager Guide */}
        {isManager && (
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold"
              style={{ borderLeft: "4px solid #ffc107" }}>
              🔍 Manager — Review Queue Guide
            </div>
            <div className="card-body p-3 small">
              <ol className="mb-0 ps-3">
                <li className="mb-2">
                  Go to <strong>Review Queue</strong> from the sidebar or bottom nav
                </li>
                <li className="mb-2">
                  You will see all <span className="badge bg-warning text-dark">PENDING</span>{" "}
                  screenings waiting for review
                </li>
                <li className="mb-2">
                  Tap <strong>View</strong> to see the full screening details
                </li>
                <li className="mb-2">
                  Choose one of three actions:
                  <ul className="mt-1">
                    <li>
                      <strong>✅ Approve</strong> — record is correct, mark as approved
                    </li>
                    <li>
                      <strong>🚩 Flag with Reason</strong> — record has an error,
                      add a reason so the screener knows what to fix
                    </li>
                    <li>
                      <strong>✏️ Mark Corrected</strong> — you have corrected the
                      record yourself
                    </li>
                  </ul>
                </li>
                <li className="mb-0">
                  <strong>Note:</strong> You must add a reason before you can flag a record
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Export Guide */}
        {isManager && (
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold"
              style={{ borderLeft: "4px solid #198754" }}>
              📊 Exporting Data
            </div>
            <div className="card-body p-3 small">
              <ol className="mb-0 ps-3">
                <li className="mb-2">
                  Go to <strong>Reports</strong> from the sidebar
                </li>
                <li className="mb-2">
                  Tap <strong>⬇️ Download Excel</strong> to get a full export with
                  5 sheets — Screenings, Patients, Summary, Monthly Trend, Locality
                </li>
                <li className="mb-2">
                  Tap <strong>🖨️ Open Print View</strong> to open a printable report —
                  use your browser to print or save as PDF
                </li>
                <li className="mb-0">
                  Screeners see phone numbers masked for privacy.
                  Managers and Admins see full data.
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Profile */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold"
            style={{ borderLeft: "4px solid #117a8b" }}>
            👤 My Profile & Password
          </div>
          <div className="card-body p-3 small">
            <ol className="mb-0 ps-3">
              <li className="mb-2">
                Tap <strong>👤 Profile</strong> from the sidebar or bottom nav
              </li>
              <li className="mb-2">
                You can <strong>change your password</strong> at any time from the Profile page
              </li>
              <li className="mb-2">
                Use a strong password with at least <strong>8 characters</strong>
              </li>
              <li className="mb-0">
                If you forget your password, contact your <strong>Admin</strong> to reset it.
                You will receive a temporary password by email.
              </li>
            </ol>
          </div>
        </div>

        {/* Security Tips */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold"
            style={{ borderLeft: "4px solid #dc3545" }}>
            🔐 Security Tips
          </div>
          <div className="card-body p-3 small">
            <ul className="mb-0 ps-3">
              <li className="mb-2">
                <strong>Never share your password</strong> with anyone including your manager
              </li>
              <li className="mb-2">
                Always <strong>🚪 Sign Out</strong> when you finish using the system,
                especially on shared devices
              </li>
              <li className="mb-2">
                After <strong>5 wrong password attempts</strong>, your account will be
                locked for 15 minutes
              </li>
              <li className="mb-0">
                If you suspect someone is using your account, contact the Admin immediately
              </li>
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold"
            style={{ borderLeft: "4px solid #fd7e14" }}>
            📞 Need Help?
          </div>
          <div className="card-body p-3 small">
            <p className="mb-1">
              If you encounter any problem with the system, contact:
            </p>
            <div className="p-2 rounded" style={{ background: "#f8f9fa" }}>
              <div><strong>System Administrator:</strong> Dr. Silas Agbesi</div>
              <div><strong>Email:</strong> silasagbesi@gmail.com</div>
              <div><strong>Hospital:</strong> Oda Government Hospital</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
