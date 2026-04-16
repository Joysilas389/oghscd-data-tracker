"use client";
import { useState } from "react";

interface Props {
  userId: string;
  userName: string;
}

export default function ResetPasswordButton({ userId, userName }: Props) {
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleReset() {
    if (password.length < 8) { setError("Min 8 characters"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, newPassword: password }),
    });
    setLoading(false);
    if (res.ok) { setSuccess(true); setShow(false); setPassword(""); }
    else { setError("Failed to reset"); }
  }

  if (success) return <span className="text-success small">✅ Reset done</span>;

  return (
    <>
      <button onClick={() => setShow(true)}
        className="btn btn-sm btn-outline-warning py-0 px-2"
        style={{ fontSize: "0.75rem" }}>
        🔑 Reset
      </button>

      {show && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}>
          <div className="card border-0 shadow-lg" style={{ width: 320 }}>
            <div className="card-body p-4">
              <h6 className="fw-semibold mb-1">Reset Password</h6>
              <p className="text-muted small mb-3">
                Set a new temporary password for <strong>{userName}</strong>.
                Ask them to change it after login.
              </p>
              {error && <div className="alert alert-danger py-1 small mb-2">{error}</div>}
              <input type="password" className="form-control form-control-sm mb-3"
                placeholder="New password (min 8 chars)"
                value={password} onChange={e => setPassword(e.target.value)} />
              <div className="d-flex gap-2">
                <button onClick={handleReset} disabled={loading}
                  className="btn btn-sm btn-warning flex-grow-1">
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
                <button onClick={() => { setShow(false); setPassword(""); setError(""); }}
                  className="btn btn-sm btn-outline-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
