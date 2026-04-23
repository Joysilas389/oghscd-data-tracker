import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ReviewActions from "@/components/ReviewActions";
import ReviewSearch from "@/components/ReviewSearch";
import BulkReviewControls from "@/components/BulkReviewControls";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (session.role === "SCREENER") redirect("/dashboard");

  const { q } = await searchParams;

  const pending = await prisma.screening.findMany({
    where: {
      archivedAt: null,
      reviewStatus: { in: ["PENDING", "FLAGGED"] },
      ...(q ? {
        OR: [
          { patient: { firstName: { contains: q, mode: "insensitive" } } },
          { patient: { lastName: { contains: q, mode: "insensitive" } } },
          { patient: { patientCode: { contains: q, mode: "insensitive" } } },
          { screeningResult: { contains: q, mode: "insensitive" } },
          { enteredBy: { fullName: { contains: q, mode: "insensitive" } } },
        ],
      } : {}),
    },
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

  const bulkItems = pending.map(s => ({
    id: s.id,
    patientName: `${s.patient.firstName} ${s.patient.lastName}`,
    patientCode: s.patient.patientCode,
    result: s.screeningResult,
    status: s.reviewStatus,
  }));

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName}
        facilityName={session.facilityName} active="/review" />
      <div className="flex-grow-1 p-3 p-md-4"
        style={{ background: "#f8f9fa", minWidth: 0, paddingBottom: "120px" }}>

        {/* Header */}
        <div className="mb-3 mt-5 mt-md-0 pt-3">
          <h1 className="h4 fw-bold mb-0">Review Queue</h1>
          <p className="text-muted small mb-0">
            Pending and flagged screenings requiring review
          </p>
        </div>

        <ReviewSearch defaultValue={q ?? ""} />

        {pending.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <div className="fs-1 mb-3">{q ? "🔍" : "✅"}</div>
              <h5 className="fw-semibold">
                {q ? `No results for "${q}"` : "All caught up!"}
              </h5>
              <p className="text-muted small">
                {q ? "Try a different search term." : "No screenings pending review."}
              </p>
              {q && (
                <Link href="/review" className="btn btn-sm btn-outline-secondary">
                  Clear search
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="alert alert-warning small mb-3">
              <strong>{pending.length}</strong> record(s) awaiting review
              {q && <span className="ms-1">matching "<strong>{q}</strong>"</span>}
            </div>

            {/* Bulk controls wraps everything */}
            <BulkReviewControls screenings={bulkItems} />

            {/* Individual cards rendered server-side for performance */}
            <div className="d-flex flex-column gap-3 mt-3" style={{ paddingBottom: "100px" }}>
              {pending.map(s => (
                <div key={s.id} className="card border-0 shadow-sm"
                  data-id={s.id}>
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className="font-monospace small text-muted">
                          {s.patient.patientCode}
                        </span>
                        <h6 className="fw-semibold mb-0">
                          {s.patient.firstName} {s.patient.lastName}
                        </h6>
                        <span className="text-muted small">
                          {s.patient.sex} · {new Date(s.screeningDatetime).toLocaleDateString("en-GB")}
                        </span>
                      </div>
                      <span className={`badge ${statusClass[s.reviewStatus]}`}>
                        {s.reviewStatus}
                      </span>
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
                    <Link href={`/screenings/${s.id}`}
                      className="btn btn-sm btn-outline-secondary mt-2">
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
