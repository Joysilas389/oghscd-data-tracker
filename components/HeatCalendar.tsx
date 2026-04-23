"use client";

interface DayData {
  date: string;
  count: number;
}

export default function HeatCalendar({ data }: { data: DayData[] }) {
  const map: Record<string, number> = {};
  data.forEach(d => { map[d.date] = d.count; });

  const max = Math.max(...data.map(d => d.count), 1);

  // Build last 10 weeks (70 days)
  const days: { date: string; count: number; label: string }[] = [];
  for (let i = 69; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      date: key,
      count: map[key] || 0,
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", weekday: "short" }),
    });
  }

  // Pad start to align with correct weekday (0=Sun)
  const firstDay = new Date(days[0].date).getDay();
  const padded = Array(firstDay).fill(null).concat(days);

  function getColor(count: number) {
    if (count === 0) return "#ebedf0";
    const intensity = Math.min(count / max, 1);
    if (intensity < 0.25) return "#d1ecf1";
    if (intensity < 0.5) return "#117a8b";
    if (intensity < 0.75) return "#1a5276";
    return "#0d3b5e";
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeks: (typeof days[0] | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white fw-semibold small py-2">
        🗓️ Screening Activity — Last 10 Weeks
      </div>
      <div className="card-body p-3" style={{ overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 3 }}>
          {/* Weekday labels */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3, marginRight: 4 }}>
            {weekDays.map(d => (
              <div key={d} style={{ height: 14, fontSize: "0.6rem", color: "#999",
                lineHeight: "14px", width: 24, textAlign: "right" }}>
                {d}
              </div>
            ))}
          </div>
          {/* Grid columns (weeks) */}
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {week.map((day, di) => (
                <div key={di}
                  title={day ? `${day.label}: ${day.count} screening${day.count !== 1 ? "s" : ""}` : ""}
                  style={{
                    width: 14, height: 14, borderRadius: 2,
                    background: day ? getColor(day.count) : "transparent",
                    cursor: day && day.count > 0 ? "pointer" : "default",
                  }} />
              ))}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="d-flex align-items-center gap-2 mt-3" style={{ fontSize: "0.7rem", color: "#666" }}>
          <span>Less</span>
          {["#ebedf0", "#d1ecf1", "#117a8b", "#1a5276", "#0d3b5e"].map(c => (
            <div key={c} style={{ width: 12, height: 12, borderRadius: 2, background: c }} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
