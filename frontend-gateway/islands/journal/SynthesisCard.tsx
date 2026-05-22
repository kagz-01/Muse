import { JournalEntry, SynthesisData } from "../../signals/journal.ts";
import { Zap, BookOpen, GitCommit, ArrowRight, ExternalLink } from "lucide-preact";

interface SynthesisCardProps {
  entry: JournalEntry;
  onView?: () => void;
  onShare?: () => void;
}

export function SynthesisCard({ entry, onView, onShare }: SynthesisCardProps) {
  const synthesis = entry.synthesis;

  if (!synthesis) {
    return null;
  }

  const roomCount = synthesis.sourceRoomIds.length;
  const threadCount = synthesis.sourceThreadIds.length;
  const insightCount = synthesis.keyInsights.length;

  return (
    <div
      class="group rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 hover:border-amber-500/40 p-6 flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 cursor-pointer"
      onClick={onView}
    >
      {/* Header */}
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Zap size={20} class="text-white" />
          </div>
          <div>
            <p class="font-semibold text-white">Synthesis</p>
            <p class="text-xs text-white/50">
              {new Date(entry.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div class="flex gap-1">
          {entry.isPublic && (
            <div class="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
              Public
            </div>
          )}
          {entry.vault?.isVaulted && (
            <div class="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
              Vaulted
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <p class="text-sm text-white/80 line-clamp-3 mb-4">
        {entry.body}
      </p>

      {/* Sources */}
      <div class="flex items-center gap-4 mb-4 text-xs text-white/60">
        {roomCount > 0 && (
          <div class="flex items-center gap-1">
            <BookOpen size={14} />
            <span>{roomCount} room{roomCount !== 1 ? "s" : ""}</span>
          </div>
        )}
        {threadCount > 0 && (
          <div class="flex items-center gap-1">
            <GitCommit size={14} />
            <span>{threadCount} thread{threadCount !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Insights Preview */}
      {insightCount > 0 && (
        <div class="space-y-2 mb-4 flex-1">
          <p class="text-xs font-semibold text-white/70">Key Insights</p>
          {synthesis.keyInsights.slice(0, 2).map((insight, i) => (
            <div key={i} class="flex gap-2 text-xs text-white/60">
              <span class="text-amber-400">•</span>
              <span class="line-clamp-1">{insight}</span>
            </div>
          ))}
          {insightCount > 2 && (
            <p class="text-xs text-amber-400/70">+{insightCount - 2} more insights</p>
          )}
        </div>
      )}

      {/* Patterns */}
      {synthesis.patterns.length > 0 && (
        <div class="space-y-2 mb-4">
          <p class="text-xs font-semibold text-white/70">Patterns Detected</p>
          <div class="flex flex-wrap gap-1">
            {synthesis.patterns.slice(0, 3).map((pattern, i) => (
              <span
                key={i}
                class="px-2 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs"
              >
                {pattern}
              </span>
            ))}
            {synthesis.patterns.length > 3 && (
              <span class="px-2 py-1 rounded-full bg-white/10 text-white/60 text-xs">
                +{synthesis.patterns.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div class="flex items-center justify-between pt-4 border-t border-white/10">
        <div class="flex items-center gap-2 text-xs text-white/60">
          <span>{entry.wordCount} words</span>
          <span>•</span>
          <span>{entry.viewCount || 0} views</span>
        </div>
        <div class="flex gap-2">
          {onShare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              class="p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <ExternalLink size={16} class="text-white/60 hover:text-white" />
            </button>
          )}
          <ArrowRight size={16} class="text-white/60 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}
