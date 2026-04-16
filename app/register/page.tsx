"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CADRES = ["Medical Officer","Physician Assistant","Registered Nurse","Midwife",
  "Community Health Nurse","Health Information Officer","Laboratory Scientist",
  "Laboratory Technician","Other"];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({fullName:"",cadre:"",facilityName:"",email:"",password:"",confirm:""});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) =>
    setForm(p => ({...p, [f]: e.target.value}));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({fullName:form.fullName,cadre:form.cadre,
          facilityName:form.facilityName,email:form.email,password:form.password}),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); }
      else { router.push("/login?registered=1"); }
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-4" style={{background:"#f0f4f8"}}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-7 col-lg-5">
            <div className="text-center mb-4">
              <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                style={{width:56,height:56,background:"#1a5276"}}>
                <span className="text-white fw-bold">SCD</span>
              </div>
              <h1 className="h4 fw-bold mb-0">Create Account</h1>
              <p className="text-muted small">OGH SCD E-Tracker · Screening Team</p>
            </div>
            <div className="card shadow border-0">
              <div className="card-body p-4">
                {error && <div className="alert alert-danger py-2 small">{error}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Full Name *</label>
                    <input className="form-control" value={form.fullName} onChange={set("fullName")} required minLength={2}/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Cadre / Designation *</label>
                    <select className="form-select" value={form.cadre} onChange={set("cadre")} required>
                      <option value="">Select cadre...</option>
                      {CADRES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Facility Name *</label>
                    <input className="form-control" value={form.facilityName} onChange={set("facilityName")}
                      required placeholder="e.g. Oda Government Hospital"/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Email Address *</label>
                    <input type="email" className="form-control" value={form.email} onChange={set("email")} required/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Password * (min 8 characters)</label>
                    <input type="password" className="form-control" value={form.password} onChange={set("password")} required minLength={8}/>
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-semibold">Confirm Password *</label>
                    <input type="password" className="form-control" value={form.confirm} onChange={set("confirm")} required/>
                  </div>
                  <button type="submit" className="btn w-100 text-white"
                    style={{background:"#1a5276"}} disabled={loading}>
                    {loading ? <><span className="spinner-border spinner-border-sm me-2"/>Creating account...</> : "Create Account"}
                  </button>
                </form>
                <hr className="my-3"/>
                <p className="text-center small text-muted mb-0">
                  Already registered? <Link href="/login" className="text-decoration-none">Sign in</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
