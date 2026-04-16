"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  userName: string;
  userRole: string;
}

export default function DeleteUserButton({ userId, userName, userRole }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to delete"); setLoading(false); }
      else { setShowModal(false); router.refresh(); }
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setShowModal(true)}
        className="btn btn-sm btn-outline-danger py-0 px-2"
        style={{ fontSize: "0.75rem" }}>
        🗑️ Delete
      </button>

      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.6)", zIndex: 9999, padding: "1rem" }}>
          <div className="card border-0 shadow-lg" style={{ maxWidth: 420, width: "100%" }}>
            <div className="card-header bg-danger text-white fw-semibold">
              ⚠️ Confirm Delete User
            </div>
            <div className="card-body p-4">
              <p className="mb-2">Are you sure you want to delete this user?</p>
              <div className="p-3 bg-light rounded mb-3 small">
                <div><strong>Name:</strong> {userName}</div>
                <div><strong>Role:</strong> {userRole}</div>
              </div>
              <div className="alert alert-warning small mb-3">
                ⚠️ This action is permanent. The user will be removed
                from the system and can re-register if needed.
                Their screening records will be preserved.
              </div>
              {error && <div className="alert alert-danger small mb-3">{error}</div>}
              <div className="d-flex gap-2">
                <button onClick={handleDelete} disabled={loading}
                  className="btn btn-danger flex-grow-1">
                  {loading
                    ? <><span className="spinner-border spinner-border-sm me-2" />Deleting...</>
                    : "Yes, Delete User"}
                </button>
                <button onClick={() => { setShowModal(false); setError(""); }}
                  className="btn btn-outline-secondary flex-grow-1">
                  No, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
