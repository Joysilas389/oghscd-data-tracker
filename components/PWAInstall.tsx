"use client";
import { useEffect, useState } from "react";

export default function PWAInstall() {
  const [prompt, setPrompt] = useState<Event & { prompt: () => void } | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as Event & { prompt: () => void });
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!prompt || shown) return null;

  return (
    <div className="position-fixed bottom-0 start-0 w-100 p-3"
      style={{ zIndex: 2000, paddingBottom: "5rem" }}>
      <div className="card border-0 shadow-lg">
        <div className="card-body p-3 d-flex align-items-center gap-3">
          <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 48, height: 48, background: "#1a5276" }}>
            <span className="text-white fw-bold" style={{ fontSize: "0.7rem" }}>SCD</span>
          </div>
          <div className="flex-grow-1">
            <div className="fw-semibold small">Install OGH SCD E-Tracker</div>
            <div className="text-muted" style={{ fontSize: "0.7rem" }}>
              Add to home screen for quick access
            </div>
          </div>
          <div className="d-flex gap-2 flex-shrink-0">
            <button onClick={() => setShown(true)}
              className="btn btn-sm btn-outline-secondary py-0 px-2">
              Not now
            </button>
            <button onClick={() => { prompt.prompt(); setShown(true); }}
              className="btn btn-sm text-white py-0 px-2"
              style={{ background: "#1a5276" }}>
              Install
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
