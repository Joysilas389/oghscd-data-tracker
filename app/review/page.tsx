import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ReviewActions from "@/components/ReviewActions";

export default async function ReviewPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (session.role === "SCREENER") redirect("/dashboard");

  const pending = await prisma.screening.findMany({
    where: { archivedAt: null, reviewStatus: { in: ["PENDING", "FLAGGED"] } },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: {
      patient: { select: { patientCode: true, firstName: true, lastName: true, sex: true } },
      enteredBy: { select: { fullName: true, cadre: true } },
    },
  });

  const statusClass: Record<string, string> = {
    PENDING: "bg-warning text-dark",
    APPROVED: "bg-success",
    FLAGGED: "bg-danger",
    CORRECTED: "bg-info text-dark",
  };

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName} facilityName={session.facilityName} active="/review" />
      <div className="flex-grow-1 p-3 p-md-4" style={{ background: "#f8f9fa", minWidth: 0 }}>
        <div className="mb-4 mt-5 mt-md-0 pt-3">
          <h1 className="h4 fw-bold mb-0">Review Queue</h1>
          <p className="text-muted small">Pending and flagged screenings requiring review</p>
        </div>

        {pending.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <div className="fs-1 mb-3">✅</div>
              <h5 className="fw-semibold">All caught up!</h5>
              <p className="text-muted small">No screenings pending review.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="alert alert-warning small mb-3">
              <strong>{pending.length}</strong> record(s) awaiting review
            </div>
            <div className="d-flex flex-column gap-3">
              {pending.map(s => (
                <div key={s.id} className="card border-0 shadow-sm">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className="font-monospace small text-muted">{s.patient.patientCode}</span>
                        <h6 className="fw-semibold mb-0">{s.patient.firstName} {s.patient.lastName}</h6>
                        <span className="text-muted small">{s.patient.sex} · {new Date(s.screeningDatetime).toLocaleDateString("en-GB")}</span>
                      </div>
                      <span className={`badge ${statusClass[s.reviewStatus]}`}>{s.reviewStatus}</span>
                    </div>
                    <div className="row g-2 small mb-3">
                      <div className="col-6">
                        <span className="text-muted">Type: </span>
                        <span className={`badge ${s.screeningType === "NEWBORN" ? "bg-info text-dark" : "bg-primary"}`}>
                          {s.screeningType === "CATCH_UP" ? "Catch-Up" : "Newborn"}
                        </span>
                      </div>
                      <div className="col-6">
                        <span className="text-muted">Result: </span>
                        <strong>{s.screeningResult}</strong>
                      </div>
                      <div className="col-6">
                        <span className="text-muted">Treatment: </span>
                        <strong>{s.treatmentStarted ? "Yes" : "No"}</strong>
                      </div>
                      <div className="col-6">
                        <span className="text-muted">By: </span>
                        <strong>{s.enteredBy.fullName}</strong>
                      </div>
                    </div>
                    <ReviewActions screeningId={s.id} currentStatus={s.reviewStatus} />
                    <Link href={`/screenings/${s.id}`} className="btn btn-sm btn-outline-secondary mt-2">
                      View Full Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
