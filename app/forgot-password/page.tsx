"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate sending - in production connect to email service
    await new Promise(r => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "#f0f4f8" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-9 col-md-6 col-lg-4">
            <div className="text-center mb-4">
              <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 56, height: 56, background: "#1a5276" }}>
                <span className="text-white fw-bold">SCD</span>
              </div>
              <h1 className="h4 fw-bold mb-0">Reset Password</h1>
              <p className="text-muted small">OGH SCD E-Tracker</p>
            </div>

            <div className="card border-0 shadow">
              <div className="card-body p-4">
                {submitted ? (
                  <div className="text-center py-3">
                    <div className="fs-1 mb-3">📧</div>
                    <h5 className="fw-semibold">Request Received</h5>
                    <p className="text-muted small mb-3">
                      Please contact your system administrator at
                      <strong> Oda Government Hospital</strong> to reset your password.
                      They will verify your identity and update your access.
                    </p>
                    <div className="alert alert-info small text-start">
                      <strong>Your email:</strong> {email}<br/>
                      <strong>Action:</strong> Show this to your Admin or HIM to reset your password.
                    </div>
                    <Link href="/login" className="btn btn-sm text-white"
                      style={{ background: "#1a5276" }}>
                      Back to Login
                    </Link>
                  </div>
                ) : (
                  <>
                    <h5 className="fw-semibold mb-1">Forgot your password?</h5>
                    <p className="text-muted small mb-4">
                      Enter your email and we will show you the next steps.
                    </p>
                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label className="form-label small fw-semibold">Email Address</label>
                        <input type="email" className="form-control"
                          value={email} onChange={e => setEmail(e.target.value)}
                          required placeholder="you@example.com" />
                      </div>
                      <button type="submit" className="btn w-100 text-white"
                        style={{ background: "#1a5276" }} disabled={loading}>
                        {loading
                          ? <><span className="spinner-border spinner-border-sm me-2" />Please wait...</>
                          : "Continue"}
                      </button>
                    </form>
                    <hr className="my-3" />
                    <p className="text-center small text-muted mb-0">
                      <Link href="/login" className="text-decoration-none">← Back to Login</Link>
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="card mt-3 border-0 bg-light">
              <div className="card-body p-3 small text-muted">
                <strong>Need immediate access?</strong><br/>
                Contact your system administrator or Health Information Manager
                at Oda Government Hospital to reset your password directly.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
