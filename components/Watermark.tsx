"use client";
import { useEffect, useState } from "react";

interface User {
  fullName: string;
  role: string;
}

export default function Watermark() {
  const [user, setUser] = useState<User | null>(null);
  const today = new Date().toLocaleDateString("en-GB");

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => { if (data.user) setUser(data.user); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;

    // Screenshot detection — Print Screen key
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "PrintScreen" ||
        (e.ctrlKey && e.shiftKey && e.key === "S") ||
        (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(e.key))
      ) {
        e.preventDefault();
        logScreenshot("KEYBOARD_SHORTCUT");
      }
    }

    // Screenshot detection — app goes to background (mobile)
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        logScreenshot("VISIBILITY_CHANGE");
      }
    }

    async function logScreenshot(method: string) {
      try {
        await fetch("/api/audit/screenshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method }),
        });
      } catch {}
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  if (!user) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        pointerEvents: "none",
        background: "rgba(26, 82, 118, 0.08)",
        borderTop: "1px solid rgba(26, 82, 118, 0.15)",
        padding: "4px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "0.65rem",
        color: "rgba(26, 82, 118, 0.6)",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}>
      <span>🔒 OGH SCD E-Tracker — Confidential</span>
      <span>{user.fullName} · {user.role} · {today}</span>
    </div>
  );
}
