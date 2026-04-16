import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function PatientsPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const patients = await prisma.patient.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { screenings: true } } },
  });

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
          <h1 className="h4 fw-bold mb-0">Patients</h1>
          <Link href="/screenings/new" className="btn btn-sm text-white" style={{background:"#1a5276"}}>+ New Screening</Link>
        </div>
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 small">
                <thead className="table-light">
                  <tr><th>Patient ID</th><th>Name</th><th>Sex</th><th>DOB</th><th>District</th><th>Screenings</th><th></th></tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-muted py-4">No patients yet.</td></tr>
                  ) : patients.map(p => (
                    <tr key={p.id}>
                      <td className="font-monospace small">{p.patientCode}</td>
                      <td>{p.firstName} {p.lastName}</td>
                      <td>{p.sex}</td>
                      <td>{new Date(p.dateOfBirth).toLocaleDateString("en-GB")}</td>
                      <td>{p.district ?? "—"}</td>
                      <td><span className="badge bg-secondary">{p._count.screenings}</span></td>
                      <td><Link href={`/patients/${p.id}`} className="btn btn-sm btn-outline-primary py-0 px-2">View</Link></td>
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
