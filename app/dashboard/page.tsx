import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import DashboardCharts from "@/components/DashboardCharts";

function getDateRange(filter: string) {
  const now = new Date();
  switch (filter) {
    case "week":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "year":
      return new Date(now.getFullYear(), 0, 1);
    default:
      return null;
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const filter = searchParams.filter || "all";
  const since = getDateRange(filter);
  const dateWhere = since ? { screeningDatetime: { gte: since } } : {};

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const baseWhere = { archivedAt: null, ...dateWhere };

  const [total, thisWeek, thisMonth, pending, catchUp, newborn, treatment, patients] =
    await Promise.all([
      prisma.screening.count({ where: { archivedAt: null, ...dateWhere } }),
      prisma.screening.count({ where: { archivedAt: null, screeningDatetime: { gte: weekAgo } } }),
      prisma.screening.count({ where: { archivedAt: null, screeningDatetime: { gte: monthStart } } }),
      prisma.screening.count({ where: { archivedAt: null, reviewStatus: "PENDING", ...dateWhere } }),
      prisma.screening.count({ where: { archivedAt: null, screeningType: "CATCH_UP", ...dateWhere } }),
      prisma.screening.count({ where: { archivedAt: null, screeningType: "NEWBORN", ...dateWhere } }),
      prisma.screening.count({ where: { archivedAt: null, treatmentStarted: true, ...dateWhere } }),
      prisma.patient.count({ where: { archivedAt: null } }),
    ]);

  const recent = await prisma.screening.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      patient: { select: { patientCode: true, firstName: true, lastName: true, id: true } },
    },
  });

  const resultCounts = await prisma.screening.groupBy({
    by: ["screeningResult"],
    where: baseWhere,
    _count: { id: true },
  });

  const typeCounts = await prisma.screening.groupBy({
    by: ["screeningType"],
    where: baseWhere,
    _count: { id: true },
  });

  const statusCounts = await prisma.screening.groupBy({
    by: ["reviewStatus"],
    where: baseWhere,
    _count: { id: true },
  });

  const localityCounts = await prisma.screening.groupBy({
    by: ["localityOfResidence"],
    where: { ...baseWhere, localityOfResidence: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 8,
  });

  const treatmentCounts = await prisma.screening.groupBy({
    by: ["treatmentStarted"],
    where: baseWhere,
    _count: { id: true },
  });

  // Last 7 days trend
  const trendData = await Promise.all(
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return prisma.screening.count({
        where: { archivedAt: null, screeningDatetime: { gte: d, lt: next } },
      }).then(count => ({
        label: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" }),
        count,
      }));
    })
  );

  const sexCounts = await prisma.patient.groupBy({
    by: ["sex"],
    where: { archivedAt: null },
    _count: { id: true },
  });

  const filterLabels: Record<string, string> = {
    all: "All Time",
    week: "This Week",
    month: "This Month",
    year: "This Year",
  };

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName}
        facilityName={session.facilityName} active="/dashboard" />
      <div className="flex-grow-1 p-3 p-md-4 pb-5 pb-md-4"
        style={{ background: "#f8f9fa", minWidth: 0 }}>

        {/* Header */}
        <div className="mb-3 mt-5 mt-md-0 d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div>
            <h1 className="h4 fw-bold mb-0">Dashboard</h1>
            <p className="text-muted small mb-0">
              Welcome, {session.fullName} · {filterLabels[filter]}
            </p>
          </div>
          <Link href="/screenings/new"
            className="btn btn-sm text-white" style={{ background: "#1a5276" }}>
            ➕ New Screening
          </Link>
        </div>

        {/* Date filter buttons */}
        <div className="d-flex gap-2 flex-wrap mb-4">
          {Object.entries(filterLabels).map(([key, label]) => (
            <a key={key} href={`/dashboard?filter=${key}`}
              className={`btn btn-sm ${filter === key
                ? "text-white" : "btn-outline-secondary"}`}
              style={filter === key ? { background: "#1a5276" } : {}}>
              {label}
            </a>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="row g-3 mb-4">
          {[
            { label: "Total Screenings", value: total, color: "#1a5276", icon: "🔬" },
            { label: "This Week", value: thisWeek, color: "#117a8b", icon: "📅" },
            { label: "This Month", value: thisMonth, color: "#0d6efd", icon: "🗓️" },
            { label: "Pending Review", value: pending, color: "#dc3545", icon: "⏳",
              link: session.role !== "SCREENER" ? "/review" : undefined },
            { label: "Catch-Up", value: catchUp, color: "#6f42c1", icon: "📌" },
            { label: "Newborn", value: newborn, color: "#0dcaf0", icon: "👶" },
            { label: "On Treatment", value: treatment, color: "#198754", icon: "💊" },
            { label: "Total Patients", value: patients, color: "#fd7e14", icon: "👥" },
          ].map(k => (
            <div key={k.label} className="col-6 col-md-3">
              {k.link ? (
                <Link href={k.link} className="text-decoration-none">
                  <div className="card border-0 shadow-sm h-100"
                    style={{ borderLeft: `4px solid ${k.color}` }}>
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="text-muted small">{k.label}</div>
                          <div className="fw-bold" style={{ fontSize: "1.6rem", color: k.color }}>
                            {k.value}
                          </div>
                        </div>
                        <span style={{ fontSize: "1.4rem" }}>{k.icon}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="card border-0 shadow-sm h-100"
                  style={{ borderLeft: `4px solid ${k.color}` }}>
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="text-muted small">{k.label}</div>
                        <div className="fw-bold" style={{ fontSize: "1.6rem", color: k.color }}>
                          {k.value}
                        </div>
                      </div>
                      <span style={{ fontSize: "1.4rem" }}>{k.icon}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Charts */}
        <DashboardCharts
          trendData={trendData}
          resultCounts={resultCounts.map(r => ({
            label: r.screeningResult, count: r._count.id,
          }))}
          typeCounts={typeCounts.map(t => ({
            label: t.screeningType, count: t._count.id,
          }))}
          statusCounts={statusCounts.map(s => ({
            label: s.reviewStatus, count: s._count.id,
          }))}
          localityCounts={localityCounts.map(l => ({
            label: l.localityOfResidence ?? "Unknown", count: l._count.id,
          }))}
          treatmentCounts={treatmentCounts.map(t => ({
            label: t.treatmentStarted ? "On Treatment" : "Not Started",
            count: t._count.id,
          }))}
          sexCounts={sexCounts.map(s => ({
            label: s.sex, count: s._count.id,
          }))}
          filterLabel={filterLabels[filter]}
        />

        {/* Recent screenings */}
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-header bg-white fw-semibold d-flex justify-content-between align-items-center">
            <span>🕐 Recent Screenings</span>
            <Link href="/screenings" className="btn btn-sm btn-outline-secondary">
              View All
            </Link>
          </div>
          <div className="card-body p-0">
            {recent.length === 0 ? (
              <div className="text-center text-muted py-4 small">No screenings yet</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0 small align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Patient</th>
                      <th>Code</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(s => (
                      <tr key={s.id}>
                        <td>
                          <Link href={`/screenings/${s.id}`}
                            className="text-decoration-none fw-semibold">
                            {s.patient.firstName} {s.patient.lastName}
                          </Link>
                        </td>
                        <td style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                          {s.patient.patientCode}
                        </td>
                        <td className="text-muted">
                          {new Date(s.createdAt).toLocaleDateString("en-GB")}
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
