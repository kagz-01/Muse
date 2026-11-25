import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";

interface MilestoneNotificationProps {
  milestone: number | null;
  onDismiss?: () => void;
}

export default function MilestoneNotification(
  { milestone, onDismiss }: MilestoneNotificationProps,
) {
  const [isVisible, setIsVisible] = useState(!!milestone);

  useEffect(() => {
    if (milestone) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [milestone, onDismiss]);

  if (!isVisible || !milestone) return null;

  const milestoneText = {
    7: { emoji: "🔥", title: "Hot Streak!", subtitle: "You're 7 days in!" },
    30: { emoji: "🌪️", title: "On Fire!", subtitle: "30 days of consistency" },
    100: {
      emoji: "🌟",
      title: "Unstoppable!",
      subtitle: "100 days! You're legendary",
    },
    365: {
      emoji: "✨",
      title: "Phoenix Rising!",
      subtitle: "One year of journaling!",
    },
    1000: {
      emoji: "👑",
      title: "Immortal!",
      subtitle: "1000 days! You've transcended",
    },
  }[milestone] ||
    { emoji: "🎉", title: "Milestone!", subtitle: `${milestone} days!` };

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      {/* Notification Card - subtle */}
      <div className="animate-in fade-in duration-300 pointer-events-auto relative z-10 mx-4">
        <div
          className="rounded-2xl p-6 border shadow-lg"
          style={{
            background: "var(--muse-surface)",
            borderColor: "var(--muse-border)",
            boxShadow: "0 20px 60px rgba(var(--muse-accent-rgb),0.06)",
          }}
        >
          <div className="text-4xl mb-3" style={{ color: "var(--muse-text)" }}>
            {milestoneText.emoji}
          </div>
          <h2 className="text-xl font-bold mb-1 text-[var(--muse-text)]">
            {milestoneText.title}
          </h2>
          <p className="text-[var(--muse-muted)] font-serif italic">
            {milestoneText.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
