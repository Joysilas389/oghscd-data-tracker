"use client";
import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

interface ChartData {
  results: { label: string; value: number }[];
  types: { label: string; value: number }[];
  statuses: { label: string; value: number }[];
  sexes: { label: string; value: number }[];
  trend: { day: string; count: number }[];
}

function useChart(ref: React.RefObject<HTMLCanvasElement | null>, type: string, labels: string[], data: number[], colors: string[], label: string) {
  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext("2d");
    if (!ctx) return;
    const chart = new Chart(ctx, {
      type: type as "bar" | "doughnut" | "line",
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: colors,
          borderColor: type === "line" ? colors[0] : colors,
          borderWidth: type === "line" ? 2 : 1,
          fill: type === "line" ? false : undefined,
          tension: 0.3,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: type === "doughnut" } },
        scales: type !== "doughnut" ? { y: { beginAtZero: true, ticks: { stepSize: 1 } } } : undefined,
      },
    });
    return () => chart.destroy();
  }, []);
}

export default function DashboardCharts({ data }: { data: ChartData }) {
  const trendRef = useRef<HTMLCanvasElement>(null);
  const typeRef = useRef<HTMLCanvasElement>(null);
  const resultRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<HTMLCanvasElement>(null);
  const sexRef = useRef<HTMLCanvasElement>(null);

  const COLORS = ["#1a5276","#117a8b","#198754","#856404","#d63384","#6f42c1","#0d6efd","#dc3545"];

  useEffect(() => {
    if (!trendRef.current) return;
    const ctx = trendRef.current.getContext("2d");
    if (!ctx) return;
    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.trend.map(d => d.day),
        datasets: [{ label: "Screenings", data: data.trend.map(d => d.count),
          borderColor: "#1a5276", backgroundColor: "rgba(26,82,118,0.1)",
          fill: true, tension: 0.3 }],
      },
      options: { responsive: true, plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } },
    });
    return () => chart.destroy();
  }, []);

  useEffect(() => {
    if (!typeRef.current) return;
    const ctx = typeRef.current.getContext("2d");
    if (!ctx) return;
    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: data.types.map(d => d.label),
        datasets: [{ data: data.types.map(d => d.value),
          backgroundColor: ["#0d6efd","#d63384"] }],
      },
      options: { responsive: true },
    });
    return () => chart.destroy();
  }, []);

  useEffect(() => {
    if (!resultRef.current) return;
    const ctx = resultRef.current.getContext("2d");
    if (!ctx) return;
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.results.map(d => d.label.length > 20 ? d.label.slice(0,18)+"…" : d.label),
        datasets: [{ label: "Count", data: data.results.map(d => d.value),
          backgroundColor: COLORS }],
      },
      options: { responsive: true, plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } },
    });
    return () => chart.destroy();
  }, []);

  useEffect(() => {
    if (!statusRef.current) return;
    const ctx = statusRef.current.getContext("2d");
    if (!ctx) return;
    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: data.statuses.map(d => d.label),
        datasets: [{ data: data.statuses.map(d => d.value),
          backgroundColor: ["#ffc107","#198754","#dc3545","#0dcaf0"] }],
      },
      options: { responsive: true },
    });
    return () => chart.destroy();
  }, []);

  useEffect(() => {
    if (!sexRef.current) return;
    const ctx = sexRef.current.getContext("2d");
    if (!ctx) return;
    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: data.sexes.map(d => d.label),
        datasets: [{ data: data.sexes.map(d => d.value),
          backgroundColor: ["#0d6efd","#d63384"] }],
      },
      options: { responsive: true },
    });
    return () => chart.destroy();
  }, []);

  return (
    <div className="row g-3">
      <div className="col-12 col-md-6">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white small fw-semibold">📈 Screenings — Last 7 Days</div>
          <div className="card-body"><canvas ref={trendRef} /></div>
        </div>
      </div>
      <div className="col-12 col-md-6">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white small fw-semibold">📊 Results Breakdown</div>
          <div className="card-body"><canvas ref={resultRef} /></div>
        </div>
      </div>
      <div className="col-6 col-md-4">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white small fw-semibold">🔵 Screening Type</div>
          <div className="card-body"><canvas ref={typeRef} /></div>
        </div>
      </div>
      <div className="col-6 col-md-4">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white small fw-semibold">🔍 Review Status</div>
          <div className="card-body"><canvas ref={statusRef} /></div>
        </div>
      </div>
      <div className="col-6 col-md-4">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white small fw-semibold">👥 Sex Distribution</div>
          <div className="card-body"><canvas ref={sexRef} /></div>
        </div>
      </div>
    </div>
  );
}
