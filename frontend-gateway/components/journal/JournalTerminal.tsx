import { useMemo, useState } from "preact/hooks";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  GitCommit,
  Hash,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  Palette,
  Send,
  Sparkles,
  Type,
} from "lucide-preact";
import { roomsSignal } from "../../signals/rooms.ts";
import { threadsSignal } from "../../signals/threads.ts";
import { addJournalEntry, journalSignal } from "../../signals/journal.ts";
import { userSignal } from "../../signals/user.ts";

export default function JournalTerminal() {
  const rooms = roomsSignal.value;
  const threads = threadsSignal.value;
  const user = userSignal.value;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeSources, setActiveSources] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isStylistOpen, setIsStylistOpen] = useState(false);

  const toggleSource = (id: string) => {
    setActiveSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleCapture = () => {
    if (!content.trim()) return;
    setIsCapturing(true);

    // Simulate AI analysis and capture
    setTimeout(() => {
      addJournalEntry({
        title: title || "Untitled Contemplation",
        content,
        sourceIds: activeSources,
        isReflectionOnly: activeSources.length === 0,
        sentiment: "analytical",
      });
      setTitle("");
      setContent("");
      setActiveSources([]);
      setIsCapturing(false);
    }, 1500);
  };

  return (
    <div className="bg-[#111318] border border-white/10 rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-3xl">
      {/* REFLECTION AURA */}
      <div className="absolute inset-0 bg-linear-to-br from-canvas-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 space-y-10">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 flex items-center gap-3">
            <BookOpen size={14} className="text-canvas-primary" />{" "}
            Contemplation Terminal
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsStylistOpen(!isStylistOpen)}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all"
            >
              <Palette size={18} />
            </button>
            {isCapturing && (
              <div className="flex items-center gap-3">
                <Activity
                  size={14}
                  className="text-canvas-primary animate-pulse"
                />
                <span className="text-[9px] font-bold uppercase tracking-widest text-canvas-primary">
                  Syncing Cognition...
                </span>
              </div>
            )}
          </div>
        </div>

        {isStylistOpen && (
          <div className="p-6 bg-white/2 border border-white/5 rounded-[2rem] animate-in slide-in-from-top-4 duration-500">
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mb-6">
              Journal Stylist
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-2 group">
                <Type
                  size={18}
                  className="text-gray-500 group-hover:text-white transition-colors"
                />
                <span className="text-[8px] font-bold uppercase tracking-widest text-gray-600">
                  Typography
                </span>
              </button>
              <button className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-2 group">
                <ImageIcon
                  size={18}
                  className="text-gray-500 group-hover:text-white transition-colors"
                />
                <span className="text-[8px] font-bold uppercase tracking-widest text-gray-600">
                  Wallpaper
                </span>
              </button>
              <button className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-2 group">
                <Palette
                  size={18}
                  className="text-gray-500 group-hover:text-white transition-colors"
                />
                <span className="text-[8px] font-bold uppercase tracking-widest text-gray-600">
                  Spectrum
                </span>
              </button>
              <button className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-2 group">
                <Sparkles
                  size={18}
                  className="text-gray-500 group-hover:text-white transition-colors"
                />
                <span className="text-[8px] font-bold uppercase tracking-widest text-gray-600">
                  Aura Glow
                </span>
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <input
            value={title}
            onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
            placeholder="Thesis Title (Optional)"
            className="w-full bg-transparent border-b border-white/10 py-4 text-3xl font-bold text-white placeholder-gray-800 focus:outline-none focus:border-canvas-primary/40 transition-all outline-none"
          />
          <textarea
            value={content}
            onInput={(e) => setContent((e.target as HTMLTextAreaElement).value)}
            placeholder="Contemplate the patterns. What is emerging from your collection?"
            className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-10 text-xl text-white placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 focus:bg-white/[0.05] transition-all min-h-[300px] font-serif italic outline-none resize-none"
          />
        </div>

        <div className="space-y-6">
          <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
            Contextual Anchors
          </h4>
          <div className="flex flex-wrap gap-3">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => toggleSource(room.id)}
                className={`px-6 py-2.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeSources.includes(room.id)
                    ? "bg-canvas-primary text-white border-canvas-primary shadow-xl scale-105"
                    : "bg-white/5 border-white/5 text-gray-500 hover:text-white"
                }`}
              >
                <Hash size={12} className="inline mr-2" /> {room.name}
              </button>
            ))}
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => toggleSource(thread.id)}
                className={`px-6 py-2.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeSources.includes(thread.id)
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-xl scale-105"
                    : "bg-white/5 border-white/5 text-gray-500 hover:text-white"
                }`}
              >
                <GitCommit size={12} className="inline mr-2" /> {thread.title}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 pt-6 border-t border-white/5">
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-serif italic leading-relaxed">
              "Your reflection will be stored as a sovereign artifact, ready to
              be woven into the collective synthesis."
            </p>
          </div>
          <button
            onClick={handleCapture}
            disabled={!content.trim() || isCapturing}
            className="px-12 py-5 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-2xl shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-30"
          >
            <Send size={16} /> Capture Contemplation
          </button>
        </div>
      </div>
    </div>
  );
}
