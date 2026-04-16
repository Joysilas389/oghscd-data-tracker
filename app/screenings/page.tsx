import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ScreeningRowActions from "@/components/ScreeningRowActions";
import ScreeningsSearch from "@/components/ScreeningsSearch";

export default async function ScreeningsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  const { q } = await searchParams;

  const screenings = await prisma.screening.findMany({
    where: {
      archivedAt: null,
      ...(q ? {
        OR: [
          { patient: { firstName: { contains: q, mode: "insensitive" } } },
          { patient: { lastName: { contains: q, mode: "insensitive" } } },
          { patient: { patientCode: { contains: q, mode: "insensitive" } } },
          { screeningResult: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    },
    orderBy: { screeningDatetime: "desc" },
    take: 100,
    include: {
      patient: { select: { patientCode: true, firstName: true, lastName: true, id: true } },
      enteredBy: { select: { id: true } },
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
      <Sidebar role={session.role} fullName={session.fullName}
        facilityName={session.facilityName} active="/screenings" />
      <div className="flex-grow-1 p-3 p-md-4 pb-5 pb-md-4"
        style={{ background: "#f8f9fa", minWidth: 0 }}>
        <div className="d-flex justify-content-between align-items-center mb-3 mt-5 mt-md-0 pt-2">
          <div>
            <h1 className="h4 fw-bold mb-0">All Screenings</h1>
            <p className="text-muted small mb-0">
              {screenings.length} record(s){q ? ` matching "${q}"` : ""}
            </p>
          </div>
          <Link href="/screenings/new" className="btn btn-sm text-white"
            style={{ background: "#1a5276" }}>+ New</Link>
        </div>
        <ScreeningsSearch defaultValue={q ?? ""} />
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 small">
                <thead className="table-light">
                  <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Result</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {screenings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        {q ? `No results for "${q}"` : "No screenings yet."}{" "}
                        {!q && <Link href="/screenings/new">Add first →</Link>}
                      </td>
                    </tr>
                  ) : screenings.map(s => (
                    <tr key={s.id}>
                      <td className="font-monospace" style={{ fontSize: "0.75rem" }}>
                        {s.patient.patientCode}
                      </td>
                      <td>
                        <Link href={`/patients/${s.patient.id}`} className="text-decoration-none">
                          {s.patient.firstName} {s.patient.lastName}
                        </Link>
                      </td>
                      <td>
                        <span className={`badge ${s.screeningType === "NEWBORN" ? "bg-info text-dark" : "bg-primary"}`}>
                          {s.screeningType === "CATCH_UP" ? "Catch-Up" : "Newborn"}
                        </span>
                      </td>
                      <td style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.screeningResult}
                      </td>
                      <td>{new Date(s.screeningDatetime).toLocaleDateString("en-GB")}</td>
                      <td>
                        <span className={`badge ${statusClass[s.reviewStatus] ?? "bg-secondary"}`}>
                          {s.reviewStatus}
                        </span>
                      </td>
                      <td>
                        <ScreeningRowActions
                          screeningId={s.id}
                          reviewStatus={s.reviewStatus}
                          enteredById={s.enteredBy.id}
                          currentUserId={session.userId}
                          currentUserRole={session.role}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
