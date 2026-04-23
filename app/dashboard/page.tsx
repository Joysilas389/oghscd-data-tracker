import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import DashboardCharts from "@/components/DashboardCharts";
import AnimatedKPI from "@/components/AnimatedKPI";
import LiveFeed from "@/components/LiveFeed";
import HeatCalendar from "@/components/HeatCalendar";
import FlaggedRecordsAlert from "@/components/FlaggedRecordsAlert";

function getDateRange(filter: string) {
  const now = new Date();
  switch (filter) {
    case "week": return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "month": return new Date(now.getFullYear(), now.getMonth(), 1);
    case "year": return new Date(now.getFullYear(), 0, 1);
    default: return null;
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
  const baseWhere = { archivedAt: null, ...dateWhere };

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

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

  const myFlagged = session.role === "SCREENER"
    ? await prisma.screening.count({
        where: { archivedAt: null, reviewStatus: "FLAGGED", enteredById: session.userId }
      })
    : 0;

  const flaggedRecords = session.role === "SCREENER"
    ? await prisma.screening.findMany({
        where: { archivedAt: null, reviewStatus: "FLAGGED", enteredById: session.userId },
        include: { patient: { select: { firstName: true, lastName: true, patientCode: true } } },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  // Live feed - latest 5 screenings
  const recentScreenings = await prisma.screening.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      patient: { select: { firstName: true, lastName: true, patientCode: true, locality: true } },
    },
  });

  const feedItems = recentScreenings.map(s => ({
    id: s.id,
    patientName: `${s.patient.firstName} ${s.patient.lastName}`,
    patientCode: s.patient.patientCode,
    result: s.screeningResult,
    locality: s.patient.locality || "",
    createdAt: s.createdAt.toISOString(),
  }));

  // Heat calendar - last 70 days
  const heatData = await Promise.all(
    Array.from({ length: 70 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (69 - i));
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const key = d.toISOString().slice(0, 10);
      return prisma.screening.count({
        where: { archivedAt: null, screeningDatetime: { gte: d, lt: next } },
      }).then(count => ({ date: key, count }));
    })
  );

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

  const localityCounts = await prisma.patient.groupBy({
    by: ["locality"],
    where: { archivedAt: null, locality: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 8,
  });

  const treatmentCounts = await prisma.screening.groupBy({
    by: ["treatmentStarted"],
    where: baseWhere,
    _count: { id: true },
  });

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
    all: "All Time", week: "This Week", month: "This Month", year: "This Year",
  };

  const kpis = [
    { label: "Total Screenings", value: total, color: "#1a5276", icon: "🔬" },
    { label: "This Week", value: thisWeek, color: "#117a8b", icon: "📅" },
    { label: "This Month", value: thisMonth, color: "#0d6efd", icon: "🗓️" },
    { label: "Pending Review", value: pending, color: "#dc3545", icon: "⏳", alert: true,
      link: session.role !== "SCREENER" ? "/review" : undefined },
    { label: "Catch-Up", value: catchUp, color: "#6f42c1", icon: "📌" },
    { label: "Newborn", value: newborn, color: "#0dcaf0", icon: "👶" },
    { label: "On Treatment", value: treatment, color: "#198754", icon: "💊" },
    { label: "Total Patients", value: patients, color: "#fd7e14", icon: "👥" },
  ];

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName}
        facilityName={session.facilityName} active="/dashboard" />
      <div className="flex-grow-1 p-3 p-md-4 pb-5 pb-md-4 mb-5 mb-md-0"
        style={{ background: "#f8f9fa", minWidth: 0 }}>

        {/* Header */}
        <div className="mb-3 mt-5 mt-md-0 pt-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
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
              className={`btn btn-sm ${filter === key ? "text-white" : "btn-outline-secondary"}`}
              style={filter === key ? { background: "#1a5276" } : {}}>
              {label}
            </a>
          ))}
        </div>

        {/* Flagged alert for screeners */}
        <FlaggedRecordsAlert flagged={flaggedRecords.map(s => ({
          id: s.id,
          reviewNote: s.reviewNote,
          screeningDatetime: s.screeningDatetime.toISOString(),
          patient: s.patient,
        }))} />

        {/* Animated KPI Cards */}
        <AnimatedKPI kpis={kpis} />

        {/* Live Feed */}
        <LiveFeed initial={feedItems} />

        {/* Heat Calendar */}
        <HeatCalendar data={heatData} />

        {/* Charts */}
        <DashboardCharts
          trendData={trendData}
          resultCounts={resultCounts.map(r => ({ label: r.screeningResult, count: r._count.id }))}
          typeCounts={typeCounts.map(t => ({ label: t.screeningType, count: t._count.id }))}
          statusCounts={statusCounts.map(s => ({ label: s.reviewStatus, count: s._count.id }))}
          localityCounts={localityCounts.map(l => ({ label: l.locality ?? "Unknown", count: l._count.id }))}
          treatmentCounts={treatmentCounts.map(t => ({
            label: t.treatmentStarted ? "On Treatment" : "Not Started", count: t._count.id,
          }))}
          sexCounts={sexCounts.map(s => ({ label: s.sex, count: s._count.id }))}
          filterLabel={filterLabels[filter]}
        />
      </div>
    </div>
  );
}
