import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import DashboardCharts from "@/components/DashboardCharts";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, thisWeek, thisMonth, pending, catchUp, newborn, treatment, patients] = await Promise.all([
    prisma.screening.count({ where: { archivedAt: null } }),
    prisma.screening.count({ where: { archivedAt: null, screeningDatetime: { gte: weekAgo } } }),
    prisma.screening.count({ where: { archivedAt: null, screeningDatetime: { gte: monthStart } } }),
    prisma.screening.count({ where: { archivedAt: null, reviewStatus: "PENDING" } }),
    prisma.screening.count({ where: { archivedAt: null, screeningType: "CATCH_UP" } }),
    prisma.screening.count({ where: { archivedAt: null, screeningType: "NEWBORN" } }),
    prisma.screening.count({ where: { archivedAt: null, treatmentStarted: true } }),
    prisma.patient.count({ where: { archivedAt: null } }),
  ]);

  const recent = await prisma.screening.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { patient: { select: { patientCode: true, firstName: true, lastName: true, id: true } } },
  });

  // Aggregated chart data - NO patient identifiers
  const resultCounts = await prisma.screening.groupBy({
    by: ["screeningResult"],
    where: { archivedAt: null },
    _count: { id: true },
  });

  const typeCounts = await prisma.screening.groupBy({
    by: ["screeningType"],
    where: { archivedAt: null },
    _count: { id: true },
  });

  const statusCounts = await prisma.screening.groupBy({
    by: ["reviewStatus"],
    where: { archivedAt: null },
    _count: { id: true },
  });

  const sexCounts = await prisma.patient.groupBy({
    by: ["sex"],
    where: { archivedAt: null },
    _count: { id: true },
  });

  // Last 7 days trend
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const trendData = await Promise.all(
    last7Days.map(async day => {
      const start = new Date(day);
      const end = new Date(day);
      end.setDate(end.getDate() + 1);
      const count = await prisma.screening.count({
        where: { archivedAt: null, screeningDatetime: { gte: start, lt: end } },
      });
      return { day: day.slice(5), count };
    })
  );

  const kpis = [
    { label: "Total Screenings", value: total, color: "#1a5276", icon: "📋" },
    { label: "This Week", value: thisWeek, color: "#117a8b", icon: "📅" },
    { label: "This Month", value: thisMonth, color: "#155724", icon: "📆" },
    { label: "Pending Review", value: pending, color: "#856404", icon: "⏳" },
    { label: "Total Patients", value: patients, color: "#6f42c1", icon: "👥" },
    { label: "Catch-Up", value: catchUp, color: "#0d6efd", icon: "🔄" },
    { label: "Newborn", value: newborn, color: "#d63384", icon: "👶" },
    { label: "On Treatment", value: treatment, color: "#198754", icon: "💊" },
  ];

  const statusClass: Record<string, string> = {
    PENDING: "bg-warning text-dark",
    APPROVED: "bg-success",
    FLAGGED: "bg-danger",
    CORRECTED: "bg-info text-dark",
  };

  const chartData = {
    results: resultCounts.map(r => ({ label: r.screeningResult, value: r._count.id })),
    types: typeCounts.map(t => ({ label: t.screeningType === "CATCH_UP" ? "Catch-Up" : "Newborn", value: t._count.id })),
    statuses: statusCounts.map(s => ({ label: s.reviewStatus, value: s._count.id })),
    sexes: sexCounts.map(s => ({ label: s.sex, value: s._count.id })),
    trend: trendData,
  };

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName} facilityName={session.facilityName} active="/dashboard" />
      <div className="flex-grow-1 p-3 p-md-4 pb-5 pb-md-4" style={{ background: "#f8f9fa", minWidth: 0 }}>
        <div className="d-flex justify-content-between align-items-center mb-4 mt-5 mt-md-0">
          <div>
            <h1 className="h4 fw-bold mb-0">Dashboard</h1>
            <p className="text-muted small mb-0">Welcome, {session.fullName} · <span className={`badge ${session.role === "ADMIN" ? "bg-danger" : session.role === "MANAGER" ? "bg-warning text-dark" : "bg-primary"}`}>{session.role}</span></p>
          </div>
          <Link href="/screenings/new" className="btn btn-sm text-white d-none d-md-block" style={{ background: "#1a5276" }}>
            + New Screening
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="row g-3 mb-4">
          {kpis.map(k => (
            <div key={k.label} className="col-6 col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-3" style={{ borderLeft: `4px solid ${k.color}` }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="text-muted small">{k.label}</div>
                      <div className="h3 fw-bold mb-0" style={{ color: k.color }}>{k.value}</div>
                    </div>
                    <span className="fs-4">{k.icon}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        {total > 0 && <DashboardCharts data={chartData} />}

        {/* Recent screenings */}
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center py-2">
            <h5 className="mb-0 fw-semibold small">Recent Screenings</h5>
            <Link href="/screenings" className="btn btn-sm btn-outline-secondary py-0">View All</Link>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 small">
                <thead className="table-light">
                  <tr><th>Patient ID</th><th>Name</th><th>Type</th><th>Date</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {recent.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-muted py-4">
                      No screenings yet. <Link href="/screenings/new">Add first →</Link>
                    </td></tr>
                  ) : recent.map(s => (
                    <tr key={s.id}>
                      <td className="font-monospace" style={{ fontSize: "0.75rem" }}>{s.patient.patientCode}</td>
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
                      <td>{new Date(s.screeningDatetime).toLocaleDateString("en-GB")}</td>
                      <td><span className={`badge ${statusClass[s.reviewStatus] ?? "bg-secondary"}`}>{s.reviewStatus}</span></td>
                      <td><Link href={`/screenings/${s.id}`} className="btn btn-sm btn-outline-primary py-0 px-2">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {pending > 0 && (session.role === "MANAGER" || session.role === "ADMIN") && (
          <div className="alert alert-warning mt-3 small">
            ⏳ <strong>{pending}</strong> screening(s) awaiting review.{" "}
            <Link href="/review" className="alert-link">Go to Review Queue →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
