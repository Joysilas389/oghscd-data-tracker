"use client";
import { useState } from "react";

export default function ChangePasswordForm() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(false);
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match"); return;
    }
    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters"); return;
    }
    if (form.newPassword === form.currentPassword) {
      setError("New password must be different from current password"); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to change password"); }
      else {
        setSuccess(true);
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
      {success && (
        <div className="alert alert-success py-2 small mb-3">
          ✅ Password changed successfully!
        </div>
      )}
      <div className="mb-3">
        <label className="form-label small fw-semibold">Current Password *</label>
        <input type="password" className="form-control"
          value={form.currentPassword} onChange={set("currentPassword")} required />
      </div>
      <div className="mb-3">
        <label className="form-label small fw-semibold">New Password * (min 8 chars)</label>
        <input type="password" className="form-control"
          value={form.newPassword} onChange={set("newPassword")}
          required minLength={8} />
      </div>
      <div className="mb-4">
        <label className="form-label small fw-semibold">Confirm New Password *</label>
        <input type="password" className="form-control"
          value={form.confirmPassword} onChange={set("confirmPassword")} required />
      </div>
      <button type="submit" className="btn w-100 text-white"
        style={{ background: "#1a5276" }} disabled={loading}>
        {loading
          ? <><span className="spinner-border spinner-border-sm me-2" />Changing...</>
          : "🔑 Change Password"}
      </button>
    </form>
  );
}
