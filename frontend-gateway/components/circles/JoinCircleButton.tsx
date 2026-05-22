import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { joinCircle, leaveCircle } from "../../signals/circle-membership.ts";
import { addNotification } from "../../signals/notifications.ts";

interface JoinCircleButtonProps {
  circleId: string;
  circleName: string;
  isJoined: boolean;
  memberCount: number;
  onJoin?: () => void;
  onLeave?: () => void;
  variant?: "button" | "icon" | "compact";
  size?: "sm" | "md" | "lg";
}

export default function JoinCircleButton({
  circleId,
  circleName,
  isJoined,
  memberCount,
  onJoin,
  onLeave,
  variant = "button",
  size = "md",
}: JoinCircleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const currentUserId = "user-123";

  const handleJoin = async () => {
    setIsLoading(true);
    try {
      await joinCircle(currentUserId, circleId);
      addNotification(
        "circle_join",
        `Joined "${circleName}"`,
        `You are now part of this creative circle with ${memberCount + 1} members`
      );
      onJoin?.();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeave = async () => {
    setIsLoading(false);
    if (!confirm(`Leave "${circleName}"?`)) return;
    setIsLoading(true);
    try {
      await leaveCircle(currentUserId, circleId);
      onLeave?.();
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  const baseClasses =
    "inline-flex items-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  if (isJoined) {
    // Joined state - show leave option on hover
    if (variant === "icon") {
      return (
        <button
          onClick={handleLeave}
          disabled={isLoading}
          className={`${baseClasses} ${sizeClasses[size]} p-2 bg-[var(--muse-accent)]/20 text-[var(--muse-accent)] hover:bg-[var(--muse-accent)]/10 hover:text-red-500 group`}
          title={`Leave ${circleName}`}
        >
          {isLoading ? (
            <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : (
            <Icons.UserCheck size={size === "sm" ? 14 : size === "md" ? 16 : 18} />
          )}
        </button>
      );
    }

    if (variant === "compact") {
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--muse-accent)]">
            Joined
          </span>
          <button
            onClick={handleLeave}
            disabled={isLoading}
            className="text-xs text-red-500 hover:underline disabled:opacity-50"
          >
            {isLoading ? "..." : "Leave"}
          </button>
        </div>
      );
    }

    // Full button variant when joined
    return (
      <button
        onClick={handleLeave}
        disabled={isLoading}
        className={`${baseClasses} ${sizeClasses[size]} bg-[var(--muse-accent)]/20 text-[var(--muse-accent)] hover:bg-red-500/20 hover:text-red-500`}
      >
        {isLoading ? (
          <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          <Icons.UserCheck size={14} />
        )}
        <span>Leave Circle</span>
      </button>
    );
  }

  // Not joined state - show join option
  if (variant === "icon") {
    return (
      <button
        onClick={handleJoin}
        disabled={isLoading}
        className={`${baseClasses} ${sizeClasses[size]} p-2 bg-[var(--muse-surface-soft)] text-[var(--muse-text-muted)] hover:bg-[var(--muse-accent)]/20 hover:text-[var(--muse-accent)]`}
        title={`Join ${circleName}`}
      >
        {isLoading ? (
          <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          <Icons.UserPlus size={size === "sm" ? 14 : size === "md" ? 16 : 18} />
        )}
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleJoin}
        disabled={isLoading}
        className="text-xs font-semibold text-[var(--muse-accent)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "..." : "Join"}
      </button>
    );
  }

  // Full button variant when not joined
  return (
    <button
      onClick={handleJoin}
      disabled={isLoading}
      className={`${baseClasses} ${sizeClasses[size]} bg-[var(--muse-accent)] text-white hover:bg-[var(--muse-accent-bright)]`}
    >
      {isLoading ? (
        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
      ) : (
        <Icons.UserPlus size={14} />
      )}
      <span>Join Circle</span>
    </button>
  );
}
