import { useMemo } from "preact/hooks";

interface HeatmapDay {
  date: Date;
  count: number;
}

interface ActivityHeatmapProps {
  data: HeatmapDay[];
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const maxCount = useMemo(() => {
    return Math.max(...data.map((d) => d.count), 1);
  }, [data]);

  const getIntensityColor = (count: number): string => {
    const percent = (count / maxCount) * 100;
    if (count === 0) return "bg-white/5 border-white/10 opacity-40";
    if (percent < 25) return "bg-canvas-primary/20 border-canvas-primary/40 shadow-[0_0_8px_rgba(34,211,238,0.2)]";
    if (percent < 50) return "bg-canvas-primary/40 border-canvas-primary/60 shadow-[0_0_12px_rgba(34,211,238,0.4)]";
    if (percent < 75) return "bg-canvas-primary/70 border-canvas-primary/80 shadow-[0_0_16px_rgba(34,211,238,0.6)]";
    return "bg-canvas-primary border-white shadow-[0_0_24px_rgba(34,211,238,0.9)] scale-110 z-10";
  };

  const getWeeks = useMemo(() => {
    const weeks: HeatmapDay[][] = [];
    let currentWeek: HeatmapDay[] = [];

    for (const day of data) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [data]);

  return (
    <div
      className="rounded-2xl p-6 border"
      style={{
        background: "var(--muse-surface)",
        borderColor: "var(--muse-border)",
        boxShadow: "0 10px 30px rgba(var(--muse-accent-rgb),0.04)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
          <span className="text-violet-400">📊</span> 31-Day Activity
        </h3>
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-1.5 mb-6">
        {getWeeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex gap-1.5">
            {week.map((day, dayIdx) => {
              const dateStr = day.date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              const tooltip = `${dateStr}: ${day.count} words`;

              return (
                <div
                  key={`${weekIdx}-${dayIdx}`}
                  title={tooltip}
                  className={`w-6 h-6 rounded border transition-all hover:scale-125 cursor-pointer ${
                    getIntensityColor(day.count)
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-white/10">
        <span>Low</span>
        <div className="flex gap-1 mx-2">
          <div className="w-3 h-3 rounded bg-white/5 border border-white/10" />
          <div className="w-3 h-3 rounded bg-violet-900/30 border border-violet-700/30" />
          <div className="w-3 h-3 rounded bg-violet-700/50 border border-violet-600/50" />
          <div className="w-3 h-3 rounded bg-violet-600/70 border border-violet-500/70" />
          <div className="w-3 h-3 rounded bg-violet-500 border border-violet-400" />
        </div>
        <span>High</span>
      </div>
    </div>
  );
}
