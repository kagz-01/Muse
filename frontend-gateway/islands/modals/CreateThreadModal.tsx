import { useEffect, useRef, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  addThread,
} from "../../signals/threads.ts";

const CORE_MOODS = [
  { id: "focus", label: "Focus", emoji: "🧠" },
  { id: "chaos", label: "Chaos", emoji: "🌪️" },
  { id: "minimal", label: "Minimal", emoji: "⬜" },
  { id: "cosmic", label: "Cosmic", emoji: "🌌" },
  { id: "noir", label: "Noir", emoji: "🕵️" },
];

interface Props {
  onClose: () => void;
}

const moodColors: Record<string, string> = {
  focus: "#6366f1", // indigo
  zen: "#10b981", // emerald
  chaos: "#f43f5e", // rose
  energetic: "#f59e0b", // amber
  melancholy: "#8b5cf6", // violet
  dreamy: "#0ea5e9", // sky
  noir: "#475569", // slate
  warm: "#fb923c", // orange
  electric: "#d946ef", // fuchsia
  minimal: "#9ca3af", // gray
  cosmic: "#8b5cf6", // violet
  storm: "#64748b", // slate
};

export default function CreateThreadModal({ onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thesis, setThesis] = useState("");
  const [mood, setMood] = useState("focus");
  const [format, setFormat] = useState("Essay");
  const [depth, setDepth] = useState("50");
  const [theme, setTheme] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState("");

  const titleRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    globalThis.addEventListener("keydown", handler);
    return () => globalThis.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleImagePick = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const selectedMoodOption = CORE_MOODS.find((m) => m.id === mood);
  const moodColor = selectedMoodOption ? moodColors[selectedMoodOption.id] : "#a855f7"; // default to purple-ish if custom

  const handleCreate = () => {
    if (!title.trim()) {
      setError("Give your thread a title.");
      return;
    }

    const newId = addThread({
      title: title.trim(),
      description: description.trim(),
      thesis: thesis.trim(),
      mood,
      format,
      depth,
      theme,
      coverImage: coverPreview,
      isPublic,
      itemIds: [],
      sourceRoomIds: [],
      isVault: !isPublic, // Links to global vault
    });

    onClose();
    globalThis.location.href = `/threads/${newId}`;
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-[#111318] border border-white/10 rounded-4xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Ambient glow */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: moodColor }}
        />

        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Start a Thread
              </h2>
              <p className="text-sm text-gray-400 mt-1 font-serif italic">
                Define the thematic idea you want to explore.
              </p>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <Icons.X size={18} />
            </button>
          </div>

          {/* Cover */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Cover Image
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative w-full h-32 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/25 transition-all cursor-pointer overflow-hidden group"
            >
              {coverPreview
                ? (
                  <img
                    src={coverPreview}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt=""
                  />
                )
                : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 group-hover:text-gray-300 transition-colors">
                    <Icons.ImagePlus size={22} />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Upload Cover
                    </span>
                  </div>
                )}
              {coverPreview && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">
                    Change Image
                  </span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImagePick}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Thread Title *
            </label>
            <input
              ref={titleRef}
              value={title}
              onInput={(e) => {
                setTitle((e.target as HTMLInputElement).value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
              placeholder="e.g. The Aesthetic of Restraint"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-base font-medium tracking-tight"
            />
            {error && (
              <p className="text-rose-400 text-xs mt-2 font-medium">{error}</p>
            )}
          </div>

          {/* Thesis */}
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Core Thesis
            </label>
            <textarea
              value={thesis}
              onInput={(e) =>
                setThesis((e.target as HTMLTextAreaElement).value)}
              placeholder="What core question or idea does this thread explore?"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-sm font-serif italic leading-relaxed resize-none"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Brief Description
            </label>
            <textarea
              value={description}
              onInput={(e) =>
                setDescription((e.target as HTMLTextAreaElement).value)}
              placeholder="A short summary of what you're gathering here…"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-sm leading-relaxed resize-none"
            />
          </div>

          {/* Format and Depth Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Synthesis Format
              </label>
              <div className="relative">
                <Icons.Type size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={format}
                  onInput={(e) => setFormat((e.target as HTMLInputElement).value)}
                  placeholder="e.g. Technical Spec, Poem"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white text-sm font-medium focus:outline-none focus:border-canvas-primary/50 transition-all"
                />
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {["Essay", "Manifesto", "Blueprint", "Debate"].map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded text-[10px] uppercase font-bold tracking-widest transition-colors"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex justify-between">
                <span>Cognitive Depth</span>
                <span className="text-canvas-primary">{depth}%</span>
              </label>
              <div className="pt-2 pb-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={depth}
                  onInput={(e) => setDepth((e.target as HTMLInputElement).value)}
                  className="w-full accent-canvas-primary bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-2">
                <span>Surface</span>
                <span>Deep</span>
                <span>Comprehensive</span>
              </div>
            </div>
          </div>
          
          {/* Theme */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Aesthetic Theme (Optional)
            </label>
            <div className="relative">
              <Icons.Palette size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={theme}
                onInput={(e) => setTheme((e.target as HTMLInputElement).value)}
                placeholder="e.g. Cyberpunk, Minimalist, Brutalist"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white text-sm focus:outline-none focus:border-canvas-primary/50 transition-all font-mono"
              />
            </div>
          </div>

          {/* Mood Visual Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                Generative Mood
              </label>
            </div>
            <div className="relative mb-4">
              <Icons.Sparkles size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-canvas-primary/60" />
              <input
                value={mood}
                onInput={(e) => setMood((e.target as HTMLInputElement).value)}
                placeholder="Type any mood..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white text-sm focus:outline-none focus:border-canvas-primary/50 transition-all"
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {CORE_MOODS.map((m) => {
                const isSelected = mood.toLowerCase() === m.id.toLowerCase();
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMood(m.id)}
                    className={`relative p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? "border-canvas-primary/40 bg-canvas-primary/10 shadow-lg"
                        : "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="text-lg filter drop-shadow-md">
                      {m.emoji}
                    </span>
                    <div className="text-center w-full">
                      <p className="text-gray-400 text-[9px] font-bold capitalize truncate">
                        {m.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="mb-8 p-1 bg-white/5 rounded-2xl flex gap-2">
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                !isPublic
                  ? "bg-white/10 text-white shadow-xl"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icons.Lock size={16} />
              <div className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-widest">
                  Private Vault
                </span>
                <span className="block text-[9px] text-gray-400 font-normal">
                  Uses Master Password
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isPublic
                  ? "bg-indigo-500/20 text-indigo-400 shadow-xl shadow-indigo-500/5"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icons.Globe size={16} />
              <div className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-widest">
                  Community Hub
                </span>
                <span className="block text-[9px] text-indigo-400/60 font-normal">
                  Visible to others
                </span>
              </div>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-4 rounded-2xl border border-white/10 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              type="button"
              className="flex-[2] py-4 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95 text-white"
              style={{
                backgroundColor: moodColor,
                boxShadow: `0 0 30px ${moodColor}55`,
              }}
            >
              Start Thread <Icons.ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
