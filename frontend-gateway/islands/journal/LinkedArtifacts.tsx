import { useState } from "preact/hooks";
import { LinkedArtifact } from "../../signals/journal.ts";
import { Link2, Trash2, BookOpen, GitCommit } from "lucide-preact";

interface LinkedArtifactsProps {
  artifacts: LinkedArtifact[];
  onRemove?: (artifactId: string) => void;
  onAdd?: () => void;
  isEditing?: boolean;
}

export function LinkedArtifacts({
  artifacts = [],
  onRemove,
  onAdd,
  isEditing = false,
}: LinkedArtifactsProps) {
  if (artifacts.length === 0 && !isEditing) {
    return null;
  }

  return (
    <div class="space-y-3">
      <div class="flex items-center gap-2 mb-4">
        <Link2 size={18} class="text-canvas-primary" />
        <h3 class="font-semibold text-white">Connected Artifacts</h3>
        <span class="text-xs text-white/60">{artifacts.length}</span>
      </div>

      {/* Artifacts List */}
      <div class="space-y-2">
        {artifacts.map((artifact) => (
          <div
            key={artifact.id}
            class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
          >
            <div class="flex items-center gap-3 flex-1">
              {artifact.type === "room" ? (
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} class="text-white" />
                </div>
              ) : (
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <GitCommit size={18} class="text-white" />
                </div>
              )}
              <div class="min-w-0">
                <p class="font-medium text-white truncate">{artifact.title}</p>
                <p class="text-xs text-white/50">
                  {artifact.type === "room" ? "Room" : "Thread"}
                </p>
              </div>
            </div>

            {isEditing && onRemove && (
              <button
                onClick={() => onRemove(artifact.id)}
                class="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg transition-all"
                title="Remove link"
              >
                <Trash2 size={16} class="text-red-400" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Button */}
      {isEditing && onAdd && (
        <button
          onClick={onAdd}
          class="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-canvas-primary/20 to-transparent hover:from-canvas-primary/30 border border-canvas-primary/30 hover:border-canvas-primary/50 text-canvas-primary font-medium transition-all flex items-center justify-center gap-2"
        >
          <Link2 size={16} />
          Link Artifact
        </button>
      )}
    </div>
  );
}

interface ArtifactSelectorProps {
  rooms: Array<{ id: string; title: string }>;
  threads: Array<{ id: string; title: string }>;
  onSelect: (artifact: LinkedArtifact) => void;
  onClose: () => void;
}

export function ArtifactSelector({
  rooms,
  threads,
  onSelect,
  onClose,
}: ArtifactSelectorProps) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"rooms" | "threads">("rooms");

  const filtered =
    tab === "rooms"
      ? rooms.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()))
      : threads.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white/10 rounded-3xl border border-white/20 p-6 w-full max-w-md backdrop-blur-xl">
        {/* Header */}
        <div class="flex items-center gap-2 mb-6">
          <Link2 size={20} class="text-canvas-primary" />
          <h2 class="text-xl font-bold text-white">Link Artifact</h2>
        </div>

        {/* Tabs */}
        <div class="flex gap-2 mb-4">
          <button
            onClick={() => setTab("rooms")}
            class={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              tab === "rooms"
                ? "bg-canvas-primary text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            Rooms ({rooms.length})
          </button>
          <button
            onClick={() => setTab("threads")}
            class={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              tab === "threads"
                ? "bg-canvas-primary text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            Threads ({threads.length})
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
          placeholder="Search..."
          class="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-canvas-primary/50 focus:outline-none focus:ring-1 focus:ring-canvas-primary/30 transition-all mb-4"
        />

        {/* List */}
        <div class="max-h-64 overflow-y-auto space-y-2 mb-4">
          {filtered.length === 0 ? (
            <p class="text-center text-white/60 py-4">No {tab} found</p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelect({
                    id: item.id,
                    type: tab === "rooms" ? "room" : "thread",
                    title: item.title,
                    linkedAt: Date.now(),
                  });
                  onClose();
                }}
                class="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 text-white transition-all"
              >
                {item.title}
              </button>
            ))
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          class="w-full px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
