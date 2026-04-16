import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Sidebar from "@/components/Sidebar";
import MapView from "@/components/MapView";

const LOCALITY_CENTROIDS: Record<string, [number, number]> = {
  "Oda": [5.9264, -0.9875],
  "Akim Oda": [5.9264, -0.9875],
  "Ayirebi": [5.9833, -1.0167],
  "Akwatia": [5.9833, -0.8167],
  "Abirem": [6.1667, -0.8833],
  "Akim Swedru": [5.8833, -0.9667],
  "Akim Asafo": [5.9167, -1.0333],
  "Kukurantumi": [6.0167, -1.0167],
  "Koforidua": [6.0833, -0.2500],
  "Kade": [6.0833, -0.8333],
  "Adeiso": [5.9333, -0.4000],
  "Suhum": [6.0333, -0.4500],
  "Nsawam": [5.8000, -0.3500],
  "Nkawkaw": [6.5500, -0.7667],
};

export default async function MapPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const patients = await prisma.patient.findMany({
    where: { archivedAt: null },
    select: {
      id: true,
      locality: true,
      district: true,
      latitude: true,
      longitude: true,
      sex: true,
      _count: { select: { screenings: true } },
    },
  });

  // Group by locality and get centroid coordinates
  const localityMap: Record<string, {
    count: number;
    lat: number;
    lng: number;
    male: number;
    female: number;
  }> = {};

  patients.forEach(p => {
    const loc = p.locality || "Unknown";
    const centroid = LOCALITY_CENTROIDS[loc] || [5.9264, -0.9875];
    const lat = p.latitude ?? centroid[0];
    const lng = p.longitude ?? centroid[1];

    if (!localityMap[loc]) {
      localityMap[loc] = { count: 0, lat, lng, male: 0, female: 0 };
    }
    localityMap[loc].count++;
    if (p.sex === "MALE") localityMap[loc].male++;
    else localityMap[loc].female++;
  });

  const markers = Object.entries(localityMap).map(([locality, data]) => ({
    locality,
    lat: data.lat,
    lng: data.lng,
    count: data.count,
    male: data.male,
    female: data.female,
  }));

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      <Sidebar role={session.role} fullName={session.fullName}
        facilityName={session.facilityName} active="/map" />
      <div className="flex-grow-1 p-3 p-md-4 pb-5 pb-md-4"
        style={{ background: "#f8f9fa", minWidth: 0 }}>
        <div className="mb-4 mt-5 mt-md-0">
          <h1 className="h4 fw-bold mb-0">Patient Geographic Distribution</h1>
          <p className="text-muted small">
            Showing {patients.length} patients across {markers.length} localities.
            Plotted at locality centroid level — no exact addresses shown.
          </p>
        </div>

        {/* Summary cards */}
        <div className="row g-3 mb-4">
          {markers.sort((a, b) => b.count - a.count).slice(0, 4).map(m => (
            <div key={m.locality} className="col-6 col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3" style={{ borderLeft: "4px solid #1a5276" }}>
                  <div className="text-muted small">{m.locality}</div>
                  <div className="h4 fw-bold mb-0" style={{ color: "#1a5276" }}>{m.count}</div>
                  <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                    {m.male}M · {m.female}F
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white small fw-semibold py-2">
            📍 Map — Birim Central Municipal & Surroundings
          </div>
          <div className="card-body p-0">
            {markers.length === 0 ? (
              <div className="text-center text-muted py-5">
                <div className="fs-1 mb-2">🗺️</div>
                <p>No patient location data yet.</p>
                <p className="small">Add screenings with locality data to see the map.</p>
              </div>
            ) : (
              <MapView markers={markers} />
            )}
          </div>
        </div>

        <div className="alert alert-info small mt-3">
          🔒 <strong>Privacy note:</strong> Patients are plotted at locality/community centroid
          level only. Exact home addresses are never shown on the map.
        </div>
      </div>
    </div>
  );
}
