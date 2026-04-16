"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); }
      else { router.push("/dashboard"); }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "#f0f4f8" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-9 col-md-6 col-lg-4">
            <div className="text-center mb-4">
              <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 64, height: 64, background: "#1a5276" }}>
                <span className="text-white fw-bold fs-5">SCD</span>
              </div>
              <h1 className="h4 fw-bold mb-1">OGH SCD E-Tracker</h1>
              <p className="text-muted small mb-0">
                Oda Government Hospital · Birim Central, Eastern Region
              </p>
            </div>

            {registered && (
              <div className="alert alert-success small mb-3">
                ✅ Account created! Please log in.
              </div>
            )}

            <div className="card shadow border-0">
              <div className="card-body p-4">
                <h2 className="h5 fw-semibold mb-3">Sign In</h2>
                {error && (
                  <div className="alert alert-danger py-2 small">{error}</div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Email Address</label>
                    <input type="email" className="form-control"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required placeholder="you@example.com" />
                  </div>
                  <div className="mb-1">
                    <label className="form-label small fw-semibold">Password</label>
                    <input type="password" className="form-control"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      required placeholder="••••••••" />
                  </div>
                  <div className="text-end mb-3">
                    <Link href="/forgot-password"
                      className="text-decoration-none small text-muted">
                      Forgot password?
                    </Link>
                  </div>
                  <button type="submit" className="btn w-100 text-white"
                    style={{ background: "#1a5276" }} disabled={loading}>
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</>
                      : "Sign In"}
                  </button>
                </form>
                <hr className="my-3" />
                <p className="text-center small text-muted mb-0">
                  No account?{" "}
                  <Link href="/register" className="text-decoration-none">
                    Register here
                  </Link>
                </p>
              </div>
            </div>
            <p className="text-center text-muted mt-3" style={{ fontSize: "0.7rem" }}>
              Secure health data · Authorised users only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
