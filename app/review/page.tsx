import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ReviewSearch from "@/components/ReviewSearch";
import ReviewQueue from "@/components/ReviewQueue";

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
      reviewStatus: { in: ["PENDING", "FLAGGED", "CORRECTED"] },
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
      patient: { select: { patientCode: true, firstName: true, lastName: true, sex: true, isMultipleBirth: true, multipleBirthType: true, birthOrder: true } },
      enteredBy: { select: { fullName: true, cadre: true } },
    },
  });

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName}
        facilityName={session.facilityName} active="/review" />
      <div className="flex-grow-1 p-3 p-md-4"
        style={{ background: "#f8f9fa", minWidth: 0, paddingBottom: "120px" }}>

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
            <ReviewQueue screenings={pending.map(s => ({
              id: s.id,
              reviewStatus: s.reviewStatus,
              screeningDatetime: s.screeningDatetime.toISOString(),
              screeningType: s.screeningType,
              screeningResult: s.screeningResult,
              treatmentStarted: s.treatmentStarted,
              patient: s.patient,
              enteredBy: s.enteredBy,
            }))} />
          </>
        )}
      </div>
    </div>
  );
}
