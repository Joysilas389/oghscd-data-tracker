"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  currentRole: string;
}

export default function ChangeRoleButton({ userId, currentRole }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function changeRole(newRole: string) {
    setLoading(true);
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="d-flex gap-1 flex-wrap">
      {currentRole !== "SCREENER" && (
        <button onClick={() => changeRole("SCREENER")} disabled={loading}
          className="btn btn-sm btn-outline-primary py-0 px-1" style={{ fontSize: "0.7rem" }}>
          → Screener
        </button>
      )}
      {currentRole !== "MANAGER" && (
        <button onClick={() => changeRole("MANAGER")} disabled={loading}
          className="btn btn-sm btn-outline-warning py-0 px-1" style={{ fontSize: "0.7rem" }}>
          → Manager
        </button>
      )}
    </div>
  );
}
