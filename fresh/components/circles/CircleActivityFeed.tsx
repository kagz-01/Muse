import * as Icons from "lucide-preact";
import { CircleActivityEvent } from "../../signals/circle-membership.ts";

interface CircleActivityFeedProps {
  activities: CircleActivityEvent[];
  isLoading?: boolean;
}

export default function CircleActivityFeed({
  activities,
  isLoading,
}: CircleActivityFeedProps) {
  const getActivityIcon = (type: CircleActivityEvent["type"]) => {
    switch (type) {
      case "new_member":
        return <Icons.UserPlus size={16} />;
      case "new_thought":
        return <Icons.Lightbulb size={16} />;
      case "collaboration":
        return <Icons.Zap size={16} />;
      case "milestone":
        return <Icons.Trophy size={16} />;
      case "member_left":
        return <Icons.UserMinus size={16} />;
      default:
        return <Icons.Activity size={16} />;
    }
  };

  const getActivityColor = (type: CircleActivityEvent["type"]) => {
    switch (type) {
      case "new_member":
        return "text-green-500";
      case "new_thought":
        return "text-blue-500";
      case "collaboration":
        return "text-purple-500";
      case "milestone":
        return "text-yellow-500";
      case "member_left":
        return "text-red-500";
      default:
        return "text-[var(--muse-text-muted)]";
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 bg-[var(--muse-surface-soft)] rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Icons.History
          size={40}
          className="mx-auto mb-3 text-[var(--muse-text-muted)] opacity-30"
        />
        <p className="text-[var(--muse-text-muted)]">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="p-4 bg-[var(--muse-surface-soft)] hover:bg-[var(--muse-surface-bright)] rounded-lg transition-colors flex gap-4"
        >
          {/* Icon */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--muse-surface-bright)] flex items-center justify-center ${
              getActivityColor(activity.type)
            }`}
          >
            {getActivityIcon(activity.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1">
              <p className="font-medium text-[var(--muse-text)]">
                {activity.title}
              </p>
              <span className="text-xs text-[var(--muse-text-muted)] flex-shrink-0 whitespace-nowrap">
                {getTimeAgo(activity.timestamp)}
              </span>
            </div>

            {/* Actor */}
            <div className="flex items-center gap-2 text-sm text-[var(--muse-text-muted)]">
              <img
                src={activity.actorAvatar}
                alt={activity.actor}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span>{activity.actor}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
