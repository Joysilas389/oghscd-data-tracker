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
  const [showConfirm, setShowConfirm] = useState(false);

  const isManager = currentUserRole === "MANAGER" || currentUserRole === "ADMIN";
  const isOwner = enteredById === currentUserId;

  const canEdit = isManager || (isOwner && (reviewStatus === "PENDING" || reviewStatus === "FLAGGED"));
  const canDelete = isManager || isOwner;

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/screenings/${screeningId}`, { method: "DELETE" });
    setDeleting(false);
    setShowConfirm(false);
    router.refresh();
  }

  return (
    <div className="d-flex gap-1 align-items-center flex-wrap">
      <Link href={`/screenings/${screeningId}`}
        className="btn btn-sm btn-outline-primary py-0 px-2">View</Link>
      {canEdit && (
        <Link href={`/screenings/${screeningId}/edit`}
          className="btn btn-sm btn-outline-secondary py-0 px-2">Edit</Link>
      )}
      {reviewStatus === "APPROVED" && !isManager && (
        <span className="text-muted" style={{ fontSize: "0.75rem" }} title="Approved - cannot edit">🔒</span>
      )}
      {canDelete && !showConfirm && (
        <button onClick={() => setShowConfirm(true)}
          className="btn btn-sm btn-outline-danger py-0 px-2">Del</button>
      )}
      {showConfirm && (
        <div className="d-flex gap-1">
          <button onClick={handleDelete} disabled={deleting}
            className="btn btn-sm btn-danger py-0 px-2">
            {deleting ? "..." : "✓"}
          </button>
          <button onClick={() => setShowConfirm(false)}
            className="btn btn-sm btn-outline-secondary py-0 px-2">✗</button>
        </div>
      )}
    </div>
  );
}
