import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import {
  AlertTriangle,
  Aperture,
  ArrowLeft,
  Book,
  Calendar,
  Check,
  ChevronDown,
  Hash,
  Link2,
  Lock,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-preact";
import {
  deleteJournalEntry,
  type JournalEntry as _JournalEntry,
  type JournalMood,
  journalSignal,
  toggleFavoriteJournal,
  updateJournalEntry,
} from "../../signals/journal.ts";
import { itemsSignal } from "../../signals/items.ts";
import { roomsSignal } from "../../signals/rooms.ts";
import { moodConfig } from "./JournalGallery.tsx";
import {
  getAIInsights,
  mintReward,
  storeJournalOnBlockchain,
} from "../../utils/api.ts";
import { userSignal } from "../../signals/user.ts";

const moods = Object.entries(moodConfig) as [
  JournalMood,
  typeof moodConfig[JournalMood],
][];

const PROMPTS_BY_MOOD: Record<JournalMood, string[]> = {
  reflective: [
    "What have you been replaying in your mind lately?",
    "What truth are you slowly coming to accept?",
  ],
  grounded: [
    "Describe the physical space you're in right now, in detail.",
    "What feels stable right now, and why?",
  ],
  anxious: [
    "Name the thing you're avoiding thinking about.",
    "Write down every fear, no matter how irrational.",
  ],
  grateful: [
    "Who helped you recently that you haven't thanked?",
    "What ordinary thing are you most glad exists?",
  ],
  melancholic: [
    "What are you mourning that no one knows about?",
    "Write a letter to a past version of yourself.",
  ],
  charged: [
    "What idea is consuming you right now?",
    "Where is this energy trying to take you?",
  ],
  empty: [
    "Write one sentence. Any sentence.",
    "Describe the last thing you noticed that made you feel anything.",
  ],
  alive: [
    "What made today feel worth it?",
    "Write about the last moment you felt completely present.",
  ],
  inspired: [
    "Where did this inspiration come from?",
    "If you acted on this idea right now, what's the first step?",
  ],
  nostalgic: [
    "What memory keeps coming back?",
    "What from the past still shapes who you are today?",
  ],
  focused: [
    "What is the one thing that matters most today?",
    "What would you do if distraction was impossible?",
  ],
  tender: [
    "Who are you feeling soft towards right now?",
    "What are you being gentle with in yourself?",
  ],
  custom: ["What's on your mind?", "Start anywhere."],
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type FontSize = "standard" | "large" | "huge";
const fontSizes: Record<FontSize, { label: string; class: string }> = {
  standard: { label: "A", class: "text-xl md:text-[22px]" },
  large: { label: "AA", class: "text-2xl md:text-[28px]" },
  huge: { label: "AAA", class: "text-3xl md:text-[36px]" },
};

export default function JournalEntryView({ entryId }: { entryId: string }) {
  const entry = journalSignal.value.find((e) => e.id === entryId);
  const allItems = itemsSignal.value;
  const rooms = roomsSignal.value;

  const [body, setBody] = useState(entry?.body ?? "");
  const [mood, setMood] = useState<JournalMood>(entry?.mood ?? "reflective");
  const [customMoodText, setCustomMoodText] = useState(entry?.customMood ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(entry?.tags ?? []);
  const [linkedItemIds, setLinkedItemIds] = useState<string[]>(
    entry?.linkedItemIds ?? [],
  );
  const [fontSize, setFontSize] = useState<FontSize>("standard");
  const [saved, setSaved] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showLinkArtifacts, setShowLinkArtifacts] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(
    entry?.updatedAt ?? null,
  );
  const [showPrompt, setShowPrompt] = useState(!entry?.body);
  const [promptIdx, setPromptIdx] = useState(0);

  // Web3 & AI Integration States
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiInsights, setAiInsights] = useState<
    { summary?: string; status?: string } | null
  >(null);
  const [blockchainResult, setBlockchainResult] = useState<
    { solana_transaction_id: string; arweave_hash: string } | null
  >(null);

  const handleSecureAndAnalyze = async () => {
    if (!body.trim()) return;
    setIsProcessing(true);

    const user = userSignal.value;
    const wallet = user?.walletAddress;

    try {
      // 1. Get AI Insights
      const aiData = await getAIInsights(body);
      setAiInsights(aiData);

      // 2. Store on Blockchain if wallet is connected
      if (wallet) {
        const bcData = await storeJournalOnBlockchain(user.id, body, wallet);
        setBlockchainResult(bcData);

        // 3. Reward user for journaling
        await mintReward(wallet, "journal_entry");
      }
    } catch (error) {
      console.error("Processing Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!entry?.body) textareaRef.current?.focus();
  }, []);

  const save = useCallback(() => {
    if (!entry) return;
    updateJournalEntry(entry.id, {
      body,
      mood,
      customMood: mood === "custom" ? customMoodText : undefined,
      tags,
      linkedItemIds,
    });
    setSaved(true);
    setLastSavedTime(Date.now());
  }, [entry, body, mood, customMoodText, tags, linkedItemIds]);

  useEffect(() => {
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, 1500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [body, mood, customMoodText, tags, linkedItemIds, save]);

  if (!entry) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
        <p className="text-2xl font-bold text-white tracking-tight">
          Entry not found.
        </p>
        <a
          href="/journal"
          className="text-gray-400 hover:text-white text-sm underline"
        >
          Back to Journal
        </a>
      </div>
    );
  }

  const cfg = moodConfig[mood] || moodConfig["reflective"];
  const prompts = PROMPTS_BY_MOOD[mood] || PROMPTS_BY_MOOD["reflective"];
  const currentPrompt = prompts[promptIdx % prompts.length];
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const charCount = body.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleAddTag = (e: KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (newTag && !tags.includes(newTag)) {
        setTags((prev) => [...prev, newTag]);
      }
      setTagInput("");
    }
  };

  const toggleLinkedItem = (itemId: string) => {
    setLinkedItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((i) => i !== itemId)
        : [...prev, itemId]
    );
  };

  const getRoomName = (roomId: string) =>
    rooms.find((r) => r.id === roomId)?.name ?? "Unknown Room";

  const handleDelete = () => {
    deleteJournalEntry(entry.id);
    globalThis.location.href = "/journal";
  };

  const linkedItems = allItems.filter((i) => linkedItemIds.includes(i.id));
  const unlinkable = allItems.filter((i) => !linkedItemIds.includes(i.id));

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] relative">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.1] transition-colors duration-1000"
        style={{
          background:
            `radial-gradient(ellipse at top, ${cfg.color}50, transparent 60%)`,
        }}
      />

      <header className="sticky top-0 z-30 px-6 md:px-10 py-5 flex items-center justify-between border-b border-white/5 backdrop-blur-2xl bg-[#0a0a0a]/80 shadow-2xl">
        <div className="flex items-center gap-6">
          <a
            href="/journal"
            className="w-11 h-11 rounded-2xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all shadow-lg"
          >
            <ArrowLeft size={20} />
          </a>

          <div className="relative">
            <button
              onClick={() => setShowMoodPicker(!showMoodPicker)}
              type="button"
              className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border text-[11px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer shadow-xl"
              style={{
                backgroundColor: cfg.color + "22",
                borderColor: cfg.color + "55",
                color: cfg.color,
              }}
            >
              <span className="text-lg leading-none">{cfg.emoji}</span>
              {mood === "custom" && customMoodText ? customMoodText : cfg.label}
              <ChevronDown size={14} className="opacity-50" />
            </button>

            {showMoodPicker && (
              <div className="absolute top-full left-0 mt-4 bg-[#151515] border border-white/10 rounded-[2.5rem] p-5 shadow-2xl z-40 w-80 animate-in fade-in slide-in-from-top-2 backdrop-blur-3xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 mb-5 px-1">
                  How are you feeling?
                </p>
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  {moods.filter(([m]) => m !== "custom").map(([m, c]) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMood(m as JournalMood);
                        setShowMoodPicker(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold cursor-pointer transition-all text-left ${
                        mood === m
                          ? "text-white"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                      style={mood === m
                        ? {
                          backgroundColor: c.color + "25",
                          borderColor: c.color + "40",
                          borderWidth: "1px",
                        }
                        : {}}
                    >
                      <span className="text-xl leading-none">{c.emoji}</span>
                      {" "}
                      {c.label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/5 pt-5">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.25em] mb-3 px-1">
                    Custom Mood
                  </p>
                  <input
                    value={customMoodText}
                    onInput={(e) =>
                      setCustomMoodText((e.target as HTMLInputElement).value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customMoodText.trim()) {
                        setMood("custom");
                        setShowMoodPicker(false);
                      }
                    }}
                    placeholder="Wistful, electric..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-700 text-xs focus:outline-none focus:border-white/30 transition-all shadow-inner"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-2xl p-1.5">
            {(Object.entries(fontSizes) as [
              FontSize,
              typeof fontSizes[FontSize],
            ][]).map(([size, config]) => (
              <button
                key={size}
                type="button"
                onClick={() => setFontSize(size)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold transition-all cursor-pointer ${
                  fontSize === size
                    ? "bg-white text-black shadow-lg"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => toggleFavoriteJournal(entry.id)}
            type="button"
            className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              entry.isFavorited
                ? "border-amber-500/40 bg-amber-500/10 text-amber-500"
                : "border-white/10 text-gray-600 hover:text-white hover:bg-white/5"
            }`}
          >
            <Star
              size={20}
              fill={entry.isFavorited ? "currentColor" : "transparent"}
            />
          </button>

          <div className="w-px h-8 bg-white/10 mx-2" />

          <div className="flex items-center gap-5 font-bold text-[10px] uppercase tracking-[0.25em]">
            {saved
              ? (
                <span className="text-gray-600 flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {" "}
                  {lastSavedTime ? formatTime(lastSavedTime) : "Synced"}
                </span>
              )
              : (
                <span className="text-amber-500/80 flex items-center gap-2.5 italic">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {" "}
                  Syncing
                </span>
              )}
            <button
              onClick={() => setShowDelete(!showDelete)}
              type="button"
              className="w-11 h-11 rounded-2xl border border-white/10 flex items-center justify-center text-gray-600 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all cursor-pointer shadow-lg"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </header>

      {showDelete && (
        <div className="bg-rose-500/5 border-b border-rose-500/10 px-6 md:px-10 py-6 flex items-center justify-between relative z-20 animate-in slide-in-from-top-2 duration-300 backdrop-blur-md">
          <div className="flex items-center gap-4 text-[11px] font-bold text-rose-300 uppercase tracking-[0.25em]">
            <AlertTriangle size={20} className="text-rose-500" />{" "}
            Confirm permanent deletion.
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowDelete(false)}
              type="button"
              className="text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              type="button"
              className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold uppercase tracking-[0.3em] rounded-2xl shadow-[0_10px_30px_rgba(244,63,94,0.3)] transition-all cursor-pointer"
            >
              Purge Entry
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 md:px-16 py-16 relative z-10">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Calendar size={14} className="opacity-40" />
              <p
                className="text-[12px] font-bold uppercase tracking-[0.4em] text-white"
                style={{ color: cfg.color }}
              >
                {formatDate(entry.createdAt)}
              </p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white/90">
              Contemplation{" "}
              <span className="text-gray-700">#{entryId.slice(0, 4)}</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSecureAndAnalyze}
              disabled={isProcessing || !body.trim()}
              type="button"
              className={`flex items-center gap-3 group text-[11px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer shadow-xl px-6 py-3.5 rounded-2xl border border-white/10 ${
                isProcessing
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:text-white hover:bg-white/5 hover:border-white/20"
              }`}
            >
              <Aperture
                size={16}
                className={isProcessing
                  ? "animate-spin text-indigo-400"
                  : "group-hover:rotate-12 transition-transform text-indigo-400"}
              />
              {isProcessing ? "Analyzing Mind..." : "Secure & Analyze"}
            </button>
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              type="button"
              className="flex items-center gap-3 group text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-all cursor-pointer shadow-xl px-6 py-3.5 rounded-2xl border border-white/10 hover:bg-white/5"
            >
              <Book
                size={16}
                className="group-hover:rotate-12 transition-transform text-violet-400"
              />
              Prompt Engine
            </button>
          </div>
        </div>

        {(aiInsights || blockchainResult) && (
          <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            {aiInsights && (
              <div className="bg-[#111] border border-indigo-500/20 rounded-[2.5rem] p-8 card-glow glow-indigo relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Aperture size={48} className="text-indigo-400" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400 mb-5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  {" "}
                  AI Semantic Analysis
                </p>
                <p className="text-gray-300 font-serif italic text-lg leading-relaxed relative z-10">
                  "{aiInsights.summary || aiInsights.status ||
                    "Your neural patterns have been successfully mapped to the collective consciousness."}"
                </p>
              </div>
            )}
            {blockchainResult && (
              <div className="bg-[#111] border border-violet-500/20 rounded-[2.5rem] p-8 card-glow glow-violet relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Lock size={48} className="text-violet-400" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400 mb-5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  {" "}
                  Immutable Resonance
                </p>
                <div className="space-y-4 relative z-10">
                  <div className="flex flex-col gap-2">
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                      Transaction ID
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono bg-white/5 p-2 rounded-lg truncate">
                      {blockchainResult.solana_transaction_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em]">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    Proof of Thought Secured
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {showPrompt && (
          <div
            className="mb-10 flex items-start gap-5 bg-white/[0.03] border rounded-4xl p-7 animate-in fade-in slide-in-from-top-4 duration-500 backdrop-blur-sm"
            style={{ borderColor: cfg.color + "25" }}
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: cfg.color + "20" }}
            >
              <Aperture size={18} style={{ color: cfg.color }} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">
                Contemplation Seed
              </p>
              <h5 className="text-white font-serif italic text-[17px] leading-relaxed">
                "{currentPrompt}"
              </h5>
            </div>
            <button
              onClick={() => setPromptIdx((p) => p + 1)}
              type="button"
              className="px-4 py-2 rounded-full border border-white/10 text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={body}
          onInput={(e) => setBody((e.target as HTMLTextAreaElement).value)}
          placeholder="Start writing..."
          className={`flex-1 w-full min-h-[60vh] bg-transparent text-white/95 resize-none outline-none font-serif leading-[2.1] placeholder-gray-800 transition-all tracking-wide ${
            fontSizes[fontSize].class
          } custom-scrollbar`}
          style={{ caretColor: cfg.color }}
        />

        <div className="mt-16 pt-12 border-t border-white/5 space-y-12">
          <div>
            <div className="flex items-center justify-between mb-6">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2.5">
                <Link2 size={13} className="text-violet-400" />{" "}
                Inspiration Artifacts
              </label>
              <button
                onClick={() => setShowLinkArtifacts(!showLinkArtifacts)}
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <Plus size={11} /> Link From Rooms
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {linkedItems.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-3.5 hover:border-white/20 transition-all"
                >
                  <div className="w-2 h-2 rounded-full bg-gray-500 shrink-0" />
                  <div>
                    <p className="text-[13px] font-bold text-white max-w-[200px] truncate">
                      {item.title}
                    </p>
                    <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold mt-0.5">
                      {getRoomName(item.roomId)}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleLinkedItem(item.id)}
                    type="button"
                    className="text-gray-700 hover:text-rose-400 transition-colors ml-2 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {showLinkArtifacts && (
              <div className="mt-6 bg-[#111318] border border-white/10 rounded-4xl p-6 animate-in slide-in-from-bottom-4 duration-500 shadow-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-5">
                  Your Room Collective
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {unlinkable.length === 0
                    ? (
                      <p className="text-gray-600 text-xs italic p-2">
                        Everything is already connected.
                      </p>
                    )
                    : unlinkable.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleLinkedItem(item.id)}
                        className="group w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all text-left cursor-pointer"
                      >
                        <Plus
                          size={14}
                          className="text-gray-600 group-hover:text-white"
                        />
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors line-clamp-1">
                            {item.title}
                          </p>
                          <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">
                            {getRoomName(item.roomId)}
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-5 flex items-center gap-2.5">
                <Hash size={13} className="text-rose-400" /> Introspection Tags
              </label>
              <div className="flex flex-wrap gap-2.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-gray-400 hover:text-white transition-all"
                  >
                    #{tag}
                    <button
                      onClick={() =>
                        setTags((prev) => prev.filter((t) => t !== tag))}
                      type="button"
                      className="text-gray-600 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onInput={(e) =>
                    setTagInput((e.target as HTMLInputElement).value)}
                  onKeyDown={handleAddTag}
                  placeholder="New tag..."
                  className="bg-transparent text-[11px] font-bold text-gray-500 placeholder-gray-800 outline-none w-24 py-2"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold font-mono tracking-widest text-gray-700 pt-8 border-t border-white/5">
            <div className="flex gap-8">
              <span>W:{wordCount.toLocaleString()}</span>
              <span>C:{charCount.toLocaleString()}</span>
              <span>R:{readingTime}M</span>
            </div>
            <div
              className="flex items-center gap-2 uppercase tracking-widest"
              style={{ color: cfg.color }}
            >
              {mood === "custom" && customMoodText ? customMoodText : cfg.label}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
