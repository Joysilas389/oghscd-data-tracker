import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function ScreeningsPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const screenings = await prisma.screening.findMany({
    where: { archivedAt: null },
    orderBy: { screeningDatetime: "desc" },
    take: 100,
    include: { patient: { select: { patientCode: true, firstName: true, lastName: true } } },
  });

  const statusClass: Record<string, string> = {
    PENDING: "bg-warning text-dark", APPROVED: "bg-success",
    FLAGGED: "bg-danger", CORRECTED: "bg-info text-dark",
  };

  return (
    <div className="d-flex" style={{minHeight:"100vh"}}>
      <div className="d-none d-md-flex flex-column p-3" style={{width:220,minWidth:220,background:"#1a5276",minHeight:"100vh"}}>
        <div className="text-white fw-bold small mb-4">OGH SCD E-Tracker</div>
        <nav className="nav flex-column">
          {[{href:"/dashboard",label:"Dashboard",icon:"📊"},{href:"/patients",label:"Patients",icon:"👥"},
            {href:"/screenings/new",label:"New Screening",icon:"➕"},{href:"/screenings",label:"All Screenings",icon:"📋"},
            {href:"/reports",label:"Reports",icon:"📤"},{href:"/profile",label:"My Profile",icon:"👤"}]
            .map(item => (
            <Link key={item.href} href={item.href}
              className="nav-link d-flex align-items-center gap-2 small rounded mb-1"
              style={{color:"rgba(255,255,255,0.8)",padding:"0.5rem 0.75rem"}}>
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex-grow-1 p-3 p-md-4" style={{background:"#f8f9fa",minWidth:0}}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h4 fw-bold mb-0">All Screenings</h1>
          <Link href="/screenings/new" className="btn btn-sm text-white" style={{background:"#1a5276"}}>+ New Screening</Link>
        </div>
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 small">
                <thead className="table-light">
                  <tr><th>Patient ID</th><th>Name</th><th>Type</th><th>Result</th><th>Date</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {screenings.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-muted py-4">
                      No screenings yet. <Link href="/screenings/new">Add first →</Link>
                    </td></tr>
                  ) : screenings.map(s => (
                    <tr key={s.id}>
                      <td className="font-monospace small">{s.patient.patientCode}</td>
                      <td>{s.patient.firstName} {s.patient.lastName}</td>
                      <td><span className={`badge ${s.screeningType === "NEWBORN" ? "bg-info text-dark" : "bg-primary"}`}>
                        {s.screeningType === "CATCH_UP" ? "Catch-Up" : "Newborn"}
                      </span></td>
                      <td>{s.screeningResult}</td>
                      <td>{new Date(s.screeningDatetime).toLocaleDateString("en-GB")}</td>
                      <td><span className={`badge ${statusClass[s.reviewStatus]??'bg-secondary'}`}>{s.reviewStatus}</span></td>
                      <td><Link href={`/screenings/${s.id}`} className="btn btn-sm btn-outline-primary py-0 px-2">View</Link></td>
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
