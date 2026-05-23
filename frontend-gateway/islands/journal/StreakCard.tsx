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
        return "from-yellow-400 to-yellow-500";
      case "Flame":
        return "from-orange-400 to-red-500";
      case "Inferno":
        return "from-red-500 to-rose-600";
      case "Phoenix":
        return "from-yellow-300 via-rose-400 to-purple-600";
      default:
        return "from-yellow-400 to-yellow-500";
    }
  }, [currentLevel]);

  const handleFreeze = () => {
    const success = freezeStreak();
    if (success && onFreezeUsed) {
      onFreezeUsed();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Streak Card */}
      <div
        className={`relative overflow-hidden rounded-3xl p-8 shadow-2xl transition-all hover:scale-105 hover:shadow-2xl group cursor-default bg-gradient-to-br ${levelColor}`}
      >
        <div className="absolute inset-0 opacity-10 bg-black pointer-events-none" />

        <div className="relative z-10 flex items-center gap-6">
          {/* Fire Emoji */}
          <div className="text-6xl animate-bounce group-hover:scale-125 transition-transform duration-300">
            {levelEmoji}
          </div>

          {/* Stats */}
          <div className="flex-1">
            <div className="text-5xl font-bold text-white leading-none">
              {currentStreak}
            </div>
            <p className="text-xs uppercase tracking-widest text-white/80 font-semibold mt-2">
              Day Streak
            </p>
            <p className="text-xs uppercase tracking-widest text-white/60 mt-1">
              Level: {currentLevel}
            </p>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-2 text-right">
            <div className="flex items-center gap-2 justify-end">
              <Icons.TrendingUp size={16} className="text-white/80" />
              <span className="text-sm font-bold text-white/80">
                {longestStreak} best
              </span>
            </div>
            <div className="flex items-center gap-1 justify-end bg-white/10 rounded-full px-3 py-1.5 backdrop-blur">
              <Icons.Zap size={14} className="text-yellow-300" />
              <span className="text-xs font-bold text-white">
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
          className="w-full px-4 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/60 text-blue-300 hover:text-blue-100 font-semibold uppercase text-xs tracking-widest transition-all hover:bg-blue-500/20 cursor-pointer"
        >
          <Icons.Wind size={16} className="inline mr-2" />
          Use Freeze to Skip Today ({freezeCount} left)
        </button>
      )}

      {freezeCount === 0 && (
        <div className="text-center px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
            Freezes reset next month
          </p>
        </div>
      )}
    </div>
  );
}
