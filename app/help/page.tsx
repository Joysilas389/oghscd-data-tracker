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
          <h1 className="h4 fw-bold mb-0">❓ Help & User Guide</h1>
          <p className="text-muted small">
            OGH SCD E-Tracker · Oda Government Hospital · Your role: <strong>{session.role}</strong>
          </p>
        </div>

        {/* Getting Started */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold" style={{ color: "#1a5276" }}>
            🚀 Getting Started
          </div>
          <div className="card-body p-4">
            <p>Welcome to the OGH SCD E-Tracker. This system is used to record, manage and
            review Sickle Cell Disease screening data at Oda Government Hospital.</p>
            <div className="row g-3">
              {[
                { role: "SCREENER", color: "#0d6efd", desc: "Adds and manages screening records. Can view patients, map and reports." },
                { role: "MANAGER / HIM", color: "#ffc107", desc: "Reviews and approves screening records. Can flag records with reasons for correction." },
                { role: "ADMIN", color: "#dc3545", desc: "Full access. Manages users, views audit logs, resets passwords." },
              ].map(r => (
                <div key={r.role} className="col-12 col-md-4">
                  <div className="p-3 rounded" style={{ background: "#f8f9fa", borderLeft: `4px solid ${r.color}` }}>
                    <div className="fw-semibold small">{r.role}</div>
                    <div className="text-muted small mt-1">{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Screener Guide */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold" style={{ color: "#1a5276" }}>
            🔬 How to Add a Screening Record
          </div>
          <div className="card-body p-4">
            <ol className="mb-0" style={{ lineHeight: 2 }}>
              <li>Tap <strong>➕ New Screening</strong> from the bottom nav or sidebar.</li>
              <li>Enter the patient details — name, date of birth, sex, locality, phone number.</li>
              <li>The system will automatically check if the patient already exists.
                If a duplicate is found, you will be asked to confirm before proceeding.</li>
              <li>Enter the screening details — date, type (Newborn or Catch-Up),
                result, confirmatory action, and treatment status.</li>
              <li>Tap <strong>Submit</strong>. The record is saved with status <strong>PENDING</strong>.</li>
              <li>The Manager/HIM will review and approve the record.</li>
            </ol>
          </div>
        </div>

        {/* Flagged Records */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold" style={{ color: "#dc3545" }}>
            🚩 What to Do When a Record is Flagged
          </div>
          <div className="card-body p-4">
            <p>When a Manager flags your record, you will see a <strong>red alert</strong> on
            your Dashboard with the reason for the flag.</p>
            <ol className="mb-0" style={{ lineHeight: 2 }}>
              <li>Check your Dashboard for the flagged record and read the <strong>reason</strong>
                provided by the Manager.</li>
              <li>Tap <strong>✏️ Edit</strong> to open and correct the record.</li>
              <li>Make the necessary corrections.</li>
              <li>Tap <strong>↩️ Resubmit</strong> to send it back for review.</li>
              <li>The status will change back to <strong>PENDING</strong> for the Manager to review again.</li>
            </ol>
          </div>
        </div>

        {/* Patients */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold" style={{ color: "#1a5276" }}>
            👥 Managing Patients
          </div>
          <div className="card-body p-4">
            <ul className="mb-0" style={{ lineHeight: 2 }}>
              <li>Go to <strong>Patients</strong> in the sidebar to search for existing patients.</li>
              <li>Tap a patient name to view their full visit history and all past screenings.</li>
              <li>Each patient is assigned a unique <strong>Patient Code</strong> automatically.</li>
              <li>Duplicate detection runs automatically when adding a new screening —
                same name and date of birth will be flagged.</li>
            </ul>
          </div>
        </div>

        {/* Reports */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold" style={{ color: "#1a5276" }}>
            📁 Reports & Export
          </div>
          <div className="card-body p-4">
            <ul className="mb-0" style={{ lineHeight: 2 }}>
              <li>Go to <strong>Reports</strong> in the sidebar.</li>
              <li>Tap <strong>⬇️ Download Excel</strong> to export all screening data
                as a 5-sheet Excel file.</li>
              <li>Tap <strong>Open Print View</strong> to open a printable report.
                Use your browser to <strong>Print or Save as PDF</strong>.</li>
              <li><em>Note: Phone numbers are hidden for Screeners in exports for privacy.</em></li>
            </ul>
          </div>
        </div>

        {/* Map */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold" style={{ color: "#1a5276" }}>
            🗺️ Map View
          </div>
          <div className="card-body p-4">
            <p className="mb-0">The Map shows the distribution of screenings by locality
            in the Birim Central Municipal area. Each marker represents the number of
            screenings from that area. No personal patient data is shown on the map.</p>
          </div>
        </div>

        {/* Manager Guide */}
        {isManager && (
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold" style={{ color: "#f0ad4e" }}>
              🔍 Review Queue — Manager Guide
            </div>
            <div className="card-body p-4">
              <ol className="mb-0" style={{ lineHeight: 2 }}>
                <li>Go to <strong>Review Queue</strong> in the sidebar.</li>
                <li>All <strong>PENDING</strong> records are listed here for review.</li>
                <li>Tap <strong>View</strong> to see the full screening details.</li>
                <li>Add a review note if needed, then choose:
                  <ul style={{ lineHeight: 2 }}>
                    <li><strong>✅ Approve</strong> — Record is correct and confirmed.</li>
                    <li><strong>🚩 Flag with Reason</strong> — Record has an error.
                      You <strong>must</strong> enter a reason so the screener knows what to fix.</li>
                    <li><strong>✏️ Mark Corrected</strong> — You have corrected the record yourself.</li>
                  </ul>
                </li>
                <li>Approved records are <strong>locked</strong> — screeners cannot edit them.</li>
                <li>Flagged records go back to the screener's dashboard with your reason.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Admin Guide */}
        {isAdmin && (
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold" style={{ color: "#dc3545" }}>
              ⚙️ Admin Guide — User Management
            </div>
            <div className="card-body p-4">
              <ol className="mb-0" style={{ lineHeight: 2 }}>
                <li>Go to <strong>User Management</strong> in the sidebar.</li>
                <li>New users who register automatically get the <strong>SCREENER</strong> role.</li>
                <li>To promote a screener to Manager, tap <strong>Change Role</strong>
                  next to their name.</li>
                <li>To reset a user's password, tap <strong>Reset Password</strong> —
                  an email will be sent to the user with the new temporary password.</li>
                <li>To remove a user, tap <strong>🗑️ Delete</strong> and confirm.
                  Their screening records are preserved.</li>
                <li>Go to <strong>📜 Audit Log</strong> to see all system activity —
                  who logged in, who added records, who approved or flagged.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Account */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold" style={{ color: "#1a5276" }}>
            👤 Managing Your Account
          </div>
          <div className="card-body p-4">
            <ul className="mb-0" style={{ lineHeight: 2 }}>
              <li>Go to <strong>Profile</strong> to view your account details and change your password.</li>
              <li>Use a strong password with at least <strong>8 characters</strong>.</li>
              <li>After <strong>5 wrong login attempts</strong>, your account will be locked
                for 15 minutes. Contact your Admin if you need help.</li>
              <li>Tap <strong>🚪 Sign Out</strong> to log out securely.</li>
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold" style={{ color: "#1a5276" }}>
            📞 Need Help?
          </div>
          <div className="card-body p-4">
            <p className="mb-0">
              If you encounter any issues with the system, contact your
              <strong> System Administrator</strong> or the
              <strong> Health Information Manager (HIM)</strong> at Oda Government Hospital.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
