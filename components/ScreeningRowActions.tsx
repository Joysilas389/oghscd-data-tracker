"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  screeningId: string;
  canEdit: boolean;
  canDelete: boolean;
}

export default function ScreeningRowActions({ screeningId, canEdit, canDelete }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
        className="btn btn-sm btn-outline-primary py-0 px-2">
        View
      </Link>
      {canEdit && (
        <Link href={`/screenings/${screeningId}/edit`}
          className="btn btn-sm btn-outline-secondary py-0 px-2">
          Edit
        </Link>
      )}
      {canDelete && !showConfirm && (
        <button onClick={() => setShowConfirm(true)}
          className="btn btn-sm btn-outline-danger py-0 px-2">
          Delete
        </button>
      )}
      {showConfirm && (
        <div className="d-flex gap-1">
          <button onClick={handleDelete} disabled={deleting}
            className="btn btn-sm btn-danger py-0 px-2">
            {deleting ? "..." : "Confirm"}
          </button>
          <button onClick={() => setShowConfirm(false)}
            className="btn btn-sm btn-outline-secondary py-0 px-2">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
