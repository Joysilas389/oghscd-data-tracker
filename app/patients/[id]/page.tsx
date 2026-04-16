import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PatientDetailPage({ params }: Props) {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      screenings: {
        where: { archivedAt: null },
        orderBy: { screeningDatetime: "desc" },
        include: { enteredBy: { select: { fullName: true } } },
      },
    },
  });

  if (!patient) notFound();

  const statusClass: Record<string, string> = {
    PENDING: "bg-warning text-dark",
    APPROVED: "bg-success",
    FLAGGED: "bg-danger",
    CORRECTED: "bg-info text-dark",
  };

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName} facilityName={session.facilityName} active="/patients" />
      <div className="flex-grow-1 p-3 p-md-4" style={{ background: "#f8f9fa", minWidth: 0 }}>
        <div className="mb-4 mt-5 mt-md-0">
          <Link href="/patients" className="text-muted small text-decoration-none">← All Patients</Link>
          <h1 className="h4 fw-bold mb-0 mt-1">{patient.firstName} {patient.lastName}</h1>
          <span className="font-monospace small text-muted">{patient.patientCode}</span>
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white fw-semibold">Patient Information</div>
          <div className="card-body">
            <div className="row g-3 small">
              <div className="col-6 col-md-3">
                <div className="text-muted">Patient ID</div>
                <div className="fw-semibold font-monospace">{patient.patientCode}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Sex</div>
                <div className="fw-semibold">{patient.sex}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Date of Birth</div>
                <div className="fw-semibold">{new Date(patient.dateOfBirth).toLocaleDateString("en-GB")}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Phone</div>
                <div className="fw-semibold">{patient.phoneNumber || "—"}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">NHIS Status</div>
                <div className="fw-semibold">{patient.nhisStatus}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Ethnicity</div>
                <div className="fw-semibold">{patient.ethnicity || "—"}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Locality</div>
                <div className="fw-semibold">{patient.locality || "—"}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">District</div>
                <div className="fw-semibold">{patient.district || "—"}</div>
              </div>
              {patient.address && (
                <div className="col-12">
                  <div className="text-muted">Address</div>
                  <div className="fw-semibold">{patient.address}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <span className="fw-semibold">Visit History ({patient.screenings.length} screening{patient.screenings.length !== 1 ? "s" : ""})</span>
            <Link href="/screenings/new" className="btn btn-sm text-white" style={{ background: "#1a5276" }}>+ New Screening</Link>
          </div>
          <div className="card-body p-0">
            {patient.screenings.length === 0 ? (
              <div className="text-center text-muted py-4 small">No screenings recorded yet.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Result</th>
                      <th>Treatment</th>
                      <th>Status</th>
                      <th>By</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.screenings.map(s => (
                      <tr key={s.id}>
                        <td>{new Date(s.screeningDatetime).toLocaleDateString("en-GB")}</td>
                        <td>
                          <span className={`badge ${s.screeningType === "NEWBORN" ? "bg-info text-dark" : "bg-primary"}`}>
                            {s.screeningType === "CATCH_UP" ? "Catch-Up" : "Newborn"}
                          </span>
                        </td>
                        <td>{s.screeningResult}</td>
                        <td>{s.treatmentStarted ? "✅ Yes" : "❌ No"}</td>
                        <td>
                          <span className={`badge ${statusClass[s.reviewStatus] ?? "bg-secondary"}`}>
                            {s.reviewStatus}
                          </span>
                        </td>
                        <td>{s.enteredBy.fullName}</td>
                        <td>
                          <Link href={`/screenings/${s.id}`} className="btn btn-sm btn-outline-primary py-0 px-2">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
