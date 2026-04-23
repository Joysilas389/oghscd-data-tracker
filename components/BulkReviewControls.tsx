"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ScreeningItem {
  id: string;
  patientName: string;
  patientCode: string;
  result: string;
  status: string;
}

export default function BulkReviewControls({
  screenings,
}: {
  screenings: ScreeningItem[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showApproveAllModal, setShowApproveAllModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allIds = screenings.map(s => s.id);
  const allSelected = selected.size === allIds.length && allIds.length > 0;

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  async function approveIds(ids: string[]) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/screenings/bulk-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to approve");
      } else {
        setSelected(new Set());
        setShowApproveAllModal(false);
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Top bar — Select All + Approve All */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 p-3 rounded"
        style={{ background: "#fff", border: "1px solid #dee2e6" }}>
        <div className="d-flex align-items-center gap-2">
          <input
            type="checkbox"
            className="form-check-input mt-0"
            id="select-all"
            checked={allSelected}
            onChange={toggleAll}
          />
          <label htmlFor="select-all" className="small fw-semibold mb-0" style={{ cursor: "pointer" }}>
            {allSelected ? "Deselect All" : "Select All"} ({screenings.length})
          </label>
        </div>
        <button
          className="btn btn-sm btn-success"
          onClick={() => setShowApproveAllModal(true)}>
          ✅ Approve All ({screenings.length})
        </button>
      </div>

      {error && <div className="alert alert-danger small mb-3">{error}</div>}

      {/* Cards with checkboxes */}
      <div className="d-flex flex-column gap-3" style={{ paddingBottom: "120px" }}>
        {screenings.map(s => (
          <div key={s.id}
            className="bulk-card"
            style={{
              outline: selected.has(s.id) ? "2px solid #1a5276" : "none",
              borderRadius: 8,
            }}>
            <div className="d-flex align-items-start gap-2 p-2 pb-0">
              <input
                type="checkbox"
                className="form-check-input mt-1 flex-shrink-0"
                checked={selected.has(s.id)}
                onChange={() => toggleOne(s.id)}
              />
              <div className="flex-grow-1">
                {/* Slot for card content — injected via data attribute */}
                <div data-screening-id={s.id} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating bar — Approve Selected */}
      {selected.size > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 70,
            left: 0,
            right: 0,
            zIndex: 1040,
            display: "flex",
            justifyContent: "center",
            padding: "0 1rem",
          }}>
          <div className="d-flex align-items-center gap-3 px-4 py-3 shadow-lg rounded-pill"
            style={{ background: "#1a5276", color: "#fff", fontSize: "0.9rem" }}>
            <span>
              <strong>{selected.size}</strong> record{selected.size > 1 ? "s" : ""} selected
            </span>
            <button
              className="btn btn-sm btn-light fw-semibold px-3"
              onClick={() => approveIds([...selected])}
              disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-1" />Approving...</>
                : `✅ Approve Selected (${selected.size})`}
            </button>
            <button
              onClick={() => setSelected(new Set())}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)",
                cursor: "pointer", fontSize: "1rem" }}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Approve All Modal */}
      {showApproveAllModal && (
        <div className="modal fade show d-block" tabIndex={-1}
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">✅ Approve All Records</h5>
                <button type="button" className="btn-close"
                  onClick={() => setShowApproveAllModal(false)} disabled={loading} />
              </div>
              <div className="modal-body py-3">
                <p className="mb-1">
                  You are about to approve{" "}
                  <strong>{screenings.length} record{screenings.length > 1 ? "s" : ""}</strong>{" "}
                  without individual review.
                </p>
                <p className="text-muted small mb-0">
                  ⚠️ Please make sure you have reviewed the records before proceeding.
                  This action cannot be undone without manual correction.
                </p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-outline-secondary btn-sm px-4"
                  onClick={() => setShowApproveAllModal(false)} disabled={loading}>
                  Cancel
                </button>
                <button className="btn btn-success btn-sm px-4"
                  onClick={() => approveIds(allIds)} disabled={loading}>
                  {loading
                    ? <><span className="spinner-border spinner-border-sm me-1" />Approving...</>
                    : `Yes, Approve All (${screenings.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
