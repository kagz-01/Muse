import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  checkFollowStatus,
  followersSignal,
  followUser,
  unfollowUser,
} from "../../signals/followers.ts";

interface Props {
  targetUserId: string;
  currentUserId: string;
  size?: "sm" | "md" | "lg";
  variant?: "button" | "icon" | "inline";
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({
  targetUserId,
  currentUserId,
  size = "md",
  variant = "button",
  onFollowChange,
}: Props) {
  const [isHovering, setIsHovering] = useState(false);
  const followers = followersSignal.value;
  const isFollowing = followers.isFollowing.get(targetUserId) ?? false;
  const isLoading = followers.isLoading;

  // Don't show follow button for own profile
  if (targetUserId === currentUserId) {
    return null;
  }

  useEffect(() => {
    checkFollowStatus(currentUserId, targetUserId);
  }, [targetUserId, currentUserId]);

  const handleFollowClick = async (e: Event) => {
    e.stopPropagation();
    if (isFollowing) {
      await unfollowUser(targetUserId);
      onFollowChange?.(false);
    } else {
      await followUser(targetUserId);
      onFollowChange?.(true);
    }
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-[9px] h-8",
    md: "px-5 py-2.5 text-[10px] h-10",
    lg: "px-6 py-3 text-[11px] h-12",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleFollowClick}
        disabled={isLoading}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
          isFollowing
            ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/30"
            : "bg-white/5 border border-white/10 text-gray-400 hover:bg-indigo-500 hover:border-indigo-500 hover:text-white"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        title={isFollowing ? "Unfollow" : "Follow"}
      >
        {isLoading
          ? <Icons.Loader2 size={iconSizes[size]} className="animate-spin" />
          : isFollowing
          ? <Icons.UserCheck size={iconSizes[size]} />
          : <Icons.UserPlus size={iconSizes[size]} />}
      </button>
    );
  }

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleFollowClick}
        disabled={isLoading}
        className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${
          isFollowing
            ? "text-indigo-400 hover:text-indigo-300"
            : "text-gray-500 hover:text-white"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {isLoading
          ? (
            <>
              <Icons.Loader2 size={12} className="animate-spin" />
              Processing
            </>
          )
          : isFollowing
          ? (
            <>
              <Icons.UserCheck size={12} />
              Following
            </>
          )
          : (
            <>
              <Icons.UserPlus size={12} />
              Follow
            </>
          )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleFollowClick}
      disabled={isLoading}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`${
        sizeClasses[size]
      } font-bold uppercase tracking-widest rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 ${
        isFollowing
          ? `bg-indigo-500/20 border-indigo-500/40 text-indigo-400 ${
            isHovering
              ? "bg-red-500/20 border-red-500/40 text-red-400"
              : "hover:bg-indigo-500/30"
          }`
          : "bg-white/5 border-white/10 text-gray-400 hover:bg-indigo-500 hover:border-indigo-500 hover:text-white"
      } ${
        isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer group"
      }`}
    >
      {isLoading
        ? (
          <>
            <Icons.Loader2 size={iconSizes[size]} className="animate-spin" />
            {size !== "sm" && "Processing"}
          </>
        )
        : isFollowing
        ? (
          <>
            {isHovering
              ? (
                <>
                  <Icons.UserX size={iconSizes[size]} />
                  {size !== "sm" && "Unfollow"}
                </>
              )
              : (
                <>
                  <Icons.UserCheck size={iconSizes[size]} />
                  {size !== "sm" && "Following"}
                </>
              )}
          </>
        )
        : (
          <>
            <Icons.UserPlus size={iconSizes[size]} />
            {size !== "sm" && "Follow"}
          </>
        )}
    </button>
  );
}
