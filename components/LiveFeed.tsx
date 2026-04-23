"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface FeedItem {
  id: string;
  patientName: string;
  patientCode: string;
  result: string;
  locality: string;
  createdAt: string;
}

export default function LiveFeed({ initial }: { initial: FeedItem[] }) {
  const [items, setItems] = useState<FeedItem[]>(initial);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/dashboard/feed");
        if (res.ok) {
          const data = await res.json();
          setItems(data.items);
        }
      } catch {}
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  function timeAgo(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString("en-GB");
  }

  const resultColor: Record<string, string> = {
    "Normal (AA)": "#198754",
    "Sickle Cell Trait (AS)": "#ffc107",
    "Haemoglobin S": "#dc3545",
    "Sickle-C Disease (SC)": "#d63384",
    "Haemoglobin C Trait (AC)": "#6f42c1",
    "Haemoglobin C": "#0d6efd",
    "Inconclusive": "#6c757d",
    "Other Haemoglobinopathy": "#fd7e14",
  };

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white fw-semibold d-flex align-items-center gap-2 py-2">
        <span className="rounded-circle d-inline-block"
          style={{ width: 8, height: 8, background: "#198754",
            animation: "pulse 1.5s infinite", boxShadow: "0 0 0 0 rgba(25,135,84,0.4)" }} />
        <style>{`
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(25,135,84,0.6); }
            70% { box-shadow: 0 0 0 8px rgba(25,135,84,0); }
            100% { box-shadow: 0 0 0 0 rgba(25,135,84,0); }
          }
        `}</style>
        <span>🔴 Live Screening Feed</span>
        <span className="badge bg-success ms-auto" style={{ fontSize: "0.65rem" }}>
          Auto-updates every 60s
        </span>
      </div>
      <div className="card-body p-0">
        {items.length === 0 ? (
          <div className="text-center text-muted py-3 small">No screenings yet today</div>
        ) : (
          <div className="d-flex flex-column">
            {items.map((item, i) => (
              <Link key={item.id} href={`/screenings/${item.id}`}
                className="text-decoration-none"
                style={{
                  borderBottom: i < items.length - 1 ? "1px solid #f0f0f0" : "none",
                }}>
                <div className="d-flex align-items-center gap-3 px-3 py-2"
                  style={{ transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8f9fa")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div className="rounded-circle flex-shrink-0"
                    style={{
                      width: 10, height: 10,
                      background: resultColor[item.result] || "#6c757d"
                    }} />
                  <div className="flex-grow-1 min-width-0">
                    <div className="fw-semibold small text-dark" style={{ fontSize: "0.85rem" }}>
                      {item.patientName}
                      <span className="text-muted ms-2"
                        style={{ fontFamily: "monospace", fontSize: "0.7rem" }}>
                        {item.patientCode}
                      </span>
                    </div>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {item.result} · {item.locality || "—"}
                    </div>
                  </div>
                  <div className="text-muted flex-shrink-0" style={{ fontSize: "0.7rem" }}>
                    {timeAgo(item.createdAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
