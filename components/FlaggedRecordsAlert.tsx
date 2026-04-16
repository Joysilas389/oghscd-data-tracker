"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FlaggedScreening {
  id: string;
  reviewNote: string | null;
  screeningDatetime: string;
  patient: {
    firstName: string;
    lastName: string;
    patientCode: string;
  };
}

interface Props {
  flagged: FlaggedScreening[];
}

export default function FlaggedRecordsAlert({ flagged }: Props) {
  const router = useRouter();
  const [resubmitting, setResubmitting] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (flagged.length === 0) return null;

  async function handleResubmit(screeningId: string) {
    setResubmitting(screeningId);
    setError("");
    try {
      const res = await fetch("/api/screenings/resubmit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screeningId }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to resubmit");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setResubmitting(null);
    }
  }

  return (
    <div className="mb-4">
      <div className="alert alert-danger mb-2 py-2 d-flex align-items-center gap-2">
        <span style={{ fontSize: "1.3rem" }}>🚩</span>
        <div>
          <strong>You have {flagged.length} flagged record{flagged.length > 1 ? "s" : ""}</strong>
          {" "}that need correction. Please review the reason, edit and resubmit.
        </div>
      </div>
      {error && <div className="alert alert-warning py-2 small">{error}</div>}
      <div className="d-flex flex-column gap-2">
        {flagged.map(s => (
          <div key={s.id} className="card border-danger border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <div className="fw-semibold">
                    {s.patient.firstName} {s.patient.lastName}
                    <span className="text-muted ms-2"
                      style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                      {s.patient.patientCode}
                    </span>
                  </div>
                  <div className="text-muted small">
                    Screened: {new Date(s.screeningDatetime).toLocaleDateString("en-GB")}
                  </div>
                  {s.reviewNote && (
                    <div className="mt-2 p-2 rounded"
                      style={{ background: "#fff3cd", fontSize: "0.85rem" }}>
                      <strong>📝 Reason from Manager:</strong>
                      <div className="mt-1">{s.reviewNote}</div>
                    </div>
                  )}
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <Link href={`/screenings/${s.id}/edit`}
                    className="btn btn-sm btn-outline-primary">
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => handleResubmit(s.id)}
                    disabled={resubmitting === s.id}
                    className="btn btn-sm btn-success">
                    {resubmitting === s.id
                      ? <><span className="spinner-border spinner-border-sm me-1" />Resubmitting...</>
                      : "↩️ Resubmit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
