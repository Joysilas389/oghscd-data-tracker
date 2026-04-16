import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

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
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName} facilityName={session.facilityName} active="/patients" />
      <div className="flex-grow-1 p-3 p-md-4" style={{ background: "#f8f9fa", minWidth: 0 }}>
        <div className="d-flex justify-content-between align-items-center mb-4 mt-5 mt-md-0">
          <div>
            <h1 className="h4 fw-bold mb-0">Patients</h1>
            <p className="text-muted small mb-0">{patients.length} registered patient(s)</p>
          </div>
          <Link href="/screenings/new" className="btn btn-sm text-white" style={{ background: "#1a5276" }}>
            + New Screening
          </Link>
        </div>
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 small">
                <thead className="table-light">
                  <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Sex</th>
                    <th>DOB</th>
                    <th>District</th>
                    <th>Visits</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        No patients yet. <Link href="/screenings/new">Add first screening →</Link>
                      </td>
                    </tr>
                  ) : patients.map(p => (
                    <tr key={p.id}>
                      <td className="font-monospace" style={{ fontSize: "0.75rem" }}>{p.patientCode}</td>
                      <td>{p.firstName} {p.lastName}</td>
                      <td>{p.sex}</td>
                      <td>{new Date(p.dateOfBirth).toLocaleDateString("en-GB")}</td>
                      <td>{p.district ?? "—"}</td>
                      <td><span className="badge bg-secondary">{p._count.screenings}</span></td>
                      <td>
                        <Link href={`/patients/${p.id}`} className="btn btn-sm btn-outline-primary py-0 px-2">
                          View
                        </Link>
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
