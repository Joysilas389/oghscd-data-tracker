"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  screeningId: string;
  currentStatus: string;
}

export default function ReviewActions({ screeningId, currentStatus }: Props) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAction(action: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/review/${screeningId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded p-2 bg-light">
      <div className="mb-2">
        <label className="form-label small fw-semibold mb-1">Review Note (optional)</label>
        <textarea className="form-control form-control-sm" rows={2} value={note}
          onChange={e => setNote(e.target.value)} placeholder="Add a note..."/>
      </div>
      {error && <div className="alert alert-danger py-1 small mb-2">{error}</div>}
      <div className="d-flex gap-2 flex-wrap">
        <button onClick={() => handleAction("APPROVED")} disabled={loading}
          className="btn btn-sm btn-success">✅ Approve</button>
        <button onClick={() => handleAction("FLAGGED")} disabled={loading}
          className="btn btn-sm btn-danger">🚩 Flag</button>
        <button onClick={() => handleAction("CORRECTED")} disabled={loading}
          className="btn btn-sm btn-info">✏️ Mark Corrected</button>
      </div>
    </div>
  );
}
