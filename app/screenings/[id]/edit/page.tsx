"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const LOCALITIES = [
  "Akim-Oda","Ayirebi","Akwatia","Abirem",
  "Akim Swedru","Akim Asafo","Kukurantumi","Koforidua","Kade","Other"
];

const RESULTS = [
  "Normal (AA)",
  "Sickle Cell Trait (AS)",
  "Haemoglobin S",
  "Sickle-C Disease (SC)",
  "Haemoglobin C Trait (AC)",
  "Haemoglobin C",
  "Other Haemoglobinopathy",
  "Inconclusive",
];

export default function EditScreeningPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [patientId, setPatientId] = useState("");
  const [role, setRole] = useState("");

  const [patient, setPatient] = useState({
    firstName: "",
    lastName: "",
    sex: "MALE",
    dateOfBirth: "",
    phoneNumber: "",
    ethnicity: "",
    nhisStatus: "NONE",
    address: "",
    district: "",
    locality: "",
    isMultipleBirth: false,
    multipleBirthType: null as string | null,
    birthOrder: null as number | null,
  });

  const [screening, setScreening] = useState({
    screeningDatetime: "",
    screeningType: "CATCH_UP",
    screeningResult: "",
    confirmedTest: false,
    confirmedResult: "",
    confirmatoryAction: "NONE",
    remarks: "",
    treatmentStarted: false,
    treatmentStartDate: "",
    treatmentNotes: "",
    medicationPlan: "",
    referralNotes: "",
    facilityName: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => { if (data.user) setRole(data.user.role); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/screenings/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.screening) {
          const s = data.screening;
          const p = s.patient;
          setPatientId(p.id);
          setPatient({
            firstName: p.firstName ?? "",
            lastName: p.lastName ?? "",
            sex: p.sex ?? "MALE",
            dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().slice(0, 10) : "",
            phoneNumber: p.phoneNumber ?? "",
            ethnicity: p.ethnicity ?? "",
            nhisStatus: p.nhisStatus ?? "NONE",
            address: p.address ?? "",
            district: p.district ?? "",
            locality: p.locality ?? "",
            isMultipleBirth: p.isMultipleBirth ?? false,
            multipleBirthType: p.multipleBirthType ?? null,
            birthOrder: p.birthOrder ?? null,
          });
          setScreening({
            screeningDatetime: s.screeningDatetime
              ? new Date(s.screeningDatetime).toISOString().slice(0, 16) : "",
            screeningType: s.screeningType ?? "CATCH_UP",
            screeningResult: s.screeningResult ?? "",
            confirmedTest: s.confirmedTest ?? false,
            confirmedResult: s.confirmedResult ?? "",
            confirmatoryAction: s.confirmatoryAction ?? "NONE",
            remarks: s.remarks ?? "",
            treatmentStarted: s.treatmentStarted ?? false,
            treatmentStartDate: s.treatmentStartDate
              ? new Date(s.treatmentStartDate).toISOString().slice(0, 10) : "",
            treatmentNotes: s.treatmentNotes ?? "",
            medicationPlan: s.medicationPlan ?? "",
            referralNotes: s.referralNotes ?? "",
            facilityName: s.facilityName ?? "",
          });
        }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load record"); setLoading(false); });
  }, [id]);

  const setP = (f: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setPatient(p => ({ ...p, [f]: e.target.value }));

  const setS = (f: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setScreening(p => ({ ...p, [f]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    // Validate confirmatory result when DONE is selected
    const needsConfirmation = ["Haemoglobin S", "Haemoglobin C", "Sickle-C Disease (SC)"];
    if (needsConfirmation.includes(screening.screeningResult) &&
        screening.confirmatoryAction === "DONE" &&
        !screening.confirmedResult.trim()) {
      setError("Please enter the confirmed result — it is required when confirmatory action is Done.");
      setSaving(false);
      return;
    }

    try {
      // 1. Update patient biodata
      const patientRes = await fetch(`/api/patients/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patient),
      });
      const patientData = await patientRes.json();
      if (!patientRes.ok) {
        setError(patientData.error || "Failed to update patient biodata");
        setSaving(false);
        return;
      }

      // 2. Update screening data
      const screeningRes = await fetch(`/api/screenings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(screening),
      });
      const screeningData = await screeningRes.json();
      if (!screeningRes.ok) {
        setError(screeningData.error || "Failed to update screening data");
        setSaving(false);
        return;
      }

      router.push(`/screenings/${id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="spinner-border" style={{ color: "#1a5276" }} />
    </div>
  );

  return (
    <div className="container py-4 pb-5 mb-5" style={{ maxWidth: 750 }}>
      <div className="mb-4">
        <Link href={`/screenings/${id}`} className="text-muted small text-decoration-none">← Back</Link>
        <h1 className="h4 fw-bold mb-0 mt-1">Edit Record</h1>
        <p className="text-muted small mb-0">Update patient biodata and/or screening information</p>
      </div>

      {error && <div className="alert alert-danger small">{error}</div>}
      {success && <div className="alert alert-success small">{success}</div>}

      <form onSubmit={handleSubmit}>

        {/* ── Section 1: Patient Biodata ── */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header fw-semibold py-2"
            style={{ background: "#1a5276", color: "#fff", fontSize: "0.9rem" }}>
            👤 Patient Biodata
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">First Name *</label>
                <input className="form-control" value={patient.firstName}
                  onChange={setP("firstName")} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Last Name *</label>
                <input className="form-control" value={patient.lastName}
                  onChange={setP("lastName")} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Sex *</label>
                <select className="form-select" value={patient.sex} onChange={setP("sex")}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Date of Birth *</label>
                <input type="date" className="form-control" value={patient.dateOfBirth}
                  onChange={setP("dateOfBirth")} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Phone Number *</label>
                <input className="form-control" value={patient.phoneNumber}
                  onChange={setP("phoneNumber")}
                  placeholder="e.g. 0244123456"
                  required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">NHIS Status</label>
                <select className="form-select" value={patient.nhisStatus}
                  onChange={setP("nhisStatus")}>
                  <option value="NONE">None</option>
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Ethnicity</label>
                <input className="form-control" value={patient.ethnicity}
                  onChange={setP("ethnicity")} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Locality</label>
                <select className="form-select"
                  value={LOCALITIES.slice(0,-1).includes(patient.locality) ? patient.locality : "Other"}
                  onChange={e => {
                    if (e.target.value === "Other") {
                      setPatient(p => ({ ...p, locality: "" }));
                    } else {
                      setPatient(p => ({ ...p, locality: e.target.value }));
                    }
                  }}>
                  {LOCALITIES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                {!LOCALITIES.slice(0,-1).includes(patient.locality) && (
                  <input
                    className="form-control mt-2"
                    placeholder="Type locality name e.g. Afosu, Ayirebi West..."
                    value={patient.locality}
                    onChange={e => setPatient(p => ({ ...p, locality: e.target.value }))}
                  />
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">District</label>
                <input className="form-control" value={patient.district}
                  onChange={setP("district")} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Address</label>
                <input className="form-control" value={patient.address}
                  onChange={setP("address")} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 1b: Multiple Birth (Manager/Admin only) ── */}
        {(role === "MANAGER" || role === "ADMIN") && (
          <div className="card border-0 shadow-sm mb-4"
            style={{ borderLeft: "4px solid #6f42c1" }}>
            <div className="card-header fw-semibold py-2"
              style={{ background: "#f0e6ff", fontSize: "0.9rem", color: "#6f42c1" }}>
              👥 Multiple Birth Status
              <span className="ms-2 badge" style={{ background: "#6f42c1", fontSize: "0.65rem" }}>
                Manager / Admin only
              </span>
            </div>
            <div className="card-body p-4">
              {/* Selection cards */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <div onClick={() => setPatient(p => ({
                      ...p, isMultipleBirth: false,
                      multipleBirthType: null, birthOrder: null
                    }))}
                    style={{
                      cursor: "pointer",
                      border: !patient.isMultipleBirth ? "3px solid #1a5276" : "2px solid #dee2e6",
                      borderRadius: 12, padding: "14px 12px", textAlign: "center",
                      background: !patient.isMultipleBirth ? "#d6eaf8" : "#fff",
                      transition: "all 0.2s",
                    }}>
                    <div style={{ fontSize: "1.8rem" }}>👤</div>
                    <div className="fw-bold mt-1" style={{
                      fontSize: "0.85rem",
                      color: !patient.isMultipleBirth ? "#1a5276" : "#555",
                    }}>Single Baby</div>
                    {!patient.isMultipleBirth && (
                      <div style={{ color: "#1a5276", fontSize: "0.7rem", fontWeight: 700 }}>✓ Selected</div>
                    )}
                  </div>
                </div>
                <div className="col-6">
                  <div onClick={() => setPatient(p => ({
                      ...p, isMultipleBirth: true,
                      multipleBirthType: p.multipleBirthType || "Twin",
                    }))}
                    style={{
                      cursor: "pointer",
                      border: patient.isMultipleBirth ? "3px solid #6f42c1" : "2px solid #dee2e6",
                      borderRadius: 12, padding: "14px 12px", textAlign: "center",
                      background: patient.isMultipleBirth ? "#f0e6ff" : "#fff",
                      transition: "all 0.2s",
                    }}>
                    <div style={{ fontSize: "1.8rem" }}>👥</div>
                    <div className="fw-bold mt-1" style={{
                      fontSize: "0.85rem",
                      color: patient.isMultipleBirth ? "#6f42c1" : "#555",
                    }}>Multiple Birth</div>
                    {patient.isMultipleBirth && (
                      <div style={{ color: "#6f42c1", fontSize: "0.7rem", fontWeight: 700 }}>✓ Selected</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Birth type and order — only when multiple birth selected */}
              {patient.isMultipleBirth && (
                <div className="row g-2">
                  <div className="col-7">
                    <label className="form-label small fw-semibold">Birth Type</label>
                    <select className="form-select form-select-sm"
                      value={patient.multipleBirthType || "Twin"}
                      onChange={e => setPatient(p => ({ ...p, multipleBirthType: e.target.value }))}>
                      <option value="Twin">Twin</option>
                      <option value="Triplet">Triplet</option>
                      <option value="Quadruplet">Quadruplet</option>
                      <option value="Quintuplet">Quintuplet</option>
                      <option value="Other Multiple Birth">Other Multiple Birth</option>
                    </select>
                  </div>
                  <div className="col-5">
                    <label className="form-label small fw-semibold">Birth Order</label>
                    <select className="form-select form-select-sm"
                      value={patient.birthOrder ?? ""}
                      onChange={e => setPatient(p => ({
                        ...p, birthOrder: e.target.value ? parseInt(e.target.value) : null
                      }))}>
                      <option value="">Select...</option>
                      <option value="1">1st</option>
                      <option value="2">2nd</option>
                      <option value="3">3rd</option>
                      <option value="4">4th</option>
                      <option value="5">5th</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <div className="small text-muted mt-1">
                      💡 Current: {patient.multipleBirthType || "Twin"} —{" "}
                      {patient.birthOrder ? `${patient.birthOrder === 1 ? "1st" : patient.birthOrder === 2 ? "2nd" : patient.birthOrder === 3 ? "3rd" : `${patient.birthOrder}th`}` : "No order set"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Section 2: Screening Data ── */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header fw-semibold py-2"
            style={{ background: "#117a8b", color: "#fff", fontSize: "0.9rem" }}>
            🔬 Screening Data
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Date & Time *</label>
                <input type="datetime-local" className="form-control"
                  value={screening.screeningDatetime}
                  onChange={setS("screeningDatetime")} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Screening Type *</label>
                <select className="form-select" value={screening.screeningType}
                  onChange={setS("screeningType")}>
                  <option value="CATCH_UP">Catch-Up</option>
                  <option value="NEWBORN">Newborn</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Screening Result *</label>
                <select className="form-select" value={screening.screeningResult}
                  onChange={setS("screeningResult")} required>
                  <option value="">Select result...</option>
                  {RESULTS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {["Haemoglobin S", "Haemoglobin C", "Sickle-C Disease (SC)"].includes(screening.screeningResult) ? (
                <>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Confirmatory Action *</label>
                    <select className="form-select" value={screening.confirmatoryAction}
                      onChange={setS("confirmatoryAction")}>
                      <option value="NONE">Select action...</option>
                      <option value="DONE">Confirmatory done — result ready</option>
                      <option value="REFERRED">Referred — result pending</option>
                      <option value="SCHEDULED">Scheduled at OGH — result pending</option>
                    </select>
                  </div>
                  {screening.confirmatoryAction === "DONE" && (
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">
                        Confirmed Result *
                      </label>
                      <input className="form-control" value={screening.confirmedResult}
                        onChange={setS("confirmedResult")}
                        placeholder="e.g. HbSS, HbSC, HbCC..." />
                    </div>
                  )}
                </>
              ) : (
                screening.screeningResult && (
                  <div className="col-12">
                    <div className="alert alert-success small py-2 mb-0">
                      ✅ No confirmatory testing needed for this result.
                    </div>
                  </div>
                )
              )}
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Facility</label>
                <input className="form-control" value={screening.facilityName}
                  onChange={setS("facilityName")} />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Remarks</label>
                <textarea className="form-control" rows={2} value={screening.remarks}
                  onChange={setS("remarks")} />
              </div>
              <div className="col-12">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="treatment"
                    checked={screening.treatmentStarted}
                    onChange={e => setScreening(p => ({ ...p, treatmentStarted: e.target.checked }))} />
                  <label className="form-check-label fw-semibold" htmlFor="treatment">
                    Treatment Started
                  </label>
                </div>
              </div>
              {screening.treatmentStarted && (
                <>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Treatment Start Date</label>
                    <input type="date" className="form-control" value={screening.treatmentStartDate}
                      onChange={setS("treatmentStartDate")} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Medication / Plan</label>
                    <input className="form-control" value={screening.medicationPlan}
                      onChange={setS("medicationPlan")} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Treatment Notes</label>
                    <textarea className="form-control" rows={2} value={screening.treatmentNotes}
                      onChange={setS("treatmentNotes")} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Referral Notes</label>
                    <textarea className="form-control" rows={2} value={screening.referralNotes}
                      onChange={setS("referralNotes")} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="d-flex gap-2">
          <button type="submit" className="btn text-white px-4"
            style={{ background: "#1a5276" }} disabled={saving}>
            {saving
              ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
              : "💾 Save All Changes"}
          </button>
          <Link href={`/screenings/${id}`} className="btn btn-outline-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
