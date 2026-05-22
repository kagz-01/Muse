import { computed } from "@preact/signals";
import * as Icons from "lucide-preact";
import { ActivityEntry } from "../../signals/mirror.ts";

interface ActivityTimelineProps {
  activities: ActivityEntry[];
}

const getActivityIcon = (type: ActivityEntry["type"]) => {
  const iconProps = { size: 16, class: "text-[var(--muse-accent)]" };
  switch (type) {
    case "follow":
      return <Icons.UserPlus {...iconProps} />;
    case "like":
      return <Icons.Heart {...iconProps} />;
    case "comment":
      return <Icons.MessageCircle {...iconProps} />;
    case "join_circle":
      return <Icons.Users {...iconProps} />;
    case "collaborate":
      return <Icons.Zap {...iconProps} />;
    case "view":
      return <Icons.Eye {...iconProps} />;
    default:
      return <Icons.Activity {...iconProps} />;
  }
};

const getActivityText = (activity: ActivityEntry) => {
  const timeAgo = getTimeAgo(activity.timestamp);
  switch (activity.type) {
    case "follow":
      return `${activity.actor} started following you`;
    case "like":
      return `${activity.actor} liked "${activity.target}"`;
    case "comment":
      return `${activity.actor} commented on "${activity.target}"`;
    case "join_circle":
      return `${activity.actor} joined ${activity.target}`;
    case "collaborate":
      return `${activity.actor} collaborated with you on "${activity.target}"`;
    case "view":
      return `${activity.actor} viewed your content`;
    default:
      return `${activity.actor} took action on your content`;
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

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="space-y-4">
      {activities.map((activity, idx) => (
        <div
          key={activity.id}
          className="flex gap-4 p-4 bg-[var(--muse-surface-soft)] rounded-xl border border-[var(--muse-border-light)] hover:bg-[var(--muse-surface-bright)] transition-colors"
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--muse-border-light)]">
            <img
              src={activity.actorAvatar}
              alt={activity.actor}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-grow">
            <p className="text-sm text-[var(--muse-text)] mb-1">
              {getActivityText(activity)}
            </p>
            <p className="text-xs text-[var(--muse-text-muted)]">
              {getTimeAgo(activity.timestamp)}
            </p>
          </div>

          <div className="flex-shrink-0 p-2 bg-[var(--muse-surface-bright)] rounded-lg">
            {getActivityIcon(activity.type)}
          </div>
        </div>
      ))}

      {activities.length === 0 && (
        <div className="py-12 text-center">
          <Icons.Inbox size={40} className="mx-auto mb-3 text-[var(--muse-text-muted)] opacity-50" />
          <p className="text-[var(--muse-text-muted)]">
            No activity yet. Start engaging with the community!
          </p>
        </div>
      )}
    </div>
  );
}
