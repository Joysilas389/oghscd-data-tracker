"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }
  return (
    <button
      onClick={handleLogout}
      className="btn btn-outline-light"
      style={{ fontSize: "0.7rem", padding: "3px 10px", whiteSpace: "nowrap" }}
      title="Sign Out">
      🚪 Sign Out
    </button>
  );
}
