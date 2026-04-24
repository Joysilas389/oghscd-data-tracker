import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Sidebar from "@/components/Sidebar";
import BinActions from "@/components/BinActions";

export default async function BinPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (session.role === "SCREENER") redirect("/dashboard");

  const deletedScreenings = await prisma.screening.findMany({
    where: { archivedAt: { not: null } },
    orderBy: { archivedAt: "desc" },
    include: {
      patient: {
        select: {
          firstName: true,
          lastName: true,
          patientCode: true,
          sex: true,
        },
      },
      enteredBy: { select: { fullName: true } },
    },
  });

  // Also find archived patients with no screenings at all
  const deletedPatientsOnly = await prisma.patient.findMany({
    where: {
      archivedAt: { not: null },
      screenings: { none: {} },
    },
    orderBy: { archivedAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      patientCode: true,
      sex: true,
      archivedAt: true,
    },
  });

  const items = [
    ...deletedScreenings.map(s => ({
      id: s.id,
      patientId: s.patientId,
      patientName: `${s.patient.firstName} ${s.patient.lastName}`,
      patientCode: s.patient.patientCode,
      sex: s.patient.sex,
      result: s.screeningResult,
      screeningType: s.screeningType,
      screeningDatetime: s.screeningDatetime.toISOString(),
      deletedAt: s.archivedAt!.toISOString(),
      enteredBy: s.enteredBy.fullName,
    })),
    ...deletedPatientsOnly.map(p => ({
      id: p.id, // use patient id as the item id
      patientId: p.id,
      patientName: `${p.firstName} ${p.lastName}`,
      patientCode: p.patientCode,
      sex: p.sex,
      result: "—",
      screeningType: "—",
      screeningDatetime: p.archivedAt!.toISOString(),
      deletedAt: p.archivedAt!.toISOString(),
      enteredBy: "—",
    })),
  ].sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName}
        facilityName={session.facilityName} active="/bin" />
      <div className="flex-grow-1 p-3 p-md-4 pb-5 mb-5 pb-md-4 mb-md-0"
        style={{ background: "#f8f9fa", minWidth: 0 }}>

        {/* Header */}
        <div className="mb-3 mt-5 mt-md-0 pt-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h1 className="h4 fw-bold mb-0">🗑️ Recycle Bin</h1>
            <p className="text-muted small mb-0">
              {items.length} deleted record{items.length !== 1 ? "s" : ""} —
              restore or permanently delete
            </p>
          </div>
        </div>

        <BinActions items={items} />
      </div>
    </div>
  );
}
