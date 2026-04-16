"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LOCALITIES = ["Oda","Akim Oda","Ayirebi","Akwatia","Abirem","Akim Swedru","Akim Asafo","Kukurantumi","Koforidua","Other"];
const RESULTS = ["Normal (AA)","Sickle Cell Trait (AS)","Sickle Cell Disease (SS)","Sickle-C Disease (SC)","Other Haemoglobinopathy","Inconclusive"];

export default function NewScreeningPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [patient, setPatient] = useState({
    firstName:"",lastName:"",sex:"MALE",phoneNumber:"",dateOfBirth:"",
    ethnicity:"",nhisStatus:"NONE",address:"",district:"Birim Central Municipal",locality:"Oda",
  });
  const [screening, setScreening] = useState({
    screeningDatetime: new Date().toISOString().slice(0,16),
    screeningType:"CATCH_UP",screeningResult:"",confirmedTest:false,confirmedResult:"",
    confirmatoryAction:"NONE",remarks:"",treatmentStarted:false,
    treatmentStartDate:"",treatmentNotes:"",medicationPlan:"",referralNotes:"",
    facilityName:"Oda Government Hospital",
  });

  const sp = (f: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    setPatient(p => ({...p,[f]:e.target.value}));
  const ss = (f: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    setScreening(p => ({...p,[f]:e.target.value}));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/screenings", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({patient, screening}),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save"); }
      else { router.push(`/screenings/${data.screeningId}`); }
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }

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
        <div className="mb-4">
          <h1 className="h4 fw-bold mb-0">New Screening</h1>
          <p className="text-muted small">Step {step} of 2 — {step===1?"Patient Details":"Screening Data"}</p>
        </div>
        {error && <div className="alert alert-danger small">{error}</div>}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={step===1?(e)=>{e.preventDefault();setStep(2);}:handleSubmit}>
              {step === 1 && (
                <>
                  <h5 className="fw-semibold mb-3">Patient / Demographics</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">First Name *</label>
                      <input className="form-control" value={patient.firstName} onChange={sp("firstName")} required/>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Last Name *</label>
                      <input className="form-control" value={patient.lastName} onChange={sp("lastName")} required/>
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
                      <input type="date" className="form-control" value={patient.dateOfBirth} onChange={sp("dateOfBirth")} required/>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Phone Number</label>
                      <input type="tel" className="form-control" value={patient.phoneNumber} onChange={sp("phoneNumber")}/>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Ethnicity</label>
                      <input className="form-control" value={patient.ethnicity} onChange={sp("ethnicity")}/>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">NHIS Status</label>
                      <select className="form-select" value={patient.nhisStatus} onChange={sp("nhisStatus")}>
                        <option value="NONE">None</option>
                        <option value="ACTIVE">Active</option>
                        <option value="EXPIRED">Expired</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Locality</label>
                      <select className="form-select" value={patient.locality} onChange={sp("locality")}>
                        {LOCALITIES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Address</label>
                      <input className="form-control" value={patient.address} onChange={sp("address")}/>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end mt-4">
                    <button type="submit" className="btn text-white" style={{background:"#1a5276"}}>
                      Next: Screening Data →
                    </button>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <h5 className="fw-semibold mb-3">Screening / Lab Data</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Date & Time *</label>
                      <input type="datetime-local" className="form-control" value={screening.screeningDatetime}
                        onChange={ss("screeningDatetime")} required/>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Screening Type *</label>
                      <select className="form-select" value={screening.screeningType} onChange={ss("screeningType")}>
                        <option value="CATCH_UP">Catch-Up</option>
                        <option value="NEWBORN">Newborn</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Screening Result *</label>
                      <select className="form-select" value={screening.screeningResult} onChange={ss("screeningResult")} required>
                        <option value="">Select result...</option>
                        {RESULTS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Confirmatory Action</label>
                      <select className="form-select" value={screening.confirmatoryAction} onChange={ss("confirmatoryAction")}>
                        <option value="NONE">None (Hemotype SC only available)</option>
                        <option value="DONE">Confirmatory done</option>
                        <option value="REFERRED">Referred for confirmatory</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Confirmed Result</label>
                      <input className="form-control" value={screening.confirmedResult} onChange={ss("confirmedResult")}
                        placeholder="If confirmatory done"/>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Remarks</label>
                      <textarea className="form-control" rows={2} value={screening.remarks} onChange={ss("remarks")}/>
                    </div>
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="treatment"
                          checked={screening.treatmentStarted}
                          onChange={e => setScreening(p => ({...p, treatmentStarted: e.target.checked}))}/>
                        <label className="form-check-label fw-semibold" htmlFor="treatment">Treatment Started</label>
                      </div>
                    </div>
                    {screening.treatmentStarted && (
                      <>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Treatment Start Date</label>
                          <input type="date" className="form-control" value={screening.treatmentStartDate}
                            onChange={ss("treatmentStartDate")}/>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Medication / Plan</label>
                          <input className="form-control" value={screening.medicationPlan} onChange={ss("medicationPlan")}/>
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-semibold">Treatment Notes</label>
                          <textarea className="form-control" rows={2} value={screening.treatmentNotes} onChange={ss("treatmentNotes")}/>
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-semibold">Referral Notes</label>
                          <textarea className="form-control" rows={2} value={screening.referralNotes} onChange={ss("referralNotes")}/>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="d-flex justify-content-between mt-4">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(1)}>
                      ← Back
                    </button>
                    <button type="submit" className="btn text-white" style={{background:"#1a5276"}} disabled={loading}>
                      {loading ? <><span className="spinner-border spinner-border-sm me-2"/>Saving...</> : "Save Screening"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
