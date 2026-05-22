import { JournalEntry } from "../../signals/journal.ts";
import { Calendar, TrendingUp, Activity } from "lucide-preact";

interface TimelineEntry {
  date: string;
  entries: number;
  dayOfWeek: string;
  intensity: "low" | "medium" | "high" | "peak";
}

interface MirrorTimelineProps {
  entries: JournalEntry[];
  days?: number;
}

export function MirrorTimeline({ entries, days = 90 }: MirrorTimelineProps) {
  const timeline = buildTimeline(entries, days);
  const stats = calculateStats(timeline);

  const intensityColors = {
    low: "bg-white/5",
    medium: "bg-canvas-primary/30",
    high: "bg-canvas-primary/60",
    peak: "bg-canvas-primary",
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div class="space-y-6">
      {/* Stats */}
      <div class="grid grid-cols-3 gap-4">
        <div class="p-4 rounded-xl bg-white/5 border border-white/10">
          <p class="text-xs text-white/60 mb-1">Most Active Day</p>
          <p class="text-lg font-semibold text-white">{stats.mostActiveDay}</p>
          <p class="text-xs text-white/50">{stats.mostActiveCount} entries</p>
        </div>
        <div class="p-4 rounded-xl bg-white/5 border border-white/10">
          <p class="text-xs text-white/60 mb-1">Avg Per Day</p>
          <p class="text-lg font-semibold text-white">{stats.avgPerDay.toFixed(1)}</p>
          <p class="text-xs text-white/50">{stats.totalDays} days active</p>
        </div>
        <div class="p-4 rounded-xl bg-white/5 border border-white/10">
          <p class="text-xs text-white/60 mb-1">Consistency</p>
          <p class="text-lg font-semibold text-white">{stats.consistency}%</p>
          <p class="text-xs text-white/50">Active ratio</p>
        </div>
      </div>

      {/* Timeline Grid */}
      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-white/80 flex items-center gap-2">
          <Calendar size={16} />
          Activity Timeline
        </h3>

        {/* Week Headers */}
        <div class="grid grid-cols-7 gap-1">
          {daysOfWeek.map((day) => (
            <div key={day} class="text-xs text-white/50 text-center font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Week Rows */}
        <div class="space-y-1">
          {getWeekRows(timeline).map((week, weekIdx) => (
            <div key={weekIdx} class="grid grid-cols-7 gap-1">
              {week.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  class={`aspect-square rounded-lg p-1 flex items-center justify-center text-xs font-medium transition-all hover:ring-2 hover:ring-white/30 cursor-pointer ${
                    day ? intensityColors[day.intensity] : "bg-white/5"
                  }`}
                  title={day ? `${day.date}: ${day.entries} entries` : undefined}
                >
                  {day && day.entries > 0 ? day.entries : ""}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div class="flex items-center justify-center gap-6 mt-6 text-xs text-white/60">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-white/5" />
            <span>No activity</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-canvas-primary/30" />
            <span>Low</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-canvas-primary/60" />
            <span>High</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-canvas-primary" />
            <span>Peak</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ActivityTimelineProps {
  entries: JournalEntry[];
  days?: number;
}

export function ActivityTimeline({ entries, days = 30 }: ActivityTimelineProps) {
  const timeline = buildTimeline(entries, days);
  const maxEntries = Math.max(...timeline.map((t) => t.entries));

  return (
    <div class="space-y-4">
      <h3 class="text-sm font-semibold text-white/80 flex items-center gap-2">
        <Activity size={16} />
        Activity Chart
      </h3>

      <div class="flex items-end justify-between h-40 gap-1 p-4 rounded-xl bg-white/5 border border-white/10">
        {timeline.map((day, i) => (
          <div key={i} class="flex-1 flex flex-col items-center justify-end gap-2">
            <div
              class="w-full rounded-t-lg bg-gradient-to-t from-canvas-primary to-canvas-primary/40 hover:from-canvas-primary/80 transition-all hover:ring-2 hover:ring-white/30"
              style={{ height: `${(day.entries / maxEntries) * 100}%` || "4px" }}
              title={`${day.date}: ${day.entries} entries`}
            />
            <span class="text-xs text-white/40 whitespace-nowrap">{day.date.split(" ")[1]}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-xs text-white/60 mb-1">Peak Day</p>
          <p class="text-lg font-semibold text-white">
            {timeline.reduce((max, t) => (t.entries > max.entries ? t : max)).entries} entries
          </p>
        </div>
        <div>
          <p class="text-xs text-white/60 mb-1">Total Entries</p>
          <p class="text-lg font-semibold text-white">
            {timeline.reduce((sum, t) => sum + t.entries, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}

function buildTimeline(entries: JournalEntry[], days: number) {
  const timeline: TimelineEntry[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 86400000);
    const dateStr = date.toDateString();
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });

    const count = entries.filter(
      (e) => new Date(e.createdAt).toDateString() === dateStr
    ).length;

    timeline.push({
      date: dateStr,
      entries: count,
      dayOfWeek,
      intensity: count === 0 ? "low" : count === 1 ? "medium" : count <= 3 ? "high" : "peak",
    });
  }

  return timeline;
}

function calculateStats(timeline: TimelineEntry[]) {
  const maxDay = timeline.reduce((max, t) => (t.entries > max.entries ? t : max));
  const totalDays = timeline.filter((t) => t.entries > 0).length;
  const totalEntries = timeline.reduce((sum, t) => sum + t.entries, 0);
  const avgPerDay = totalEntries / timeline.length;
  const consistency = Math.round((totalDays / timeline.length) * 100);

  return {
    mostActiveDay: maxDay.dayOfWeek,
    mostActiveCount: maxDay.entries,
    totalDays,
    totalEntries,
    avgPerDay,
    consistency,
  };
}

function getWeekRows(timeline: TimelineEntry[]): TimelineEntry[][] {
  const weeks: TimelineEntry[][] = [];
  let currentWeek: TimelineEntry[] = [];

  for (let i = 0; i < timeline.length; i++) {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(timeline[i]);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}
