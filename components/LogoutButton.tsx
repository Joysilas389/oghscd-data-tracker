"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }
  return (
    <button onClick={handleLogout}
      className="btn btn-sm btn-outline-light w-100"
      style={{ fontSize: "0.75rem" }}>
      🚪 Sign Out
    </button>
  );
}
