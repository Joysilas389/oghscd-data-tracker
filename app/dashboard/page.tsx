import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Link from "next/link";

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
    include: { patient: { select: { patientCode: true, firstName: true, lastName: true } } },
  });

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

  async function logout() {
    "use server";
    const { cookies } = await import("next/headers");
    const { getIronSession } = await import("iron-session");
    const { sessionOptions } = await import("@/lib/session");
    const cookieStore = await cookies();
    const sess = await getIronSession(cookieStore, sessionOptions);
    sess.destroy();
  }

  return (
    <div className="d-flex" style={{minHeight:"100vh"}}>
      {/* Sidebar */}
      <div className="d-none d-md-flex flex-column p-3" style={{width:220,minWidth:220,background:"#1a5276",minHeight:"100vh"}}>
        <div className="text-white fw-bold small mb-4">OGH SCD E-Tracker</div>
        <nav className="nav flex-column flex-grow-1">
          {[
            {href:"/dashboard",label:"Dashboard",icon:"📊"},
            {href:"/patients",label:"Patients",icon:"👥"},
            {href:"/screenings/new",label:"New Screening",icon:"➕"},
            {href:"/screenings",label:"All Screenings",icon:"📋"},
            {href:"/reports",label:"Reports",icon:"📤"},
            {href:"/profile",label:"My Profile",icon:"👤"},
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="nav-link d-flex align-items-center gap-2 small rounded mb-1"
              style={{color:"rgba(255,255,255,0.8)",padding:"0.5rem 0.75rem"}}>
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-3 border-top border-secondary">
          <div className="text-white-50 small text-truncate mb-1">{session.fullName}</div>
          <div className="text-white-50 small mb-2">{session.role}</div>
          <form action={logout}>
            <button type="submit" className="btn btn-sm btn-outline-light w-100">Sign Out</button>
          </form>
        </div>
      </div>

      {/* Main */}
      <div className="flex-grow-1 p-3 p-md-4" style={{background:"#f8f9fa",minWidth:0}}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h4 fw-bold mb-0">Dashboard</h1>
            <p className="text-muted small mb-0">Welcome, {session.fullName}</p>
          </div>
          <Link href="/screenings/new" className="btn btn-sm text-white"
            style={{background:"#1a5276"}}>+ New Screening</Link>
        </div>

        {/* KPI Cards */}
        <div className="row g-3 mb-4">
          {kpis.map(k => (
            <div key={k.label} className="col-6 col-md-4 col-lg-3">
              <div className="card h-100 border-0 shadow-sm" style={{borderLeft:`4px solid ${k.color}!important`}}>
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="text-muted small">{k.label}</div>
                      <div className="h3 fw-bold mb-0" style={{color:k.color}}>{k.value}</div>
                    </div>
                    <span className="fs-4">{k.icon}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent screenings */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-semibold small">Recent Screenings</h5>
            <Link href="/screenings" className="btn btn-sm btn-outline-secondary">View All</Link>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 small">
                <thead className="table-light">
                  <tr>
                    <th>Patient ID</th><th>Name</th><th>Type</th><th>Date</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {recent.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-muted py-4">
                      No screenings yet. <Link href="/screenings/new">Add first →</Link>
                    </td></tr>
                  ) : recent.map(s => (
                    <tr key={s.id}>
                      <td className="font-monospace small">{s.patient.patientCode}</td>
                      <td>{s.patient.firstName} {s.patient.lastName}</td>
                      <td><span className={`badge ${s.screeningType === "NEWBORN" ? "bg-info text-dark" : "bg-primary"}`}>
                        {s.screeningType === "CATCH_UP" ? "Catch-Up" : "Newborn"}
                      </span></td>
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
            <Link href="/review" className="alert-link">Go to review queue →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
