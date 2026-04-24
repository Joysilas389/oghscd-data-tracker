"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForceChangePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Password strength
  function getStrength(p: string) {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }

  const strength = getStrength(newPassword);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#dc3545", "#ffc107", "#0d6efd", "#198754"][strength];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/force-change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to change password");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a5276 0%, #117a8b 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Header */}
        <div className="text-center text-white mb-4">
          <div style={{ fontSize: "3rem" }}>🔐</div>
          <h1 className="h4 fw-bold mb-1">Set Your New Password</h1>
          <p style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            Your password has been reset by an Administrator.
            Please set a new password to continue.
          </p>
        </div>

        <div className="card border-0 shadow-lg" style={{ borderRadius: 16 }}>
          <div className="card-body p-4">

            {/* Info banner */}
            <div className="alert alert-warning small py-2 mb-3">
              <strong>⚠️ Action Required</strong> — You cannot access the system
              until you set a new password.
            </div>

            {error && (
              <div className="alert alert-danger small py-2">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              {/* New password */}
              <div className="mb-3">
                <label className="form-label fw-semibold small">
                  New Password *
                </label>
                <div className="input-group">
                  <input
                    type={showNew ? "text" : "password"}
                    className="form-control"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                  <button type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowNew(p => !p)}>
                    {showNew ? "🙈" : "👁️"}
                  </button>
                </div>
                {/* Strength bar */}
                {newPassword.length > 0 && (
                  <div className="mt-2">
                    <div style={{ height: 4, background: "#e9ecef", borderRadius: 4 }}>
                      <div style={{
                        height: "100%", borderRadius: 4,
                        width: `${(strength / 4) * 100}%`,
                        background: strengthColor,
                        transition: "width 0.3s ease",
                      }} />
                    </div>
                    <div className="small mt-1" style={{ color: strengthColor }}>
                      {strengthLabel}
                    </div>
                  </div>
                )}
                <div className="form-text small text-muted">
                  Min 8 characters. Use uppercase, numbers and symbols for a stronger password.
                </div>
              </div>

              {/* Confirm password */}
              <div className="mb-4">
                <label className="form-label fw-semibold small">
                  Confirm New Password *
                </label>
                <div className="input-group">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="form-control"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirm(p => !p)}>
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
                {/* Match indicator */}
                {confirmPassword.length > 0 && (
                  <div className="small mt-1"
                    style={{ color: newPassword === confirmPassword ? "#198754" : "#dc3545" }}>
                    {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </div>
                )}
              </div>

              <button type="submit"
                className="btn w-100 text-white fw-semibold"
                style={{ background: "#1a5276", borderRadius: 8 }}
                disabled={loading || newPassword !== confirmPassword || newPassword.length < 8}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Setting password...</>
                  : "🔐 Set New Password & Continue"}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center text-white mt-3" style={{ fontSize: "0.75rem", opacity: 0.7 }}>
          OGH SCD E-Tracker · Oda Government Hospital
        </div>
      </div>
    </div>
  );
}
