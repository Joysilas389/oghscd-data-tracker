import Sidebar from "@/components/Sidebar";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function HelpPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName}
        facilityName={session.facilityName} active="/help" />
      <div className="flex-grow-1 p-3 p-md-4 pb-5 pb-md-4 mb-5 mb-md-0"
        style={{ background: "#f8f9fa", minWidth: 0 }}>

        <div className="mb-4 mt-5 mt-md-0 pt-2">
          <h1 className="h4 fw-bold mb-0">Help & User Guide</h1>
          <p className="text-muted small">How to use the OGH SCD E-Tracker</p>
        </div>

        {/* Developer card */}
        <div className="card border-0 shadow-sm mb-4"
          style={{ borderLeft: "4px solid #1a5276" }}>
          <div className="card-body p-4">
            <div className="d-flex align-items-start gap-3 flex-wrap">
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "#1a5276", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "1.5rem", flexShrink: 0,
              }}>👨‍⚕️</div>
              <div>
                <div className="fw-bold" style={{ fontSize: "1rem" }}>
                  Dr. Agbesi Silas
                </div>
                <div className="text-muted small">
                  Medical Officer & Clinical Data Scientist
                </div>
                <div className="text-muted small">
                  Platform Developer · Oda Government Hospital
                </div>
                <div className="mt-2 d-flex flex-wrap gap-2">
                  <a href="tel:+233249204110"
                    className="btn btn-sm btn-outline-secondary">
                    📞 +233 249 204 110
                  </a>
                  <a href="mailto:silasagbesi@gmail.com"
                    className="btn btn-sm btn-outline-secondary">
                    ✉️ silasagbesi@gmail.com
                  </a>
                  <a href="https://moh-scd-guidelines.netlify.app/" target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm text-white" style={{ background: "#1a5276" }}>
                    📋 MOH SCD Guidelines App
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white fw-semibold">
            🏥 About This Platform
          </div>
          <div className="card-body p-4">
            <p className="small mb-2">
              The <strong>OGH SCD E-Tracker</strong> is a digital screening data management
              platform developed for <strong>Oda Government Hospital</strong>, Birim Central
              Municipal, Eastern Region, Ghana.
            </p>
            <p className="small mb-2">
              It is designed to support the capture, review, and reporting of Sickle Cell Disease
              (SCD) screening data for both <strong>Newborn</strong> and <strong>Catch-Up</strong>
              screenings conducted at the facility.
            </p>
            <p className="small mb-0">
              All data is securely stored and access is role-based to protect patient
              confidentiality.
            </p>
          </div>
        </div>

        {/* Roles */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white fw-semibold">
            👥 User Roles
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              {[
                {
                  role: "SCREENER", color: "#0d6efd", icon: "🔬",
                  desc: "Laboratory staff or nurses who perform screenings and enter data into the system.",
                  can: [
                    "Register and log in",
                    "Add new screening records",
                    "Edit or delete their own PENDING records",
                    "Edit their own FLAGGED records and resubmit",
                    "View all screenings and patients",
                    "Export Excel reports",
                    "View the Map",
                  ],
                  cannot: [
                    "Edit APPROVED records",
                    "Access the Review Queue",
                    "Manage users",
                    "View Audit Log",
                  ],
                },
                {
                  role: "MANAGER / HIM", color: "#ffc107", icon: "🔍",
                  desc: "Health Information Manager or senior clinician who reviews and approves screening records.",
                  can: [
                    "Everything a Screener can do",
                    "Access the Review Queue",
                    "Approve, Flag, or Correct any screening",
                    "Add reasons when flagging a record",
                    "Edit any screening regardless of status",
                    "View and manage users",
                  ],
                  cannot: [
                    "Delete user accounts",
                    "View Audit Log",
                  ],
                },
                {
                  role: "ADMIN", color: "#dc3545", icon: "⚙️",
                  desc: "System administrator with full access to all features.",
                  can: [
                    "Everything a Manager can do",
                    "Delete user accounts",
                    "Reset user passwords",
                    "View full Audit Log",
                    "Change user roles",
                  ],
                  cannot: [],
                },
              ].map(r => (
                <div key={r.role} className="col-12 col-md-4">
                  <div className="card border-0 h-100"
                    style={{ borderTop: `3px solid ${r.color}`, background: "#f8f9fa" }}>
                    <div className="card-body p-3">
                      <div className="fw-bold mb-1">
                        <span className="me-1">{r.icon}</span>
                        <span className="badge" style={{ background: r.color, fontSize: "0.75rem" }}>
                          {r.role}
                        </span>
                      </div>
                      <p className="small text-muted mb-2">{r.desc}</p>
                      <div className="small fw-semibold mb-1">Can:</div>
                      <ul className="small mb-2 ps-3">
                        {r.can.map(c => <li key={c}>{c}</li>)}
                      </ul>
                      {r.cannot.length > 0 && (
                        <>
                          <div className="small fw-semibold mb-1 text-danger">Cannot:</div>
                          <ul className="small mb-0 ps-3 text-danger">
                            {r.cannot.map(c => <li key={c}>{c}</li>)}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Screener guide */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white fw-semibold">
            🔬 Guide for Screeners
          </div>
          <div className="card-body p-4">
            {[
              {
                step: "1", title: "Register your account",
                desc: "Go to /register and fill in your full name, cadre, facility, email and password. You will receive a welcome email. Your role will be SCREENER by default.",
              },
              {
                step: "2", title: "Log in",
                desc: "Go to /login and enter your email and password. After 5 wrong attempts your account will be locked for 15 minutes for security.",
              },
              {
                step: "3", title: "Add a new screening",
                desc: "Tap ➕ New on the bottom nav or New Screening on the dashboard. Fill in the patient details and screening results. The system will detect if the patient already exists and alert you before saving.",
              },
              {
                step: "4", title: "Wait for review",
                desc: "After saving, your record will show as PENDING. The HIM or Manager will review it and either Approve or Flag it.",
              },
              {
                step: "5", title: "If your record is flagged",
                desc: "You will see a red alert on your dashboard with the reason from the Manager. Tap Edit to fix the record, then tap Resubmit. It goes back to PENDING for the Manager to review again.",
              },
              {
                step: "6", title: "Change your password",
                desc: "Go to My Profile from the bottom nav. You can change your password anytime. Use a strong password of at least 8 characters.",
              },
            ].map(s => (
              <div key={s.step} className="d-flex gap-3 mb-3">
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "#1a5276", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: "bold", fontSize: "0.85rem", flexShrink: 0,
                }}>{s.step}</div>
                <div>
                  <div className="fw-semibold small">{s.title}</div>
                  <div className="text-muted small">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manager guide */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white fw-semibold">
            🔍 Guide for Managers / HIM
          </div>
          <div className="card-body p-4">
            {[
              {
                step: "1", title: "Access the Review Queue",
                desc: "Tap Review in the bottom nav or sidebar. You will see all PENDING screenings waiting for your review.",
              },
              {
                step: "2", title: "Approve a record",
                desc: "Review the screening details carefully. If everything is correct, tap ✅ Approve. The record is locked and the screener can no longer edit it.",
              },
              {
                step: "3", title: "Flag a record",
                desc: "If there is an error, add a clear reason in the Review Note box e.g. 'Wrong date of birth, please correct'. Then tap 🚩 Flag with Reason. The screener will see this on their dashboard.",
              },
              {
                step: "4", title: "Correct a record yourself",
                desc: "If you prefer to fix the error yourself, tap ✏️ Mark Corrected and edit the record directly from the Screenings list.",
              },
              {
                step: "5", title: "Export data",
                desc: "Go to Reports → Download Excel to export all screening data in a 5-sheet Excel file for analysis or submission.",
              },
              {
                step: "6", title: "Manage users",
                desc: "Go to User Management to change roles, reset passwords, or delete accounts. To upgrade a screener to Manager, tap Change Role.",
              },
            ].map(s => (
              <div key={s.step} className="d-flex gap-3 mb-3">
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "#117a8b", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: "bold", fontSize: "0.85rem", flexShrink: 0,
                }}>{s.step}</div>
                <div>
                  <div className="fw-semibold small">{s.title}</div>
                  <div className="text-muted small">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white fw-semibold">
            ❓ Frequently Asked Questions
          </div>
          <div className="card-body p-4">
            {[
              {
                q: "I forgot my password. What do I do?",
                a: "Contact your system administrator (Dr. Agbesi Silas) or your facility Manager. They can reset your password and send you a new one by email.",
              },
              {
                q: "My account is locked. What do I do?",
                a: "Wait 15 minutes and try again. If it persists, contact the Admin to reset your password which will also unlock your account.",
              },
              {
                q: "I entered a wrong record. Can I edit it?",
                a: "Yes, if the record is still PENDING you can edit or delete it. If it has been APPROVED you cannot edit it — contact the Manager to correct it.",
              },
              {
                q: "The patient already exists in the system. What happens?",
                a: "The system will detect the duplicate and alert you. You can choose to link the new screening to the existing patient or proceed as a new entry if it is a different person.",
              },
              {
                q: "Is my data safe?",
                a: "Yes. All data is encrypted and stored securely on a cloud database. Only authorised staff with accounts can access the platform. All actions are logged in the Audit Log.",
              },
              {
                q: "Can I use this on my phone?",
                a: "Yes. The platform is fully mobile-friendly. You can also install it as an app on your phone by tapping Install App when prompted.",
              },
              {
                q: "Who do I contact for technical issues?",
                a: "Contact Dr. Agbesi Silas on +233 249 204 110 or silasagbesi@gmail.com.",
              },
            ].map((f, i) => (
              <div key={i} className="mb-3 pb-3 border-bottom">
                <div className="fw-semibold small mb-1">Q: {f.q}</div>
                <div className="text-muted small">A: {f.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 text-center">
            <div className="fw-bold mb-1">OGH SCD E-Tracker</div>
            <div className="text-muted small mb-2">
              Oda Government Hospital · Birim Central Municipal · Eastern Region · Ghana
            </div>
            <div className="text-muted small mb-3">
              Developed by Dr. Agbesi Silas — Medical Officer & Clinical Data Scientist
            </div>
            <a href="https://moh-scd-guidelines.netlify.app/" target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm text-white" style={{ background: "#1a5276" }}>
              📋 View MOH SCD Guidelines App
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
