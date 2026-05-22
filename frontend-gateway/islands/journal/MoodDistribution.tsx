import type { JournalMood } from "../../signals/journal.ts";

interface MoodStat {
  mood: JournalMood;
  label: string;
  emoji: string;
  color: string;
  count: number;
}

interface MoodDistributionProps {
  moodStats: MoodStat[];
  onMoodClick?: (mood: JournalMood | "all") => void;
  activeMood?: JournalMood | "all";
}

export default function MoodDistribution({
  moodStats,
  onMoodClick,
  activeMood = "all",
}: MoodDistributionProps) {
  const total = moodStats.reduce((sum, s) => sum + s.count, 0);
  const topMoods = moodStats.slice(0, 5);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
          <span className="text-emerald-400">🎭</span> Mood Landscape
        </h3>
      </div>

      {topMoods.length === 0 ? (
        <p className="text-gray-500 italic text-sm">Write entries to see your mood patterns.</p>
      ) : (
        <div className="space-y-4">
          {topMoods.map((stat) => {
            const percent = total > 0 ? Math.round((stat.count / total) * 100) : 0;
            const isActive = activeMood === stat.mood;

            return (
              <div
                key={stat.mood}
                onClick={() => onMoodClick?.(stat.mood)}
                className={`cursor-pointer transition-all rounded-xl p-3 ${
                  isActive
                    ? "bg-canvas-primary/20 border border-canvas-primary/50"
                    : "bg-white/5 border border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{stat.emoji}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                      {stat.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-500">
                    {stat.count} {stat.count === 1 ? "entry" : "entries"}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: stat.color,
                    }}
                  />
                </div>

                <div className="text-right mt-1.5">
                  <span className="text-[10px] text-gray-500 font-semibold">{percent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
