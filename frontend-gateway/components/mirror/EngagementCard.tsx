import { computed } from "@preact/signals";
import * as Icons from "lucide-preact";

interface EngagementCardProps {
  label: string;
  value: number;
  icon: any;
  trend?: {
    direction: "up" | "down";
    percentage: number;
  };
}

export default function EngagementCard({
  label,
  value,
  icon: Icon,
  trend,
}: EngagementCardProps) {
  return (
    <div className="bg-gradient-to-br from-[var(--muse-surface-bright)] to-[var(--muse-surface-soft)] rounded-2xl p-6 border border-[var(--muse-border-light)] hover:border-[var(--muse-border-active)] transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[var(--muse-text-muted)]">
          {label}
        </span>
        <div className="p-3 bg-[var(--muse-surface-soft)] rounded-lg">
          <Icon size={20} class="text-[var(--muse-accent)]" />
        </div>
      </div>

      <div className="mb-2">
        <p className="text-4xl font-bold text-[var(--muse-text)]">
          {value.toLocaleString()}
        </p>
      </div>

      {trend && (
        <div
          className={`flex items-center gap-1 text-xs font-semibold ${
            trend.direction === "up"
              ? "text-[var(--muse-success)]"
              : "text-[var(--muse-warning)]"
          }`}
        >
          {trend.direction === "up" ? (
            <Icons.TrendingUp size={14} />
          ) : (
            <Icons.TrendingDown size={14} />
          )}
          <span>{trend.percentage}% this week</span>
        </div>
      )}
    </div>
  );
}
