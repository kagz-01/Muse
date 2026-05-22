import * as Icons from "lucide-preact";
import { CircleMember } from "../../signals/circle-membership.ts";

interface CircleMembersListProps {
  members: CircleMember[];
  isLoading?: boolean;
  onMemberClick?: (member: CircleMember) => void;
}

export default function CircleMembersList({
  members,
  isLoading,
  onMemberClick,
}: CircleMembersListProps) {
  const getRoleColor = (role: CircleMember["role"]) => {
    switch (role) {
      case "founder":
        return "bg-yellow-500/20 text-yellow-600";
      case "moderator":
        return "bg-blue-500/20 text-blue-600";
      case "member":
        return "bg-slate-500/20 text-slate-600";
    }
  };

  const getRoleIcon = (role: CircleMember["role"]) => {
    switch (role) {
      case "founder":
        return <Icons.Crown size={14} />;
      case "moderator":
        return <Icons.Shield size={14} />;
      case "member":
        return <Icons.User size={14} />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-3 bg-[var(--muse-surface-soft)] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <Icons.Users size={40} className="mx-auto mb-3 text-[var(--muse-text-muted)] opacity-30" />
        <p className="text-[var(--muse-text-muted)]">No members yet</p>
      </div>
    );
  }

  // Sort members: founder first, then moderators, then others
  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { founder: 0, moderator: 1, member: 2 };
    return roleOrder[a.role] - roleOrder[b.role];
  });

  return (
    <div className="space-y-2">
      {sortedMembers.map((member) => (
        <button
          key={member.userId}
          onClick={() => onMemberClick?.(member)}
          className="w-full text-left p-3 bg-[var(--muse-surface-soft)] hover:bg-[var(--muse-surface-bright)] rounded-lg transition-colors flex items-center gap-3"
        >
          {/* Avatar */}
          <img
            src={member.avatar}
            alt={member.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-[var(--muse-text)] truncate">
                {member.name}
              </h4>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${getRoleColor(member.role)}`}>
                {getRoleIcon(member.role)}
                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--muse-text-muted)]">
              <span>@{member.username}</span>
              <span>•</span>
              <span>Joined {formatDate(member.joinedAt)}</span>
            </div>
          </div>

          {/* Resonance Score */}
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center gap-1 text-xs font-semibold text-[var(--muse-accent)]">
              <Icons.Zap size={12} />
              <span>{member.resonanceScore}%</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
