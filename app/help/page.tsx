import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Sidebar from "@/components/Sidebar";

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
          <h1 className="h4 fw-bold mb-0">📖 Help & User Guide</h1>
          <p className="text-muted small">
            OGH SCD E-Tracker · Oda Government Hospital · Your role: <strong>{session.role}</strong>
          </p>
        </div>

        {/* Quick start */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold">🚀 Quick Start</div>
          <div className="card-body p-4">
            <div className="row g-3">
              {[
                { step: "1", title: "Login", desc: "Use your registered email and password to log in." },
                { step: "2", title: "Add Screening", desc: "Tap ➕ New on the bottom nav or sidebar to add a new screening record." },
                { step: "3", title: "Fill Form", desc: "Enter all patient and screening details. The system checks for duplicate patients automatically." },
                { step: "4", title: "Submit", desc: "Submit the record. It goes to PENDING status for the Manager to review." },
              ].map(s => (
                <div key={s.step} className="col-12 col-md-6">
                  <div className="d-flex gap-3 align-items-start">
                    <div className="rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 32, height: 32, background: "#1a5276", fontSize: "0.85rem", fontWeight: "bold" }}>
                      {s.step}
                    </div>
                    <div>
                      <div className="fw-semibold small">{s.title}</div>
                      <div className="text-muted small">{s.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Screener guide */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold">🔬 For Screeners</div>
          <div className="card-body p-4">
            <div className="mb-3">
              <div className="fw-semibold small mb-1">Adding a New Screening</div>
              <ol className="small text-muted ps-3 mb-0">
                <li>Tap <strong>➕ New</strong> from the bottom nav or sidebar</li>
                <li>Fill in patient details — name, date of birth, sex, locality, phone number</li>
                <li>If patient already exists, you will see a duplicate warning — confirm if it is the same patient</li>
                <li>Fill in screening details — date, type, result, confirmatory action, treatment</li>
                <li>Tap <strong>Submit</strong> — record status becomes PENDING</li>
              </ol>
            </div>
            <div className="mb-3">
              <div className="fw-semibold small mb-1">Editing a Record</div>
              <ul className="small text-muted ps-3 mb-0">
                <li>You can edit a record only when it is <span className="badge bg-warning text-dark">PENDING</span> or <span className="badge bg-danger">FLAGGED</span></li>
                <li>Once <span className="badge bg-success">APPROVED</span> by Manager, you cannot edit it</li>
                <li>If you need to correct an approved record, contact your Manager or HIM</li>
              </ul>
            </div>
            <div className="mb-3">
              <div className="fw-semibold small mb-1">🚩 Flagged Records</div>
              <ul className="small text-muted ps-3 mb-0">
                <li>If Manager flags your record, you will see a <strong>red alert</strong> on your dashboard</li>
                <li>The alert shows the <strong>reason</strong> from the Manager e.g. "Wrong date of birth"</li>
                <li>Tap <strong>Edit</strong> to correct the record</li>
                <li>Tap <strong>↩️ Resubmit</strong> after correcting — record goes back to PENDING for review</li>
              </ul>
            </div>
            <div>
              <div className="fw-semibold small mb-1">Viewing Records</div>
              <ul className="small text-muted ps-3 mb-0">
                <li>Tap <strong>Records</strong> to see all screenings</li>
                <li>Tap <strong>Patients</strong> to see all registered patients and their visit history</li>
                <li>Tap <strong>Map</strong> to see screenings by locality on a map</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Record status guide */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold">📋 Record Status Guide</div>
          <div className="card-body p-4">
            <div className="d-flex flex-column gap-2">
              {[
                { status: "PENDING", color: "bg-warning text-dark", desc: "Newly submitted. Waiting for Manager review." },
                { status: "APPROVED", color: "bg-success", desc: "Reviewed and approved by Manager or HIM. Record is final." },
                { status: "FLAGGED", color: "bg-danger", desc: "Manager found an issue. Check your dashboard for the reason and correct it." },
                { status: "CORRECTED", color: "bg-info", desc: "Manager has made a direct correction to the record." },
              ].map(s => (
                <div key={s.status} className="d-flex align-items-start gap-3">
                  <span className={`badge ${s.color} flex-shrink-0`}
                    style={{ width: 90, textAlign: "center" }}>
                    {s.status}
                  </span>
                  <div className="text-muted small">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Manager guide */}
        {isManager && (
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold">🔍 For Managers / HIM</div>
            <div className="card-body p-4">
              <div className="mb-3">
                <div className="fw-semibold small mb-1">Review Queue</div>
                <ol className="small text-muted ps-3 mb-0">
                  <li>Tap <strong>Review Queue</strong> from sidebar to see all PENDING records</li>
                  <li>Tap <strong>View</strong> on any record to see full details</li>
                  <li>Use the review actions at the bottom of the detail page:
                    <ul className="mt-1">
                      <li><strong>✅ Approve</strong> — record is correct, mark as APPROVED</li>
                      <li><strong>🚩 Flag with Reason</strong> — add a note explaining what to correct, then flag. Screener will see the reason on their dashboard</li>
                      <li><strong>✏️ Mark Corrected</strong> — you made a direct correction to the record</li>
                    </ul>
                  </li>
                </ol>
              </div>
              <div className="mb-3">
                <div className="fw-semibold small mb-1">Exporting Data</div>
                <ul className="small text-muted ps-3 mb-0">
                  <li>Go to <strong>Reports</strong> → tap <strong>Download Excel</strong> for a full 5-sheet export</li>
                  <li>Or tap <strong>Open Print View</strong> for a printable report to save as PDF</li>
                </ul>
              </div>
              <div>
                <div className="fw-semibold small mb-1">User Management</div>
                <ul className="small text-muted ps-3 mb-0">
                  <li>Go to <strong>User Management</strong> to see all registered users</li>
                  <li>Change a user's role between Screener and Manager</li>
                  <li>New staff register themselves — you upgrade their role after</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Admin guide */}
        {isAdmin && (
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold">⚙️ For Administrators</div>
            <div className="card-body p-4">
              <div className="mb-3">
                <div className="fw-semibold small mb-1">User Management</div>
                <ul className="small text-muted ps-3 mb-0">
                  <li>Change any user's role — SCREENER, MANAGER, or ADMIN</li>
                  <li>Reset a user's password — they receive an email with the new password</li>
                  <li>Delete a user — they can re-register. Their screening records are preserved</li>
                </ul>
              </div>
              <div className="mb-3">
                <div className="fw-semibold small mb-1">Audit Log</div>
                <ul className="small text-muted ps-3 mb-0">
                  <li>Go to <strong>Audit Log</strong> to see every action taken on the system</li>
                  <li>Filter by action type e.g. LOGIN, DELETE, APPROVE</li>
                  <li>Filter by entity type e.g. User, Screening</li>
                  <li>Use this for accountability and security monitoring</li>
                </ul>
              </div>
              <div>
                <div className="fw-semibold small mb-1">Account Security</div>
                <ul className="small text-muted ps-3 mb-0">
                  <li>Accounts are locked after <strong>5 wrong password attempts</strong> for 15 minutes</li>
                  <li>Too many login attempts from one device blocks that device for 15 minutes</li>
                  <li>Reset the user's password to unlock their account immediately</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold">❓ Frequently Asked Questions</div>
          <div className="card-body p-4">
            <div className="d-flex flex-column gap-3">
              {[
                {
                  q: "I forgot my password. What do I do?",
                  a: "Contact your system administrator or HIM. They can reset your password and you will receive an email with the new one."
                },
                {
                  q: "I entered a wrong record and it was approved. Can I edit it?",
                  a: "No. Once approved, only a Manager or Admin can edit or correct it. Contact your HIM to make the correction."
                },
                {
                  q: "The system says a patient already exists. What do I do?",
                  a: "The system detected a possible duplicate. Review the existing patient details carefully. If it is the same patient, confirm and add a new screening visit to their record. If it is a different patient, dismiss the warning and continue."
                },
                {
                  q: "My record was flagged. What do I do?",
                  a: "Check your dashboard for the red alert. Read the reason given by the Manager, tap Edit to correct the record, then tap Resubmit. The record goes back to the Manager for review."
                },
                {
                  q: "Can I use this on my phone?",
                  a: "Yes. The system works on any smartphone browser. You can also install it as an app — tap the install prompt or use your browser's Add to Home Screen option."
                },
                {
                  q: "Is patient data safe?",
                  a: "Yes. All data is stored securely. Phone numbers are hidden from screeners in exports. All actions are recorded in the audit log. The system uses secure login with account lockout protection."
                },
              ].map((faq, i) => (
                <div key={i} className="border-bottom pb-3">
                  <div className="fw-semibold small mb-1">Q: {faq.q}</div>
                  <div className="text-muted small">A: {faq.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold">📞 Need More Help?</div>
          <div className="card-body p-4">
            <p className="small text-muted mb-2">
              If you encounter any issue not covered here, contact:
            </p>
            <div className="small">
              <div><strong>System Administrator:</strong> Dr. Silas Agbesi</div>
              <div><strong>Hospital:</strong> Oda Government Hospital, Birim Central Municipal, Eastern Region</div>
              <div><strong>Platform:</strong> OGH SCD E-Tracker · oghscdtracker.vercel.app</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
