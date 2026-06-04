import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  deleteJournalEntry,
  type JournalEntry as _JournalEntry,
  type JournalMood,
  journalSignal,
  toggleFavoriteJournal,
  togglePinJournal,
  toggleArchiveJournal,
  updateJournalEntry,
} from "../../signals/journal.ts";
import { itemsSignal } from "../../signals/items.ts";
import { roomsSignal } from "../../signals/rooms.ts";
import { moodConfig } from "./JournalGallery.tsx";
import {
  AIInsightsResponse,
  BlockchainStoreResponse,
  getAIInsights,
  mintReward,
  storeJournalOnBlockchain,
} from "../../utils/api.ts";
import { userSignal } from "../../signals/user.ts";
import EmojiInput from "../../components/ui/EmojiInput.tsx";

const moods = Object.entries(moodConfig) as [
  JournalMood,
  typeof moodConfig[JournalMood],
][];

const PROMPTS_BY_MOOD: Record<JournalMood, string[]> = {
  reflective: [
    "What have you been replaying in your mind lately?",
    "What truth are you slowly coming to accept?",
    "What pattern do you keep noticing in your life?",
  ],
  grounded: [
    "Describe the physical space you're in right now, in detail.",
    "What feels stable right now, and why?",
    "Name three things anchoring you today.",
  ],
  charged: [
    "What idea is consuming you right now?",
    "Where is this energy trying to take you?",
    "If you could act on one impulse right now, what would it be?",
  ],
  anxious: [
    "Name the thing you're avoiding thinking about.",
    "Write down every fear, no matter how irrational.",
    "What would you tell a friend feeling exactly this way?",
  ],
  custom: ["What's on your mind?", "Start anywhere.", "Write freely."],
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
  // Reactive entry lookup — re-reads signal on every render to handle SSR hydration
  const entries = journalSignal.value;
  const entry = useMemo(() => entries.find((e) => e.id === entryId), [entries, entryId]);
  const allItems = itemsSignal.value;
  const rooms = roomsSignal.value;

  const [isHydrated, setIsHydrated] = useState(false);
  const [body, setBody] = useState(entry?.body ?? "");
  const [mood, setMood] = useState<JournalMood>(entry?.mood ?? "reflective");
  const [customMoodText, setCustomMoodText] = useState(entry?.customMood ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(entry?.tags ?? []);
  const [linkedItemIds, setLinkedItemIds] = useState<string[]>(
    entry?.linkedItemIds ?? [],
  );
  const [isPublic, setIsPublic] = useState(entry?.isPublic ?? false);
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

  // Mark hydration complete so we can distinguish SSR "not found" from real "not found"
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Sync state from entry when it becomes available after hydration
  useEffect(() => {
    if (entry && !body && !isHydrated) return; // skip during SSR
    if (entry) {
      setBody((prev) => prev || entry.body);
      setMood(entry.mood);
      setCustomMoodText(entry.customMood ?? "");
      setTags(entry.tags);
      setLinkedItemIds(entry.linkedItemIds);
      setIsPublic(entry.isPublic);
      setLastSavedTime(entry.updatedAt);
    }
  }, [entry?.id]);

  // Web3 & AI Integration States
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsightsResponse | null>(
    null,
  );
  const [blockchainResult, setBlockchainResult] = useState<
    BlockchainStoreResponse | null
  >(null);

  const handleSecureAndAnalyze = async () => {
    if (!body.trim()) return;
    setIsProcessing(true);

    const user = userSignal.value;
    const wallet = user?.walletAddress;

    try {
      // 1. Get AI Insights
      const aiData = await getAIInsights(body, user.id);
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

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // if (!entry?.body) textareaRef.current?.focus();
  }, []);

  const save = useCallback(() => {
    if (!entry) return;
    updateJournalEntry(entry.id, {
      body,
      mood,
      customMood: mood === "custom" ? customMoodText : undefined,
      tags,
      linkedItemIds,
      isPublic,
    });
    setSaved(true);
    setLastSavedTime(Date.now());
  }, [entry, body, mood, customMoodText, tags, linkedItemIds, isPublic]);

  useEffect(() => {
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, 1500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [body, mood, customMoodText, tags, linkedItemIds, isPublic, save]);

  if (!entry) {
    // During SSR or before hydration, show a loading state instead of "not found"
    if (!isHydrated) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#0a0a0a]">
          <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
            Loading Entry...
          </p>
        </div>
      );
    }
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
            <Icons.ArrowLeft size={20} />
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
              <Icons.ChevronDown size={14} className="opacity-50" />
            </button>

            {showMoodPicker && (
              <div className="absolute top-full left-0 mt-4 bg-[#151515] border border-white/10 rounded-[2.5rem] p-5 shadow-2xl z-40 w-80 animate-in fade-in slide-in-from-top-2 backdrop-blur-3xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 mb-5 px-1">
                  How are you feeling?
                </p>
                <div className="flex gap-2.5 mb-5 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide">
                  {moods.filter(([m]) => m !== "custom").map(([m, c]) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMood(m as JournalMood);
                        setShowMoodPicker(false);
                      }}
                      className={`min-w-[140px] flex-shrink-0 snap-start flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold cursor-pointer transition-all text-left ${
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
                  
                  {/* Custom Mood Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setMood("custom");
                      setShowMoodPicker(false);
                    }}
                    className={`min-w-[140px] flex-shrink-0 snap-start flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold cursor-pointer transition-all text-left ${
                      mood === "custom"
                        ? "text-white bg-white/10 border border-white/20"
                        : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <span className="text-xl leading-none">✨</span>
                    Custom
                  </button>
                </div>
                <div className="border-t border-white/5 pt-5">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.25em] mb-3 px-1">
                    Custom Mood Details
                  </p>
                  <EmojiInput
                    value={customMoodText}
                    onInput={setCustomMoodText}
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
            <Icons.Star
              size={20}
              fill={entry.isFavorited ? "currentColor" : "transparent"}
            />
          </button>

          <button
            onClick={() => togglePinJournal(entry.id)}
            type="button"
            className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              entry.isPinned
                ? "border-blue-500/40 bg-blue-500/10 text-blue-500"
                : "border-white/10 text-gray-600 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icons.Pin
              size={20}
              fill={entry.isPinned ? "currentColor" : "transparent"}
            />
          </button>

          <button
            onClick={() => toggleArchiveJournal(entry.id)}
            type="button"
            className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              entry.isArchived
                ? "border-gray-500/40 bg-gray-500/10 text-gray-400"
                : "border-white/10 text-gray-600 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icons.Archive size={20} />
          </button>

          <button
            onClick={() => setIsPublic(!isPublic)}
            type="button"
            className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all cursor-pointer shadow-lg group relative ${
              isPublic
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                : "border-white/10 text-gray-600 hover:text-white hover:bg-white/5"
            }`}
          >
            {isPublic ? <Icons.Globe size={20} /> : <Icons.Lock size={20} />}
            
            {/* Tooltip */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              {isPublic ? "Published to Community" : "Private Entry"}
            </div>
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
              <Icons.Trash2 size={18} />
            </button>
          </div>
        </div>
      </header>

      {showDelete && (
        <div className="px-6 md:px-10 py-6 flex items-center justify-between relative z-20 animate-in slide-in-from-top-2 duration-300" style={{ background: 'var(--muse-surface)', borderBottom: '1px solid rgba(var(--muse-accent-rgb),0.06)'}}>
          <div className="flex items-center gap-4 text-[11px] font-bold text-[var(--muse-muted)] uppercase tracking-[0.25em]">
            <Icons.AlertTriangle size={20} className="text-rose-500" />{" "}
            Confirm permanent deletion.
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowDelete(false)}
              type="button"
              className="text-[11px] font-bold uppercase tracking-widest text-[var(--muse-muted)] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              type="button"
              className="px-6 py-2 border border-rose-500 text-rose-500 text-[11px] font-bold uppercase tracking-[0.3em] rounded-2xl transition-all cursor-pointer bg-white/3 hover:bg-rose-500/8"
            >
              Purge Entry
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col w-full max-w-none px-6 md:px-10 py-16 relative z-10">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Icons.Calendar size={14} className="opacity-40" />
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
              <Icons.Aperture
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
              <Icons.Book
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
              <div
                className="rounded-[2.5rem] p-6 relative overflow-hidden border"
                style={{ background: 'var(--muse-surface)', borderColor: 'var(--muse-border)', boxShadow: '0 20px 60px rgba(var(--muse-accent-rgb),0.06)'}}
              >
                <div className="absolute top-0 right-0 p-6 opacity-8">
                  <Icons.Aperture size={42} className="text-indigo-400" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  {" "}
                  AI Semantic Analysis
                </p>
                <p className="text-[var(--muse-muted)] font-serif italic text-base leading-relaxed relative z-10">
                  "{aiInsights.message || aiInsights.keywords?.join(", ") || aiInsights.status || "Your neural patterns have been analyzed."}"
                </p>
              </div>
            )}
            {blockchainResult && (
              <div
                className="rounded-[2.5rem] p-6 relative overflow-hidden border"
                style={{ background: 'var(--muse-surface)', borderColor: 'var(--muse-border)', boxShadow: '0 20px 60px rgba(var(--muse-accent-rgb),0.06)'}}
              >
                <div className="absolute top-0 right-0 p-6 opacity-8">
                  <Icons.Lock size={42} className="text-violet-400" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  {" "}
                  Immutable Resonance
                </p>
                <div className="space-y-4 relative z-10">
                  <div className="flex flex-col gap-2">
                    <p className="text-[9px] font-bold text-[var(--muse-muted)] uppercase tracking-widest">
                      Transaction ID
                    </p>
                    <p className="text-[10px] text-[var(--muse-muted)] font-mono bg-white/5 p-2 rounded-lg truncate">
                      {blockchainResult.solana_transaction_id || "Transaction unavailable"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em]">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Icons.Check size={14} strokeWidth={3} />
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
              <Icons.Aperture size={18} style={{ color: cfg.color }} />
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

        <EmojiInput
          value={body}
          onInput={setBody}
          placeholder="Start writing..."
          multiline
          className={`flex-1 w-full min-h-[60vh] bg-transparent text-white/95 resize-none outline-none font-serif leading-[2.1] placeholder-gray-800 transition-all tracking-wide ${
            fontSizes[fontSize].class
          } custom-scrollbar`}
          style={{ caretColor: cfg.color }}
        />

        <div className="mt-16 pt-12 border-t border-white/5 space-y-12">
          <div>
            <div className="flex items-center justify-between mb-6">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2.5">
                <Icons.Link2 size={13} className="text-violet-400" />{" "}
                Inspiration Artifacts
              </label>
              <button
                onClick={() => setShowLinkArtifacts(!showLinkArtifacts)}
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <Icons.Plus size={11} /> Link From Rooms
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
                    <Icons.X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {showLinkArtifacts && (
              <div className="mt-6 bg-[#111318] border border-white/10 rounded-4xl p-6 animate-in slide-in-from-bottom-4 duration-500 shadow-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-5">
                  Your Room Collective
                </p>
                <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
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
                        className="group min-w-[260px] flex-shrink-0 snap-start flex items-center gap-4 px-5 py-3.5 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all text-left cursor-pointer"
                      >
                        <Icons.Plus
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
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-5 flex items-center gap-2.5">
                <Icons.Hash size={13} className="text-rose-400" />{" "}
                Introspection Tags
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
                      <Icons.X size={12} />
                    </button>
                  </span>
                ))}
                <EmojiInput
                  value={tagInput}
                  onInput={setTagInput}
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
