"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface KPI {
  label: string;
  value: number;
  color: string;
  icon: string;
  link?: string;
}

function Counter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const duration = 1000;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count}</>;
}

export default function AnimatedKPI({ kpis }: { kpis: KPI[] }) {
  return (
    <div className="row g-3 mb-4">
      {kpis.map(k => (
        <div key={k.label} className="col-6 col-md-3">
          {k.link ? (
            <Link href={k.link} className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100"
                style={{ borderLeft: `4px solid ${k.color}` }}>
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="text-muted small">{k.label}</div>
                      <div className="fw-bold" style={{ fontSize: "1.6rem", color: k.color }}>
                        <Counter target={k.value} />
                      </div>
                    </div>
                    <span style={{ fontSize: "1.4rem" }}>{k.icon}</span>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="card border-0 shadow-sm h-100"
              style={{ borderLeft: `4px solid ${k.color}` }}>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-muted small">{k.label}</div>
                    <div className="fw-bold" style={{ fontSize: "1.6rem", color: k.color }}>
                      <Counter target={k.value} />
                    </div>
                  </div>
                  <span style={{ fontSize: "1.4rem" }}>{k.icon}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
