"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  "Inconclusive"
];

interface DuplicatePatient {
  id: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: string;
  screenings: {
    id: string;
    screeningDatetime: string;
    screeningType: string;
    screeningResult: string;
    treatmentStarted: boolean;
    reviewStatus: string;
  }[];
}

export default function NewScreeningPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [duplicate, setDuplicate] = useState<DuplicatePatient | null>(null);
  const [duplicateConfidence, setDuplicateConfidence] = useState(0);
  const [duplicateReason, setDuplicateReason] = useState("");
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [existingPatientId, setExistingPatientId] = useState<string | null>(null);
  const [newPatientReason, setNewPatientReason] = useState("");
  const [newPatientReasonError, setNewPatientReasonError] = useState("");
  const [isMultipleBirth, setIsMultipleBirth] = useState(false);
  const [multipleBirthType, setMultipleBirthType] = useState("Twin");
  const [birthOrder, setBirthOrder] = useState<number | null>(null);
  const [siblingSearch, setSiblingSearch] = useState("");
  const [siblingResults, setSiblingResults] = useState<{id:string;patientCode:string;firstName:string;lastName:string;dateOfBirth:string;sex:string}[]>([]);
  const [selectedSiblings, setSelectedSiblings] = useState<{id:string;patientCode:string;firstName:string;lastName:string}[]>([]);
  const [searchingSibling, setSearchingSibling] = useState(false);

  const [patient, setPatient] = useState({
    firstName: "", lastName: "", sex: "MALE", phoneNumber: "",
    dateOfBirth: "", ethnicity: "", nhisStatus: "NONE",
    address: "", district: "Birim Central Municipal", locality: "Akim-Oda",
  });

  const [screening, setScreening] = useState({
    screeningDatetime: new Date().toISOString().slice(0, 16),
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
    facilityName: "Oda Government Hospital",
  });

  const sp = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setPatient(p => ({ ...p, [f]: e.target.value }));
  const ss = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setScreening(p => ({ ...p, [f]: e.target.value }));

  async function searchSibling(q: string) {
    setSiblingSearch(q);
    if (q.length < 2) { setSiblingResults([]); return; }
    setSearchingSibling(true);
    try {
      const res = await fetch(`/api/patients/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      // Exclude already selected siblings
      const filtered = (data.patients || []).filter(
        (p: any) => !selectedSiblings.find(s => s.id === p.id)
      );
      setSiblingResults(filtered);
    } catch {}
    setSearchingSibling(false);
  }

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    if (patient.firstName && patient.lastName && patient.dateOfBirth) {
      const res = await fetch("/api/patients/check-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: patient.firstName,
          lastName: patient.lastName,
          dateOfBirth: patient.dateOfBirth,
          phoneNumber: patient.phoneNumber,
        }),
      });
      const data = await res.json();
      if (data.duplicate) {
        setDuplicate(data.patient);
        setDuplicateConfidence(data.confidence || 100);
        setDuplicateReason(data.reason || "Similar patient details detected");
        setShowDuplicateModal(true);
        return;
      }
    }
    setStep(2);
  }

  function handleUseExisting() {
    if (duplicate) {
      setExistingPatientId(duplicate.id);
      setShowDuplicateModal(false);
      setStep(2);
    }
  }

  function handleNewPatient() {
    if (!newPatientReason.trim()) {
      setNewPatientReasonError("Please provide a reason why this is a different patient.");
      return;
    }
    setNewPatientReasonError("");
    setShowDuplicateModal(false);
    setExistingPatientId(null);
    setNewPatientReason("");
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/screenings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient: existingPatientId ? null : {
            ...patient,
            isMultipleBirth,
            multipleBirthType: isMultipleBirth ? multipleBirthType : null,
            birthOrder: isMultipleBirth ? birthOrder : null,
            siblingIds: selectedSiblings.map(s => s.id),
          },
          existingPatientId,
          screening,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save"); }
      else { router.push(`/screenings/${data.screeningId}`); }
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <div className="container py-4" style={{ maxWidth: 700 }}>
        <div className="mb-4">
          <Link href="/dashboard" className="text-muted small text-decoration-none">
            ← Dashboard
          </Link>
          <h1 className="h4 fw-bold mb-0 mt-1">New Screening</h1>
          <p className="text-muted small">
            Step {step} of 2 — {step === 1 ? "Patient Details" : "Screening Data"}
          </p>
          <div className="progress" style={{ height: 4 }}>
            <div className="progress-bar"
              style={{ width: `${step * 50}%`, background: "#1a5276" }} />
          </div>
        </div>

        {error && <div className="alert alert-danger small">{error}</div>}

        {/* Duplicate Detection Modal */}
        {showDuplicateModal && duplicate && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ background: "rgba(0,0,0,0.6)", zIndex: 9999, padding: "1rem" }}>
            <div className="card border-0 shadow-lg overflow-auto"
              style={{ maxWidth: 500, width: "100%", maxHeight: "90vh" }}>

              {/* Header — colour coded by confidence */}
              <div className="fw-semibold text-dark px-4 py-3 d-flex align-items-center justify-content-between"
                style={{
                  background: duplicateConfidence >= 90 ? "#f8d7da" :
                              duplicateConfidence >= 70 ? "#ffc107" : "#fff3cd",
                }}>
                <span>
                  {duplicateConfidence >= 90 ? "🚨" :
                   duplicateConfidence >= 70 ? "⚠️" : "ℹ️"} Possible Existing Patient
                </span>
                {/* Confidence badge */}
                <span className="badge rounded-pill"
                  style={{
                    background: duplicateConfidence >= 90 ? "#dc3545" :
                                duplicateConfidence >= 70 ? "#856404" : "#664d03",
                    color: "#fff", fontSize: "0.75rem",
                  }}>
                  {duplicateConfidence}% match
                </span>
              </div>

              <div className="card-body p-4">
                {/* Reason */}
                <div className="alert small mb-3 py-2"
                  style={{
                    background: duplicateConfidence >= 90 ? "#f8d7da" :
                                duplicateConfidence >= 70 ? "#fff3cd" : "#d1ecf1",
                    border: "none",
                    color: duplicateConfidence >= 90 ? "#842029" :
                           duplicateConfidence >= 70 ? "#664d03" : "#0c5460",
                  }}>
                  <strong>Why flagged:</strong> {duplicateReason}
                </div>

                {/* Confidence bar */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>Similarity confidence</span>
                    <span>{duplicateConfidence}%</span>
                  </div>
                  <div style={{ height: 6, background: "#e9ecef", borderRadius: 4 }}>
                    <div style={{
                      height: "100%", borderRadius: 4,
                      width: `${duplicateConfidence}%`,
                      background: duplicateConfidence >= 90 ? "#dc3545" :
                                  duplicateConfidence >= 70 ? "#ffc107" : "#0dcaf0",
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                </div>

                {/* Existing patient details */}
                <div className="mb-3 p-3 rounded small"
                  style={{ background: "#f8f9fa", border: "1px solid #dee2e6" }}>
                  <div className="fw-semibold mb-2" style={{ color: "#1a5276" }}>
                    Existing Record Found:
                  </div>
                  <div><strong>Patient ID:</strong> {duplicate.patientCode}</div>
                  <div><strong>Name:</strong> {duplicate.firstName} {duplicate.lastName}</div>
                  <div><strong>Sex:</strong> {duplicate.sex}</div>
                  <div><strong>DOB:</strong> {new Date(duplicate.dateOfBirth).toLocaleDateString("en-GB")}</div>
                </div>

                {/* Previous screenings */}
                {duplicate.screenings.length > 0 && (
                  <div className="mb-3">
                    <div className="small fw-semibold mb-2">
                      Previous Visit(s) — {duplicate.screenings.length} screening(s):
                    </div>
                    {duplicate.screenings.map(s => (
                      <div key={s.id} className="p-2 border rounded small mb-1 bg-white">
                        <div className="d-flex justify-content-between flex-wrap gap-1">
                          <span className="text-muted">
                            {new Date(s.screeningDatetime).toLocaleDateString("en-GB")}
                          </span>
                          <span className={`badge ${s.screeningType === "NEWBORN" ? "bg-info text-dark" : "bg-primary"}`}>
                            {s.screeningType === "CATCH_UP" ? "Catch-Up" : "Newborn"}
                          </span>
                        </div>
                        <div className="mt-1">
                          <strong>Result:</strong> {s.screeningResult}
                        </div>
                        <div>
                          {s.treatmentStarted ? "✅ Treatment started" : "❌ No treatment"}{" · "}
                          <span className="text-muted">{s.reviewStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Primary action */}
                <button onClick={handleUseExisting}
                  className="btn text-white fw-semibold w-100 mb-3"
                  style={{ background: "#1a5276" }}>
                  ✅ Same patient — add new screening visit
                </button>

                {/* Register as new — requires reason */}
                <div className="border rounded p-3"
                  style={{ background: "#fff8f0" }}>
                  <div className="small fw-semibold mb-2 text-danger">
                    ➕ Register as a different patient
                  </div>
                  <div className="small text-muted mb-2">
                    If this is genuinely a different person, you must provide a reason.
                    This will be logged in the audit trail.
                  </div>
                  <textarea
                    className="form-control form-control-sm mb-2"
                    rows={2}
                    placeholder="e.g. Different patient with same name, confirmed by guardian ID..."
                    value={newPatientReason}
                    onChange={e => {
                      setNewPatientReason(e.target.value);
                      setNewPatientReasonError("");
                    }}
                  />
                  {newPatientReasonError && (
                    <div className="text-danger small mb-2">{newPatientReasonError}</div>
                  )}
                  <button onClick={handleNewPatient}
                    className="btn btn-sm btn-outline-danger w-100">
                    Confirm — Register as New Patient
                  </button>
                </div>

                <button onClick={() => { setShowDuplicateModal(false); setNewPatientReason(""); setNewPatientReasonError(""); }}
                  className="btn btn-link text-muted small py-1 w-100 mt-2">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            {step === 1 && (
              <form onSubmit={handleStep1}>
                <h5 className="fw-semibold mb-3">Patient / Demographics</h5>
                {existingPatientId && (
                  <div className="alert alert-success small mb-3">
                    ✅ Adding new screening visit to existing patient record.
                  </div>
                )}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">First Name *</label>
                    <input className="form-control" value={patient.firstName}
                      onChange={sp("firstName")} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Last Name *</label>
                    <input className="form-control" value={patient.lastName}
                      onChange={sp("lastName")} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Sex *</label>
                    <select className="form-select" value={patient.sex} onChange={sp("sex")}>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Date of Birth *</label>
                    <input type="date" className="form-control"
                      value={patient.dateOfBirth}
                      onChange={sp("dateOfBirth")} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Phone Number</label>
                    <input type="tel" className="form-control"
                      value={patient.phoneNumber} onChange={sp("phoneNumber")} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Ethnicity</label>
                    <input className="form-control" value={patient.ethnicity}
                      onChange={sp("ethnicity")} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">NHIS Status</label>
                    <select className="form-select" value={patient.nhisStatus}
                      onChange={sp("nhisStatus")}>
                      <option value="NONE">None</option>
                      <option value="ACTIVE">Active</option>
                      <option value="EXPIRED">Expired</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Locality</label>
                    <select className="form-select" value={patient.locality}
                      onChange={sp("locality")}>
                      {LOCALITIES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Address</label>
                    <input className="form-control" value={patient.address}
                      onChange={sp("address")} />
                  </div>
                </div>
                <div className="d-flex justify-content-end mt-4">
                  <button type="submit" className="btn text-white"
                    style={{ background: "#1a5276" }}>
                    Next: Screening Data →
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit}>
                <h5 className="fw-semibold mb-3">Screening / Lab Data</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Date & Time *</label>
                    <input type="datetime-local" className="form-control"
                      value={screening.screeningDatetime}
                      onChange={ss("screeningDatetime")} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Screening Type *</label>
                    <select className="form-select" value={screening.screeningType}
                      onChange={ss("screeningType")}>
                      <option value="CATCH_UP">Catch-Up</option>
                      <option value="NEWBORN">Newborn</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">
                      Screening Result (Hemotype SC) *
                    </label>
                    <select className="form-select" value={screening.screeningResult}
                      onChange={ss("screeningResult")} required>
                      <option value="">Select result...</option>
                      {RESULTS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Confirmatory Action</label>
                    <select className="form-select" value={screening.confirmatoryAction}
                      onChange={ss("confirmatoryAction")}>
                      <option value="NONE">None (Hemotype SC only available onsite)</option>
                      <option value="DONE">Confirmatory done</option>
                      <option value="REFERRED">Referred for confirmatory testing</option>
                    </select>
                    <div className="form-text small text-muted">
                      Note: Only Hemotype SC / Hemotype C available at OGH.
                      Other confirmatory tests require referral.
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Confirmed Result</label>
                    <input className="form-control" value={screening.confirmedResult}
                      onChange={ss("confirmedResult")}
                      placeholder="If confirmatory test was done" />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Remarks</label>
                    <textarea className="form-control" rows={2}
                      value={screening.remarks} onChange={ss("remarks")} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Facility</label>
                    <input className="form-control" value={screening.facilityName}
                      onChange={ss("facilityName")} />
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="treatment"
                        checked={screening.treatmentStarted}
                        onChange={e => setScreening(p => ({
                          ...p, treatmentStarted: e.target.checked
                        }))} />
                      <label className="form-check-label fw-semibold" htmlFor="treatment">
                        Treatment Started
                      </label>
                    </div>
                  </div>
                  {screening.treatmentStarted && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">
                          Treatment Start Date
                        </label>
                        <input type="date" className="form-control"
                          value={screening.treatmentStartDate}
                          onChange={ss("treatmentStartDate")} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">
                          Medication / Plan
                        </label>
                        <input className="form-control" value={screening.medicationPlan}
                          onChange={ss("medicationPlan")} />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Treatment Notes</label>
                        <textarea className="form-control" rows={2}
                          value={screening.treatmentNotes}
                          onChange={ss("treatmentNotes")} />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Referral Notes</label>
                        <textarea className="form-control" rows={2}
                          value={screening.referralNotes}
                          onChange={ss("referralNotes")} />
                      </div>
                    </>
                  )}
                </div>
                <div className="d-flex justify-content-between mt-4">
                  <button type="button" className="btn btn-outline-secondary"
                    onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn text-white"
                    style={{ background: "#1a5276" }} disabled={loading}>
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                      : "💾 Save Screening"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
