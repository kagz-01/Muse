import { JournalEntry } from "../../signals/journal.ts";
import * as Icons from "lucide-preact";

interface CommunityCardProps {
  entry: JournalEntry;
  authorName?: string;
  authorAvatar?: string;
  trendScore?: number;
  onView?: () => void;
  onLike?: () => void;
  onShare?: () => void;
}

export function CommunityCard({
  entry,
  authorName = "Anonymous",
  authorAvatar,
  trendScore = 0,
  onView,
  onLike,
  onShare,
}: CommunityCardProps) {
  const isVaulted = entry.vault?.isVaulted;
  const isSynthesis = entry.type === "synthesis";
  const moodConfig: Record<string, { bg: string; text: string }> = {
    reflective: { bg: "from-indigo-600/40", text: "text-indigo-300" },
    grounded: { bg: "from-green-600/40", text: "text-green-300" },
    charged: { bg: "from-cyan-600/40", text: "text-cyan-300" },
    anxious: { bg: "from-red-600/40", text: "text-red-300" },
    custom: { bg: "from-white/20", text: "text-white/80" },
  };

  const moodStyle = moodConfig[entry.mood] || moodConfig.reflective;

  // Truncate preview
  let preview = entry.body;
  if (isVaulted) {
    preview = "[This entry is password protected]";
  } else if (preview.length > 150) {
    preview = preview.slice(0, 150) + "...";
  }

  return (
    <div
      class={`group rounded-2xl overflow-hidden p-6 flex flex-col h-full transition-all duration-300 cursor-pointer`}
      style={{
        background: "var(--muse-surface)",
        border: "1px solid var(--muse-border)",
      }}
      onClick={onView}
    >
      {/* Author Info */}
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
            {authorAvatar
              ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  class="w-full h-full rounded-full"
                />
              )
              : <Icons.User size={18} class="text-white" />}
          </div>
          <div>
            <p class="font-medium text-white">{authorName}</p>
            <p class="text-xs text-white/50">
              {new Date(entry.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {isSynthesis && (
          <div class="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Icons.Zap size={16} class="text-amber-400" />
          </div>
        )}
      </div>

      {/* Mood Badge */}
      <div class="mb-3">
        <span
          class={`px-3 py-1 rounded-full text-xs font-semibold ${moodStyle.text} bg-white/10`}
        >
          {entry.customMood || entry.mood}
        </span>
      </div>

      {/* Title */}
      <h3 class="font-semibold text-lg text-white mb-2 line-clamp-2">
        {entry.body.split("\n")[0].slice(0, 50)}
      </h3>

      {/* Preview */}
      <p class="text-sm text-white/70 line-clamp-3 mb-4 flex-1">
        {preview}
      </p>

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div class="flex flex-wrap gap-1 mb-4">
          {entry.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              class="px-2 py-1 rounded-full bg-white/5 text-xs text-white/60"
            >
              #{tag}
            </span>
          ))}
          {entry.tags.length > 3 && (
            <span class="px-2 py-1 text-xs text-white/60">
              +{entry.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Engagement Stats */}
      <div class="flex items-center justify-between py-4 border-t border-white/10 mb-4">
        <div class="flex gap-4 text-xs text-white/60">
          <div class="flex items-center gap-1">
            <Icons.Eye size={14} />
            <span>{entry.viewCount || 0}</span>
          </div>
          <div class="flex items-center gap-1">
            <Icons.Heart
              size={14}
              class={entry.isFavorited ? "fill-red-500 text-red-500" : ""}
            />
            <span>{entry.isFavorited ? "1" : "0"}</span>
          </div>
        </div>
        {trendScore > 0 && (
          <div class="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-300">
            🔥 Trending
          </div>
        )}
      </div>

      {/* Actions */}
      <div class="flex gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLike?.();
          }}
          class={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
            entry.isFavorited
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-white/10 text-white/60 hover:bg-white/20"
          }`}
        >
          <Icons.Heart
            size={14}
            class={entry.isFavorited ? "fill-current" : ""}
          />
          <span class="text-xs font-medium">Like</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare?.();
          }}
          type="button"
          class="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
        >
          <Icons.Share2 size={14} />
          <span class="text-xs font-medium">Share</span>
        </button>
        <button
          onClick={onView}
          type="button"
          class="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-canvas-primary/20 hover:bg-canvas-primary/30 text-canvas-primary hover:text-canvas-primary transition-all"
        >
          <Icons.ArrowRight size={14} />
          <span class="text-xs font-medium">Read</span>
        </button>
      </div>

      {/* Vault Badge Overlay */}
      {isVaulted && (
        <div class="absolute top-6 right-6 w-12 h-12 rounded-xl bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <Icons.Lock size={20} class="text-amber-400" />
        </div>
      )}
    </div>
  );
}

interface CommunityFeedProps {
  entries: JournalEntry[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  onViewEntry?: (entry: JournalEntry) => void;
}

export function CommunityFeed({
  entries,
  isLoading = false,
  onLoadMore,
  onViewEntry,
}: CommunityFeedProps) {
  return (
    <div class="space-y-6">
      {/* Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((entry) => (
          <CommunityCard
            key={entry.id}
            entry={entry}
            authorName={`User ${entry.id.slice(0, 4)}`}
            onView={() => onViewEntry?.(entry)}
            onLike={() => console.log("liked", entry.id)}
            onShare={() => console.log("shared", entry.id)}
          />
        ))}
      </div>

      {/* Load More */}
      {onLoadMore && entries.length > 0 && (
        <div class="flex justify-center pt-6">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoading}
            class="px-8 py-3 rounded-xl bg-canvas-primary/20 hover:bg-canvas-primary/30 text-canvas-primary font-semibold transition-all disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {/* Empty State */}
      {entries.length === 0 && !isLoading && (
        <div class="text-center py-12">
          <p class="text-white/60">No public entries yet</p>
        </div>
      )}
    </div>
  );
}
