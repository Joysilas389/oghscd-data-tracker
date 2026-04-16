"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const RESULTS = [
  "Normal (AA)", "Sickle Cell Trait (AS)", "Sickle Cell Disease (SS)",
  "Sickle-C Disease (SC)", "Other Haemoglobinopathy", "Inconclusive"
];

export default function EditScreeningPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
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
          setForm({
            screeningDatetime: s.screeningDatetime ? new Date(s.screeningDatetime).toISOString().slice(0, 16) : "",
            screeningType: s.screeningType ?? "CATCH_UP",
            screeningResult: s.screeningResult ?? "",
            confirmedTest: s.confirmedTest ?? false,
            confirmedResult: s.confirmedResult ?? "",
            confirmatoryAction: s.confirmatoryAction ?? "NONE",
            remarks: s.remarks ?? "",
            treatmentStarted: s.treatmentStarted ?? false,
            treatmentStartDate: s.treatmentStartDate ? new Date(s.treatmentStartDate).toISOString().slice(0, 10) : "",
            treatmentNotes: s.treatmentNotes ?? "",
            medicationPlan: s.medicationPlan ?? "",
            referralNotes: s.referralNotes ?? "",
            facilityName: s.facilityName ?? "",
          });
        }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, [id]);

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/screenings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save"); }
      else { router.push(`/screenings/${id}`); }
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  }

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="spinner-border" style={{ color: "#1a5276" }} />
    </div>
  );

  return (
    <div className="container py-4" style={{ maxWidth: 700 }}>
      <div className="mb-4">
        <Link href={`/screenings/${id}`} className="text-muted small text-decoration-none">← Back to Detail</Link>
        <h1 className="h4 fw-bold mb-0 mt-1">Edit Screening</h1>
      </div>
      {error && <div className="alert alert-danger small">{error}</div>}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Date & Time *</label>
                <input type="datetime-local" className="form-control" value={form.screeningDatetime}
                  onChange={set("screeningDatetime")} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Screening Type *</label>
                <select className="form-select" value={form.screeningType} onChange={set("screeningType")}>
                  <option value="CATCH_UP">Catch-Up</option>
                  <option value="NEWBORN">Newborn</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Screening Result *</label>
                <select className="form-select" value={form.screeningResult} onChange={set("screeningResult")} required>
                  <option value="">Select result...</option>
                  {RESULTS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Confirmatory Action</label>
                <select className="form-select" value={form.confirmatoryAction} onChange={set("confirmatoryAction")}>
                  <option value="NONE">None</option>
                  <option value="DONE">Confirmatory Done</option>
                  <option value="REFERRED">Referred for Confirmatory</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Confirmed Result</label>
                <input className="form-control" value={form.confirmedResult} onChange={set("confirmedResult")} />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Remarks</label>
                <textarea className="form-control" rows={2} value={form.remarks} onChange={set("remarks")} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Facility</label>
                <input className="form-control" value={form.facilityName} onChange={set("facilityName")} />
              </div>
              <div className="col-12">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="treatment"
                    checked={form.treatmentStarted}
                    onChange={e => setForm(p => ({ ...p, treatmentStarted: e.target.checked }))} />
                  <label className="form-check-label fw-semibold" htmlFor="treatment">Treatment Started</label>
                </div>
              </div>
              {form.treatmentStarted && (
                <>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Treatment Start Date</label>
                    <input type="date" className="form-control" value={form.treatmentStartDate}
                      onChange={set("treatmentStartDate")} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Medication / Plan</label>
                    <input className="form-control" value={form.medicationPlan} onChange={set("medicationPlan")} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Treatment Notes</label>
                    <textarea className="form-control" rows={2} value={form.treatmentNotes}
                      onChange={set("treatmentNotes")} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Referral Notes</label>
                    <textarea className="form-control" rows={2} value={form.referralNotes}
                      onChange={set("referralNotes")} />
                  </div>
                </>
              )}
            </div>
            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn text-white" style={{ background: "#1a5276" }} disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : "💾 Update Screening"}
              </button>
              <Link href={`/screenings/${id}`} className="btn btn-outline-secondary">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
