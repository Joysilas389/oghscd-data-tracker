"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface KPI {
  label: string;
  value: number;
  color: string;
  icon: string;
  link?: string;
  max?: number;
  alert?: boolean;
  subtitle?: string;
}

// Eased count-up
function Counter({ target, delay }: { target: number; delay: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started || target === 0) return;
    const duration = 1200;
    const steps = 50;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      // Ease out cubic
      const progress = 1 - Math.pow(1 - step / steps, 3);
      setCount(Math.floor(progress * target));
      if (step >= steps) {
        setCount(target);
        clearInterval(timer);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  return <>{count.toLocaleString()}</>;
}

function KPICard({
  k,
  index,
}: {
  k: KPI;
  index: number;
}) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const delay = index * 80;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay + 50);
    return () => clearTimeout(t);
  }, [delay]);

  const progress = k.max && k.max > 0
    ? Math.min((k.value / k.max) * 100, 100)
    : null;

  const isAlert = k.alert && k.value > 0;

  const cardStyle: React.CSSProperties = {
    borderLeft: `4px solid ${k.color}`,
    borderRadius: 12,
    overflow: "hidden",
    transition: "transform 0.25s ease, box-shadow 0.25s ease, opacity 0.4s ease",
    transform: visible
      ? hovered ? "translateY(-5px) scale(1.02)" : "translateY(0) scale(1)"
      : "translateY(24px) scale(0.97)",
    opacity: visible ? 1 : 0,
    boxShadow: hovered
      ? `0 8px 24px rgba(0,0,0,0.13), 0 0 0 2px ${k.color}33`
      : "0 1px 6px rgba(0,0,0,0.07)",
    cursor: k.link ? "pointer" : "default",
    background: "#fff",
    animation: isAlert ? "kpi-pulse 2s ease-in-out infinite" : "none",
  };

  const inner = (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div style={{ padding: "14px 14px 0 14px" }}>
        <div className="d-flex justify-content-between align-items-start">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: "0.7rem",
              color: "#888",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 2,
            }}>
              {k.label}
            </div>
            <div style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              color: k.color,
              lineHeight: 1.1,
              fontVariantNumeric: "tabular-nums",
            }}>
              <Counter target={k.value} delay={delay} />
            </div>
          </div>
          <div style={{
            fontSize: "1.6rem",
            marginLeft: 8,
            filter: hovered ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "none",
            transition: "filter 0.25s ease, transform 0.25s ease",
            transform: hovered ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0deg)",
          }}>
            {k.icon}
          </div>
        </div>

        {/* Alert badge */}
        {isAlert && (
          <div style={{
            display: "inline-block",
            fontSize: "0.6rem",
            background: `${k.color}18`,
            color: k.color,
            borderRadius: 20,
            padding: "1px 8px",
            fontWeight: 700,
            marginTop: 4,
            letterSpacing: "0.03em",
          }}>
            ● Needs attention
          </div>
        )}
      </div>

      {/* Progress bar */}
      {progress !== null ? (
        <div style={{ padding: "10px 14px 12px 14px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.6rem",
            color: "#aaa",
            marginBottom: 4,
          }}>
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div style={{
            height: 4,
            background: "#f0f0f0",
            borderRadius: 4,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: visible ? `${progress}%` : "0%",
              background: `linear-gradient(90deg, ${k.color}99, ${k.color})`,
              borderRadius: 4,
              transition: `width 1.2s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
            }} />
          </div>
        </div>
      ) : (
        /* Thin colour accent line at bottom */
        <div style={{
          height: 3,
          background: `linear-gradient(90deg, ${k.color}44, ${k.color})`,
          marginTop: 12,
          width: visible ? "100%" : "0%",
          transition: `width 0.8s ease ${delay + 200}ms`,
        }} />
      )}
    </div>
  );

  return (
    <div className="col-6 col-md-3">
      <style>{`
        @keyframes kpi-pulse {
          0%, 100% { box-shadow: 0 1px 6px rgba(0,0,0,0.07); }
          50% { box-shadow: 0 0 0 6px ${k.color}22, 0 4px 16px rgba(0,0,0,0.1); }
        }
      `}</style>
      {k.link ? (
        <Link href={k.link} className="text-decoration-none d-block">
          {inner}
        </Link>
      ) : inner}
    </div>
  );
}

export default function AnimatedKPI({ kpis }: { kpis: KPI[] }) {
  return (
    <div className="row g-3 mb-4">
      {kpis.map((k, i) => (
        <KPICard key={k.label} k={k} index={i} />
      ))}
    </div>
  );
}
