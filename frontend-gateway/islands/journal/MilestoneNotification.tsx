import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";

interface MilestoneNotificationProps {
  milestone: number | null;
  onDismiss?: () => void;
}

export default function MilestoneNotification({ milestone, onDismiss }: MilestoneNotificationProps) {
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
    100: { emoji: "🌟", title: "Unstoppable!", subtitle: "100 days! You're legendary" },
    365: { emoji: "✨", title: "Phoenix Rising!", subtitle: "One year of journaling!" },
    1000: { emoji: "👑", title: "Immortal!", subtitle: "1000 days! You've transcended" },
  }[milestone] || { emoji: "🎉", title: "Milestone!", subtitle: `${milestone} days!` };

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      {/* Confetti effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 50}%`,
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          >
            <span className="text-2xl">{["🎉", "✨", "🎊", "⭐"][i % 4]}</span>
          </div>
        ))}
      </div>

      {/* Notification Card */}
      <div className="animate-in fade-in zoom-in-95 duration-300 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-10 shadow-2xl text-center max-w-md mx-4 pointer-events-auto relative z-10 border border-white/20">
        <div className="text-8xl mb-6 animate-bounce">{milestoneText.emoji}</div>
        <h2 className="text-3xl font-bold text-white mb-2">{milestoneText.title}</h2>
        <p className="text-white/90 font-serif italic">{milestoneText.subtitle}</p>
      </div>
    </div>
  );
}
