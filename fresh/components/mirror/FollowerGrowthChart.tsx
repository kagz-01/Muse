import * as Icons from "lucide-preact";

interface FollowerGrowthChartProps {
  data: { date: string; count: number }[];
}

export default function FollowerGrowthChart(
  { data }: FollowerGrowthChartProps,
) {
  const maxCount = Math.max(...data.map((d) => d.count));
  const minCount = Math.min(...data.map((d) => d.count));
  const range = maxCount - minCount || 1;

  const getNormalizedHeight = (count: number) => {
    return ((count - minCount) / range) * 100;
  };

  return (
    <div className="bg-gradient-to-br from-[var(--muse-surface-bright)] to-[var(--muse-surface-soft)] rounded-2xl p-6 border border-[var(--muse-border-light)]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--muse-text)]">
          Follower Growth
        </h3>
        <div className="flex items-center gap-2 text-sm text-[var(--muse-text-muted)]">
          <Icons.TrendingUp size={16} className="text-[var(--muse-success)]" />
          <span>This week</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-32 mb-4">
        {data.map((point, idx) => {
          const height = getNormalizedHeight(point.count);
          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div
                className="w-full bg-gradient-to-t from-[var(--muse-accent)] to-[var(--muse-accent-light)] rounded-t-lg transition-all duration-300 group-hover:from-[var(--muse-accent-bright)] group-hover:to-[var(--muse-accent)]"
                style={{ height: `${Math.max(height, 10)}%` }}
              />
              <span className="text-xs text-[var(--muse-text-muted)] font-medium">
                {point.date}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-[var(--muse-border-light)] flex justify-between text-xs text-[var(--muse-text-muted)]">
        <span>{minCount} followers</span>
        <span className="font-semibold text-[var(--muse-text)]">
          {maxCount} followers
        </span>
      </div>
    </div>
  );
}
