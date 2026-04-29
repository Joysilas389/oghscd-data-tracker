"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

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
                <input className="form-control" value={patient.locality}
                  onChange={setP("locality")} />
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
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Confirmatory Action</label>
                <select className="form-select" value={screening.confirmatoryAction}
                  onChange={setS("confirmatoryAction")}>
                  <option value="NONE">None</option>
                  <option value="DONE">Confirmatory Done</option>
                  <option value="REFERRED">Referred for Confirmatory</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Confirmed Result</label>
                <input className="form-control" value={screening.confirmedResult}
                  onChange={setS("confirmedResult")} />
              </div>
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
