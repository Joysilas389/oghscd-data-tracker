"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  screeningId: string;
  reviewStatus: string;
  enteredById: string;
  currentUserId: string;
  currentUserRole: string;
}

export default function ScreeningRowActions({
  screeningId, reviewStatus, enteredById, currentUserId, currentUserRole
}: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isManagerOrAdmin = currentUserRole === "MANAGER" || currentUserRole === "ADMIN";
  const isOwner = enteredById === currentUserId;
  const isApproved = reviewStatus === "APPROVED";

  // Edit rules:
  // - APPROVED: only Manager/Admin
  // - FLAGGED: owner (to correct) OR Manager/Admin
  // - PENDING/CORRECTED: owner OR Manager/Admin
  const canEdit = isManagerOrAdmin || (
    isOwner && (reviewStatus === "PENDING" || reviewStatus === "FLAGGED" || reviewStatus === "CORRECTED")
  );

  // Delete rules:
  // - APPROVED: only Manager/Admin
  // - All others: owner OR Manager/Admin
  const canDelete = isManagerOrAdmin || (isOwner && !isApproved);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/screenings/${screeningId}`, { method: "DELETE" });
    setDeleting(false);
    setShowModal(false);
    router.refresh();
  }

  return (
    <>
      <div className="d-flex gap-1 align-items-center flex-wrap">
        {/* View — always visible */}
        <Link href={`/screenings/${screeningId}`}
          className="btn btn-sm btn-outline-primary py-0 px-2">
          View
        </Link>

        {/* Edit */}
        {canEdit && (
          <Link href={`/screenings/${screeningId}/edit`}
            className="btn btn-sm btn-outline-secondary py-0 px-2">
            Edit
          </Link>
        )}

        {/* Lock icon for screener on approved records */}
        {isApproved && !isManagerOrAdmin && (
          <span className="text-muted" style={{ fontSize: "0.75rem" }}
            title="Approved — contact Manager to make changes">🔒</span>
        )}

        {/* Delete */}
        {canDelete && (
          <button onClick={() => setShowModal(true)}
            className="btn btn-sm btn-outline-danger py-0 px-2">
            Delete
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex={-1}
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-danger">🗑️ Delete Screening</h5>
                <button type="button" className="btn-close"
                  onClick={() => setShowModal(false)} disabled={deleting} />
              </div>
              <div className="modal-body py-3">
                <p className="mb-1">Are you sure you want to delete this screening record?</p>
                <p className="text-muted small mb-0">
                  This action <strong>cannot be undone</strong>. The record will be permanently removed from the database.
                </p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-outline-secondary btn-sm px-4"
                  onClick={() => setShowModal(false)} disabled={deleting}>
                  No, Cancel
                </button>
                <button className="btn btn-danger btn-sm px-4"
                  onClick={handleDelete} disabled={deleting}>
                  {deleting ? (
                    <><span className="spinner-border spinner-border-sm me-1" />Deleting...</>
                  ) : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
