import { useState } from "preact/hooks";
import { createSynthesisEntry, type JournalEntry, type SynthesisData } from "../../signals/journal.ts";
import { roomsSignal } from "../../signals/rooms.ts";
import { threadsSignal } from "../../signals/threads.ts";
import { Zap, Plus, X } from "lucide-preact";
import type { Room } from "../../signals/rooms.ts";
import type { Thread } from "../../signals/threads.ts";

interface SynthesisCreationFormProps {
  onClose: () => void;
  onSuccess?: (entry: JournalEntry) => void;
}

export function SynthesisCreationForm({ onClose, onSuccess }: SynthesisCreationFormProps) {
  const [body, setBody] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedThreads, setSelectedThreads] = useState<string[]>([]);
  const [insights, setInsights] = useState<string[]>(["", "", ""]);
  const [patterns, setPatterns] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);

  const rooms = roomsSignal.value;
  const threads = threadsSignal.value;

  const handleInsightChange = (index: number, value: string) => {
    const updated = [...insights];
    updated[index] = value;
    setInsights(updated);
  };

  const handlePatternChange = (index: number, value: string) => {
    const updated = [...patterns];
    updated[index] = value;
    setPatterns(updated);
  };

  const handleAddInsight = () => {
    setInsights([...insights, ""]);
  };

  const handleRemoveInsight = (index: number) => {
    setInsights(insights.filter((_, i) => i !== index));
  };

  const handleAddPattern = () => {
    setPatterns([...patterns, ""]);
  };

  const handleRemovePattern = (index: number) => {
    setPatterns(patterns.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!body.trim()) {
      alert("Please enter synthesis content");
      return;
    }

    setLoading(true);

    const synthesis: SynthesisData = {
      sourceRoomIds: selectedRooms,
      sourceThreadIds: selectedThreads,
      keyInsights: insights.filter(i => i.trim()),
      patterns: patterns.filter(p => p.trim()),
      nextActions: [],
      synthesizedAt: Date.now(),
    };

    const entry = createSynthesisEntry(body, synthesis, isPublic);
    setLoading(false);
    onSuccess?.(entry);
    onClose();
  };

  return (
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      <div class="bg-white/10 rounded-3xl border border-white/20 p-8 w-full max-w-2xl backdrop-blur-xl my-8">
        {/* Header */}
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Zap size={20} class="text-white" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-white">Create Synthesis</h2>
              <p class="text-sm text-white/60">Connect insights across rooms and threads</p>
            </div>
          </div>
          <button
            onClick={onClose}
            class="p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <X size={20} class="text-white" />
          </button>
        </div>

        {/* Form */}
        <div class="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Main Content */}
          <div>
            <label class="block text-sm font-semibold text-white mb-2">
              Synthesis Summary
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody((e.target as HTMLTextAreaElement).value)}
              placeholder="Write your synthesis - connect the dots across your work..."
              class="w-full h-32 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-canvas-primary/50 focus:outline-none focus:ring-1 focus:ring-canvas-primary/30 resize-none"
            />
          </div>

          {/* Sources */}
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-white mb-2">
                Source Rooms ({selectedRooms.length})
              </label>
              <div class="space-y-2 max-h-32 overflow-y-auto">
                {rooms.map((room: Room) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      if (selectedRooms.includes(room.id)) {
                        setSelectedRooms(selectedRooms.filter(id => id !== room.id));
                      } else {
                        setSelectedRooms([...selectedRooms, room.id]);
                      }
                    }}
                    class={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                      selectedRooms.includes(room.id)
                        ? "bg-canvas-primary/30 border border-canvas-primary/50 text-white"
                        : "bg-white/5 border border-white/10 text-white/60 hover:border-white/25"
                    }`}
                  >
                    {room.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-white mb-2">
                Source Threads ({selectedThreads.length})
              </label>
              <div class="space-y-2 max-h-32 overflow-y-auto">
                {threads.map((thread: Thread) => (
                  <button
                    key={thread.id}
                    onClick={() => {
                      if (selectedThreads.includes(thread.id)) {
                        setSelectedThreads(selectedThreads.filter(id => id !== thread.id));
                      } else {
                        setSelectedThreads([...selectedThreads, thread.id]);
                      }
                    }}
                    class={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                      selectedThreads.includes(thread.id)
                        ? "bg-canvas-primary/30 border border-canvas-primary/50 text-white"
                        : "bg-white/5 border border-white/10 text-white/60 hover:border-white/25"
                    }`}
                  >
                    {thread.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-semibold text-white">Key Insights</label>
              <button
                onClick={handleAddInsight}
                class="text-xs px-2 py-1 rounded bg-canvas-primary/20 hover:bg-canvas-primary/30 text-canvas-primary transition-all flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <div class="space-y-2">
              {insights.map((insight, i) => (
                <div key={i} class="flex gap-2">
                  <input
                    type="text"
                    value={insight}
                    onChange={(e) => handleInsightChange(i, (e.target as HTMLInputElement).value)}
                    placeholder={`Insight ${i + 1}...`}
                    class="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-canvas-primary/50 focus:outline-none focus:ring-1 focus:ring-canvas-primary/30 text-sm"
                  />
                  {insights.length > 1 && (
                    <button
                      onClick={() => handleRemoveInsight(i)}
                      class="px-2 py-2 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <X size={14} class="text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Patterns */}
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-semibold text-white">Patterns Detected</label>
              <button
                onClick={handleAddPattern}
                class="text-xs px-2 py-1 rounded bg-canvas-primary/20 hover:bg-canvas-primary/30 text-canvas-primary transition-all flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <div class="space-y-2">
              {patterns.map((pattern, i) => (
                <div key={i} class="flex gap-2">
                  <input
                    type="text"
                    value={pattern}
                    onChange={(e) => handlePatternChange(i, (e.target as HTMLInputElement).value)}
                    placeholder={`Pattern ${i + 1}...`}
                    class="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-canvas-primary/50 focus:outline-none focus:ring-1 focus:ring-canvas-primary/30 text-sm"
                  />
                  {patterns.length > 1 && (
                    <button
                      onClick={() => handleRemovePattern(i)}
                      class="px-2 py-2 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <X size={14} class="text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic((e.target as HTMLInputElement).checked)}
                class="w-4 h-4 rounded"
              />
              <span class="text-sm text-white">Make public</span>
            </label>
            <span class="text-xs text-white/50">
              {isPublic ? "Anyone can see this synthesis" : "Only you can see this"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div class="flex gap-3 pt-6 border-t border-white/10 mt-6">
          <button
            onClick={onClose}
            class="flex-1 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            class="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={loading || !body.trim()}
          >
            <Zap size={16} />
            {loading ? "Creating..." : "Create Synthesis"}
          </button>
        </div>
      </div>
    </div>
  );
}
