"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface BinItem {
  id: string;
  patientName: string;
  patientCode: string;
  sex: string;
  result: string;
  screeningType: string;
  screeningDatetime: string;
  deletedAt: string;
  enteredBy: string;
}

type ModalType = "restore" | "delete" | "emptyBin" | null;

export default function BinActions({ items }: { items: BinItem[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function openModal(type: ModalType, id?: string) {
    setSelectedId(id || null);
    setModal(type);
    setError("");
  }

  function closeModal() {
    setModal(null);
    setSelectedId(null);
    setError("");
  }

  async function handleRestore() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/screenings/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to restore"); }
      else { closeModal(); router.refresh(); }
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }

  async function handlePermanentDelete(emptyAll = false) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/screenings/permanent-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emptyAll ? { emptyAll: true } : { id: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to delete"); }
      else { closeModal(); router.refresh(); }
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }

  if (items.length === 0) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <div style={{ fontSize: "3rem" }}>🗑️</div>
          <h5 className="fw-semibold mt-2">Bin is empty</h5>
          <p className="text-muted small">No deleted records found.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Empty bin button */}
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-sm btn-danger px-3"
          onClick={() => openModal("emptyBin")}>
          🗑️ Empty Bin ({items.length})
        </button>
      </div>

      {/* Records */}
      <div className="d-flex flex-column gap-3">
        {items.map(item => (
          <div key={item.id} className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span className="font-monospace small text-muted">
                    {item.patientCode}
                  </span>
                  <h6 className="fw-semibold mb-0">{item.patientName}</h6>
                  <span className="text-muted small">
                    {item.sex} · {new Date(item.screeningDatetime).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <span className="badge bg-secondary">DELETED</span>
              </div>

              <div className="row g-2 small mb-3">
                <div className="col-6">
                  <span className="text-muted">Result: </span>
                  <strong>{item.result}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted">Type: </span>
                  <span className={`badge ${item.screeningType === "NEWBORN"
                    ? "bg-info text-dark" : "bg-primary"}`}>
                    {item.screeningType === "CATCH_UP" ? "Catch-Up" : "Newborn"}
                  </span>
                </div>
                <div className="col-6">
                  <span className="text-muted">Entered by: </span>
                  <strong>{item.enteredBy}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted">Deleted: </span>
                  <strong>{new Date(item.deletedAt).toLocaleDateString("en-GB")}</strong>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-success"
                  onClick={() => openModal("restore", item.id)}>
                  ♻️ Restore
                </button>
                <button className="btn btn-sm btn-outline-danger"
                  onClick={() => openModal("delete", item.id)}>
                  🗑️ Delete Permanently
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Restore Modal */}
      {modal === "restore" && (
        <div className="modal fade show d-block" tabIndex={-1}
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">♻️ Restore Record</h5>
                <button className="btn-close" onClick={closeModal} disabled={loading} />
              </div>
              <div className="modal-body py-3">
                <p className="mb-1">Are you sure you want to restore this record?</p>
                <p className="text-muted small mb-0">
                  The record will be moved back to the screening list with
                  <strong> PENDING</strong> status for review.
                </p>
                {error && <div className="alert alert-danger small mt-2">{error}</div>}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-outline-secondary btn-sm px-4"
                  onClick={closeModal} disabled={loading}>
                  Cancel
                </button>
                <button className="btn btn-success btn-sm px-4"
                  onClick={handleRestore} disabled={loading}>
                  {loading
                    ? <><span className="spinner-border spinner-border-sm me-1" />Restoring...</>
                    : "Yes, Restore"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Modal */}
      {modal === "delete" && (
        <div className="modal fade show d-block" tabIndex={-1}
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-danger">
                  ⚠️ Permanently Delete
                </h5>
                <button className="btn-close" onClick={closeModal} disabled={loading} />
              </div>
              <div className="modal-body py-3">
                <p className="mb-1">
                  Are you sure you want to <strong>permanently delete</strong> this record?
                </p>
                <p className="text-danger small mb-0 fw-semibold">
                  ⚠️ This action cannot be undone. The record will be erased
                  from the database forever.
                </p>
                {error && <div className="alert alert-danger small mt-2">{error}</div>}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-outline-secondary btn-sm px-4"
                  onClick={closeModal} disabled={loading}>
                  Cancel
                </button>
                <button className="btn btn-danger btn-sm px-4"
                  onClick={() => handlePermanentDelete(false)} disabled={loading}>
                  {loading
                    ? <><span className="spinner-border spinner-border-sm me-1" />Deleting...</>
                    : "Yes, Delete Forever"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty Bin Modal */}
      {modal === "emptyBin" && (
        <div className="modal fade show d-block" tabIndex={-1}
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-danger">
                  🗑️ Empty Bin
                </h5>
                <button className="btn-close" onClick={closeModal} disabled={loading} />
              </div>
              <div className="modal-body py-3">
                <p className="mb-1">
                  Are you sure you want to permanently delete
                  <strong> all {items.length} record{items.length !== 1 ? "s" : ""}</strong> in the bin?
                </p>
                <p className="text-danger small mb-0 fw-semibold">
                  ⚠️ This will erase everything in the bin forever and cannot be undone.
                </p>
                {error && <div className="alert alert-danger small mt-2">{error}</div>}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-outline-secondary btn-sm px-4"
                  onClick={closeModal} disabled={loading}>
                  Cancel
                </button>
                <button className="btn btn-danger btn-sm px-4"
                  onClick={() => handlePermanentDelete(true)} disabled={loading}>
                  {loading
                    ? <><span className="spinner-border spinner-border-sm me-1" />Emptying...</>
                    : `Yes, Empty Bin (${items.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
