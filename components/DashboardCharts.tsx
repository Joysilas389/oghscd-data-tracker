"use client";
import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

interface Props {
  trendData: { label: string; count: number }[];
  resultCounts: { label: string; count: number }[];
  typeCounts: { label: string; count: number }[];
  statusCounts: { label: string; count: number }[];
  localityCounts: { label: string; count: number }[];
  treatmentCounts: { label: string; count: number }[];
  sexCounts: { label: string; count: number }[];
  filterLabel: string;
}

const COLORS = [
  "#1a5276","#117a8b","#198754","#856404",
  "#d63384","#6f42c1","#0d6efd","#dc3545",
  "#fd7e14","#0dcaf0","#20c997","#ffc107",
];

function useChart(
  ref: React.RefObject<HTMLCanvasElement | null>,
  type: string,
  labels: string[],
  data: number[],
  colors: string[],
  label: string
) {
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
        animation: { duration: 1000, easing: "easeOutQuart" },
        plugins: { legend: { display: type === "doughnut" } },
        scales: type !== "doughnut" ? { y: { beginAtZero: true, ticks: { stepSize: 1 } } } : undefined,
      },
    });
    return () => chart.destroy();
  }, []);
}

export default function DashboardCharts({
  trendData, resultCounts, typeCounts, statusCounts,
  localityCounts, treatmentCounts, sexCounts, filterLabel,
}: Props) {
  const trendRef = useRef<HTMLCanvasElement>(null);
  const resultRef = useRef<HTMLCanvasElement>(null);
  const resultPieRef = useRef<HTMLCanvasElement>(null);
  const typeRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<HTMLCanvasElement>(null);
  const localityRef = useRef<HTMLCanvasElement>(null);
  const treatmentRef = useRef<HTMLCanvasElement>(null);
  const sexRef = useRef<HTMLCanvasElement>(null);

  useChart(trendRef, "line",
    trendData.map(d => d.label),
    trendData.map(d => d.count),
    [COLORS[0]], "Screenings");

  // Horizontal bar chart for results breakdown
  useEffect(() => {
    if (!resultRef.current) return;
    const ctx = resultRef.current.getContext("2d");
    if (!ctx) return;
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: resultCounts.map(d => d.label),
        datasets: [{
          label: "Results",
          data: resultCounts.map(d => d.count),
          backgroundColor: COLORS,
          borderColor: COLORS,
          borderWidth: 1,
          borderRadius: 4,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        animation: { duration: 1000, easing: "easeOutQuart" },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.parsed.x} screening${context.parsed.x !== 1 ? "s" : ""}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: "rgba(0,0,0,0.05)" },
          },
          y: {
            ticks: {
              font: { size: 11 },
              color: "#444",
            },
            grid: { display: false },
          },
        },
      },
    });
    return () => chart.destroy();
  }, []);

  useEffect(() => {
    if (!resultPieRef.current) return;
    const ctx = resultPieRef.current.getContext("2d");
    if (!ctx) return;
    const total = resultCounts.reduce((sum, d) => sum + d.count, 0);
    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: resultCounts.map(d => d.label),
        datasets: [{
          data: resultCounts.map(d => d.count),
          backgroundColor: COLORS,
          borderColor: COLORS,
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        animation: { duration: 1000, easing: "easeOutQuart" },
        plugins: {
          legend: { display: true, position: "bottom" },
          tooltip: {
            callbacks: {
              label: function(context) {
                const count = context.parsed;
                const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
                return context.label + ": " + count + " (" + pct + "%)";
              }
            }
          }
        }
      },
    });
    return () => chart.destroy();
  }, []);

  useChart(typeRef, "doughnut",
    typeCounts.map(d => d.label === "CATCH_UP" ? "Catch-Up" : "Newborn"),
    typeCounts.map(d => d.count),
    [COLORS[0], COLORS[2]], "Type");

  useChart(statusRef, "doughnut",
    statusCounts.map(d => d.label),
    statusCounts.map(d => d.count),
    [COLORS[2], COLORS[7], COLORS[4], COLORS[1]], "Status");

  useChart(localityRef, "bar",
    localityCounts.map(d => d.label),
    localityCounts.map(d => d.count),
    COLORS, "Locality");

  useChart(treatmentRef, "doughnut",
    treatmentCounts.map(d => d.label),
    treatmentCounts.map(d => d.count),
    [COLORS[2], COLORS[7]], "Treatment");

  useChart(sexRef, "doughnut",
    sexCounts.map(d => d.label),
    sexCounts.map(d => d.count),
    [COLORS[0], COLORS[4], COLORS[1]], "Sex");

  const charts = [
    { title: `📈 7-Day Trend`, ref: trendRef, tall: false },
    { title: `🔬 Results Breakdown`, ref: resultRef, tall: true },
    { title: `🥧 Results Distribution`, ref: resultPieRef, tall: false },
    { title: `🍩 Screening Type`, ref: typeRef, tall: false },
    { title: `✅ Review Status`, ref: statusRef, tall: false },
    { title: `📍 Top Localities`, ref: localityRef, tall: false },
    { title: `💊 Treatment Status`, ref: treatmentRef, tall: false },
    { title: `👥 Sex Distribution`, ref: sexRef, tall: false },
  ];

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="fw-semibold mb-0">Charts — {filterLabel}</h6>
      </div>
      <div className="row g-3">
        {charts.map(chart => (
          <div key={chart.title} className={chart.tall ? "col-12" : "col-12 col-md-6"}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white small fw-semibold py-2">
                {chart.title}
              </div>
              <div className="card-body p-3">
                <canvas ref={chart.ref}
                  style={chart.tall ? { maxHeight: 320 } : {}} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
