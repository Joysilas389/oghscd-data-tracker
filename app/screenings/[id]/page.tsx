import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ScreeningDetailPage({ params }: Props) {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const { id } = await params;

  const screening = await prisma.screening.findUnique({
    where: { id },
    include: {
      patient: true,
      enteredBy: { select: { fullName: true, cadre: true } },
      reviewedBy: { select: { fullName: true } },
    },
  });

  if (!screening) notFound();

  const statusClass: Record<string, string> = {
    PENDING: "bg-warning text-dark",
    APPROVED: "bg-success",
    FLAGGED: "bg-danger",
    CORRECTED: "bg-info text-dark",
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/patients", label: "Patients", icon: "👥" },
    { href: "/screenings/new", label: "New Screening", icon: "➕" },
    { href: "/screenings", label: "All Screenings", icon: "📋" },
    { href: "/reports", label: "Reports", icon: "📤" },
    { href: "/profile", label: "My Profile", icon: "👤" },
  ];

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <div className="d-none d-md-flex flex-column p-3" style={{ width: 220, minWidth: 220, background: "#1a5276", minHeight: "100vh" }}>
        <div className="text-white fw-bold small mb-4">OGH SCD E-Tracker</div>
        <nav className="nav flex-column flex-grow-1">
          {navLinks.map(item => (
            <Link key={item.href} href={item.href}
              className="nav-link d-flex align-items-center gap-2 small rounded mb-1"
              style={{ color: "rgba(255,255,255,0.85)", padding: "0.5rem 0.75rem" }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-3 border-top border-secondary">
          <div className="text-white-50 small mb-2">{session.fullName}</div>
          <LogoutButton />
        </div>
      </div>

      <div className="flex-grow-1 p-3 p-md-4" style={{ background: "#f8f9fa", minWidth: 0 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Link href="/screenings" className="text-muted small text-decoration-none">← All Screenings</Link>
            <h1 className="h4 fw-bold mb-0 mt-1">Screening Detail</h1>
            <p className="text-muted small mb-0 font-monospace">{screening.patient.patientCode}</p>
          </div>
          <span className={`badge fs-6 ${statusClass[screening.reviewStatus] ?? "bg-secondary"}`}>
            {screening.reviewStatus}
          </span>
        </div>

        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold">Patient Information</div>
          <div className="card-body">
            <div className="row g-3 small">
              <div className="col-6 col-md-3">
                <div className="text-muted">Patient ID</div>
                <div className="fw-semibold font-monospace">{screening.patient.patientCode}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Full Name</div>
                <div className="fw-semibold">{screening.patient.firstName} {screening.patient.lastName}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Sex</div>
                <div className="fw-semibold">{screening.patient.sex}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Date of Birth</div>
                <div className="fw-semibold">{new Date(screening.patient.dateOfBirth).toLocaleDateString("en-GB")}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Phone</div>
                <div className="fw-semibold">{screening.patient.phoneNumber || "—"}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">NHIS</div>
                <div className="fw-semibold">{screening.patient.nhisStatus}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Locality</div>
                <div className="fw-semibold">{screening.patient.locality || "—"}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">District</div>
                <div className="fw-semibold">{screening.patient.district || "—"}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-semibold">Screening Data</div>
          <div className="card-body">
            <div className="row g-3 small">
              <div className="col-6 col-md-3">
                <div className="text-muted">Date & Time</div>
                <div className="fw-semibold">{new Date(screening.screeningDatetime).toLocaleString("en-GB")}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Type</div>
                <span className={`badge ${screening.screeningType === "NEWBORN" ? "bg-info text-dark" : "bg-primary"}`}>
                  {screening.screeningType === "CATCH_UP" ? "Catch-Up" : "Newborn"}
                </span>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Result</div>
                <div className="fw-semibold">{screening.screeningResult}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Confirmatory Action</div>
                <div className="fw-semibold">{screening.confirmatoryAction}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Treatment Started</div>
                <div className="fw-semibold">{screening.treatmentStarted ? "✅ Yes" : "❌ No"}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Facility</div>
                <div className="fw-semibold">{screening.facilityName || "—"}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Entered By</div>
                <div className="fw-semibold">{screening.enteredBy.fullName}</div>
              </div>
              {screening.remarks && (
                <div className="col-12">
                  <div className="text-muted">Remarks</div>
                  <div className="fw-semibold">{screening.remarks}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {screening.treatmentStarted && (
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold text-success">💊 Treatment Details</div>
            <div className="card-body">
              <div className="row g-3 small">
                {screening.treatmentStartDate && (
                  <div className="col-6 col-md-3">
                    <div className="text-muted">Start Date</div>
                    <div className="fw-semibold">{new Date(screening.treatmentStartDate).toLocaleDateString("en-GB")}</div>
                  </div>
                )}
                {screening.medicationPlan && (
                  <div className="col-12 col-md-6">
                    <div className="text-muted">Medication / Plan</div>
                    <div className="fw-semibold">{screening.medicationPlan}</div>
                  </div>
                )}
                {screening.treatmentNotes && (
                  <div className="col-12">
                    <div className="text-muted">Treatment Notes</div>
                    <div className="fw-semibold">{screening.treatmentNotes}</div>
                  </div>
                )}
                {screening.referralNotes && (
                  <div className="col-12">
                    <div className="text-muted">Referral Notes</div>
                    <div className="fw-semibold">{screening.referralNotes}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="d-flex gap-2 flex-wrap">
          <Link href="/screenings" className="btn btn-outline-secondary btn-sm">← Back to Screenings</Link>
          <Link href="/dashboard" className="btn btn-outline-secondary btn-sm">🏠 Dashboard</Link>
          <Link href="/screenings/new" className="btn btn-sm text-white" style={{ background: "#1a5276" }}>+ New Screening</Link>
        </div>
      </div>
    </div>
  );
}
