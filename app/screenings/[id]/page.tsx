import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function ScreeningDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const screening = await prisma.screening.findUnique({
    where: { id: params.id },
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

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <div className="d-none d-md-flex flex-column p-3" style={{ width: 220, minWidth: 220, background: "#1a5276", minHeight: "100vh" }}>
        <div className="text-white fw-bold small mb-4">OGH SCD E-Tracker</div>
        <nav className="nav flex-column">
          {[
            { href: "/dashboard", label: "Dashboard", icon: "📊" },
            { href: "/patients", label: "Patients", icon: "👥" },
            { href: "/screenings/new", label: "New Screening", icon: "➕" },
            { href: "/screenings", label: "All Screenings", icon: "📋" },
            { href: "/reports", label: "Reports", icon: "📤" },
            { href: "/profile", label: "My Profile", icon: "👤" },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="nav-link d-flex align-items-center gap-2 small rounded mb-1"
              style={{ color: "rgba(255,255,255,0.8)", padding: "0.5rem 0.75rem" }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex-grow-1 p-3 p-md-4" style={{ background: "#f8f9fa", minWidth: 0 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Link href="/screenings" className="text-muted small text-decoration-none">← All Screenings</Link>
            <h1 className="h4 fw-bold mb-0 mt-1">Screening Detail</h1>
          </div>
          <span className={`badge fs-6 ${statusClass[screening.reviewStatus] ?? "bg-secondary"}`}>
            {screening.reviewStatus}
          </span>
        </div>

        {/* Patient Info */}
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
                <div className="text-muted">NHIS Status</div>
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

        {/* Screening Info */}
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
                <div className="fw-semibold">
                  <span className={`badge ${screening.screeningType === "NEWBORN" ? "bg-info text-dark" : "bg-primary"}`}>
                    {screening.screeningType === "CATCH_UP" ? "Catch-Up" : "Newborn"}
                  </span>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Result</div>
                <div className="fw-semibold">{screening.screeningResult}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Confirmatory Action</div>
                <div className="fw-semibold">{screening.confirmatoryAction}</div>
              </div>
              {screening.confirmedResult && (
                <div className="col-6 col-md-3">
                  <div className="text-muted">Confirmed Result</div>
                  <div className="fw-semibold">{screening.confirmedResult}</div>
                </div>
              )}
              {screening.remarks && (
                <div className="col-12">
                  <div className="text-muted">Remarks</div>
                  <div className="fw-semibold">{screening.remarks}</div>
                </div>
              )}
              <div className="col-6 col-md-3">
                <div className="text-muted">Facility</div>
                <div className="fw-semibold">{screening.facilityName || "—"}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Entered By</div>
                <div className="fw-semibold">{screening.enteredBy.fullName} ({screening.enteredBy.cadre})</div>
              </div>
            </div>
          </div>
        </div>

        {/* Treatment */}
        {screening.treatmentStarted && (
          <div className="card border-0 shadow-sm mb-3 border-start border-success border-3">
            <div className="card-header bg-white fw-semibold text-success">Treatment Details</div>
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

        {/* Review */}
        {screening.reviewedBy && (
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold">Review</div>
            <div className="card-body small">
              <div><span className="text-muted">Reviewed by:</span> {screening.reviewedBy.fullName}</div>
              <div><span className="text-muted">Reviewed at:</span> {screening.reviewedAt ? new Date(screening.reviewedAt).toLocaleString("en-GB") : "—"}</div>
              {screening.reviewNote && <div><span className="text-muted">Note:</span> {screening.reviewNote}</div>}
            </div>
          </div>
        )}

        <div className="d-flex gap-2">
          <Link href="/screenings" className="btn btn-outline-secondary btn-sm">← Back</Link>
          <Link href="/screenings/new" className="btn btn-sm text-white" style={{ background: "#1a5276" }}>+ New Screening</Link>
        </div>
      </div>
    </div>
  );
}
