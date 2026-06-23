import { useMemo } from "preact/hooks";
import * as Icons from "lucide-preact";
import type { StreakData } from "../../signals/journal.ts";
import { freezeStreak } from "../../signals/journal.ts";

interface StreakCardProps {
  streakData: StreakData;
  onFreezeUsed?: () => void;
}

export default function StreakCard(
  { streakData, onFreezeUsed }: StreakCardProps,
) {
  const { currentStreak, longestStreak, freezeCount, currentLevel } =
    streakData;

  const levelEmoji = useMemo(() => {
    switch (currentLevel) {
      case "Spark":
        return "🌟";
      case "Flame":
        return "🔥";
      case "Inferno":
        return "🌪️";
      case "Phoenix":
        return "✨";
      default:
        return "🌟";
    }
  }, [currentLevel]);

  const levelColor = useMemo(() => {
    switch (currentLevel) {
      case "Spark":
        return "#f59e0b"; // amber (subtle)
      case "Flame":
        return "#fb923c"; // orange
      case "Inferno":
        return "#ef4444"; // red
      case "Phoenix":
        return "#c084fc"; // violet
      default:
        return "#f59e0b";
    }
  }, [currentLevel]);

  const handleFreeze = () => {
    const success = freezeStreak();
    if (success && onFreezeUsed) {
      onFreezeUsed();
    }
  };

  const hex = levelColor;
  // Use app accent CSS variable for subtle glow to respect theme
  const glowStyle = {
    boxShadow: `0 20px 60px rgba(var(--muse-accent-rgb), 0.12)`,
    borderColor: `rgba(var(--muse-accent-rgb), 0.14)`,
    background:
      `linear-gradient(135deg, rgba(var(--muse-accent-rgb), 0.035), transparent)`,
  } as Record<string, string>;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Streak Card - subdued surface to match rooms/threads */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 transition-all group cursor-default border bg-[var(--muse-surface-soft)]`}
        style={glowStyle}
      >
        <div className="relative z-10 flex items-center gap-4">
          {/* Subtle level emoji */}
          <div
            className="text-3xl transition-transform duration-200"
            style={{ color: hex }}
          >
            {levelEmoji}
          </div>

          {/* Stats */}
          <div className="flex-1">
            <div className="text-3xl font-bold text-[var(--muse-text)] leading-none">
              {currentStreak}
            </div>
            <p className="text-xs uppercase tracking-widest text-[var(--muse-muted)] font-semibold mt-2">
              Day Streak
            </p>
            <p className="text-xs uppercase tracking-widest text-[var(--muse-muted)] mt-1">
              Level: {currentLevel}
            </p>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-2 text-right">
            <div className="flex items-center gap-2 justify-end">
              <Icons.TrendingUp
                size={16}
                className="text-[var(--muse-muted)]"
              />
              <span className="text-sm font-bold text-[var(--muse-muted)]">
                {longestStreak} best
              </span>
            </div>
            <div className="flex items-center gap-1 justify-end bg-white/5 rounded-full px-3 py-1.5 backdrop-blur">
              <Icons.Zap size={14} className="text-[var(--muse-muted)]" />
              <span className="text-xs font-semibold text-[var(--muse-muted)]">
                {freezeCount} freezes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Freeze Button */}
      {freezeCount > 0 && (
        <button
          onClick={handleFreeze}
          type="button"
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-[var(--muse-border)] hover:border-white/20 text-[var(--muse-text)] font-semibold uppercase text-xs tracking-widest transition-all cursor-pointer"
        >
          <Icons.Wind size={16} className="inline mr-2" />
          Use Freeze to Skip Today ({freezeCount} left)
        </button>
      )}

      {freezeCount === 0 && (
        <div className="text-center px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-xs text-[var(--muse-muted)] uppercase tracking-widest font-semibold">
            Freezes reset next month
          </p>
        </div>
      )}
    </div>
  );
}
