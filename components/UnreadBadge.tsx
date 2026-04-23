"use client";
import { useEffect, useState } from "react";

export default function UnreadBadge() {
  const [count, setCount] = useState(0);

  async function fetchCount() {
    try {
      const res = await fetch("/api/messages/unread");
      const data = await res.json();
      setCount(data.count || 0);
    } catch {}
  }

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <span style={{
      background: "#dc3545", color: "#fff",
      borderRadius: "50%", fontSize: "0.55rem",
      padding: "1px 5px", fontWeight: 700,
      marginLeft: 4, verticalAlign: "middle",
    }}>
      {count > 9 ? "9+" : count}
    </span>
  );
}
