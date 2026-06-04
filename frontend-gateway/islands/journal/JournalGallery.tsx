import { useMemo, useState, useEffect } from "preact/hooks";
import {
  addEntry,
  getJournalTitle,
  getMilestoneUnlocked,
  getStreakData,
  getTodayWordCount,
  type JournalEntry,
  type JournalMood,
  journalSignal,
  toggleFavoriteJournal,
  togglePinJournal,
  toggleArchiveJournal,
} from "../../signals/journal.ts";
import StreakCard from "./StreakCard.tsx";
import MilestoneNotification from "./MilestoneNotification.tsx";
import ActivityHeatmap from "./ActivityHeatmap.tsx";
import MoodDistribution from "./MoodDistribution.tsx";
import * as Icons from "lucide-preact";
import EmojiInput from "../../components/ui/EmojiInput.tsx";
import { ExportModal } from "./ExportModal.tsx";

export const moodConfig: Record<
  JournalMood,
  { label: string; color: string; emoji: string; hex: string }
> = {
  reflective: {
    label: "Reflective",
    color: "#8b5cf6",
    emoji: "🌙",
    hex: "#8b5cf6",
  },
  grounded: {
    label: "Grounded",
    color: "#10b981",
    emoji: "🌿",
    hex: "#10b981",
  },
  charged: { label: "Charged", color: "#06b6d4", emoji: "🌊", hex: "#06b6d4" },
  anxious: { label: "Anxious", color: "#f43f5e", emoji: "⚡", hex: "#f43f5e" },
  custom: { label: "Custom", color: "#6b7280", emoji: "✨", hex: "#6b7280" },
};

type MoodStat = {
  mood: string;
  label: string;
  emoji: string;
  color: string;
  count: number;
};
type HeatmapDay = { date: Date; count: number };

function timeFormat(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / 86400000);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function excerpt(body: string, chars = 160): string {
  const text = body.replace(/\n+/g, " ").trim();
  return text.length > chars ? text.slice(0, chars) + "…" : text;
}

export default function JournalGallery() {
  const entries: JournalEntry[] = journalSignal.value;
  const streakData = getStreakData();

  const [search, setSearch] = useState("");
  const [filterMood, setFilterMood] = useState<string>("all");
  const [filterVisibility, setFilterVisibility] = useState<
    "all" | "public" | "private"
  >("all");
  const [filterType, setFilterType] = useState<
    "all" | "reflections" | "synthesis"
  >("all");
  const [showFavorites, setShowFavorites] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [milestone, setMilestone] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const todayWords = getTodayWordCount();

  const moodStats = useMemo<MoodStat[]>(() => {
    const stats: Record<string, number> = {};
    entries.forEach((entry: JournalEntry) => {
      const m = entry.mood === "custom" && entry.customMood ? entry.customMood : entry.mood;
      stats[m] = (stats[m] || 0) + 1;
    });
    return Object.entries(stats)
      .map(([mood, count]) => {
        const isDefault = mood in moodConfig && mood !== "custom";
        const cfg = isDefault ? moodConfig[mood as JournalMood] : moodConfig["custom"];
        return {
          mood,
          label: isDefault ? cfg.label : mood,
          emoji: isDefault ? cfg.emoji : "✨",
          color: cfg.hex,
          count: count || 0,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [entries]);

  const heatmap = useMemo<HeatmapDay[]>(() => {
    const days = [...Array(31)].map((_, i): HeatmapDay => {
      const d = new Date();
      d.setDate(d.getDate() - (30 - i));
      const dateStr = d.toDateString();
      const count = entries
        .filter((entry: JournalEntry) =>
          new Date(entry.createdAt).toDateString() === dateStr
        )
        .reduce((sum: number, entry: JournalEntry) => sum + entry.wordCount, 0);
      return { date: d, count };
    });
    return days;
  }, [entries]);

  const uniqueCustomMoods = useMemo(() => {
    const custom = new Set<string>();
    entries.forEach((e) => {
      if (e.mood === "custom" && e.customMood) {
        custom.add(e.customMood);
      }
    });
    return Array.from(custom);
  }, [entries]);

  const filtered = useMemo<JournalEntry[]>(
    () =>
      entries.filter((entry: JournalEntry) => {
        const matchSearch = search === "" ||
          entry.body.toLowerCase().includes(search.toLowerCase()) ||
          getJournalTitle(entry).toLowerCase().includes(search.toLowerCase()) ||
          entry.tags.some((tag: string) =>
            tag.toLowerCase().includes(search.toLowerCase())
          );
        const matchMood = filterMood === "all" || entry.mood === filterMood || (entry.mood === "custom" && entry.customMood === filterMood);
        const matchFav = !showFavorites || entry.isFavorited;
        const matchVisibility = filterVisibility === "all" ||
          (filterVisibility === "public" && entry.isPublic) ||
          (filterVisibility === "private" && !entry.isPublic);
        const matchType = filterType === "all" ||
          (filterType === "synthesis" && entry.type === "synthesis") ||
          (filterType === "reflections" &&
            (!entry.type || entry.type === "reflection"));
        return matchSearch && matchMood && matchFav && matchVisibility &&
          matchType;
      }),
    [entries, search, filterMood, showFavorites, filterVisibility, filterType],
  );

  const handleNewEntry = () => {
    try {
      const entry = addEntry();
      globalThis.location.assign(`/journal/${entry.id}`);
    } catch (e: any) {
      alert("Error creating entry: " + e.message);
    }
  };

  // Check for milestone when streak changes
  useEffect(() => {
    const unlocked = getMilestoneUnlocked();
    if (unlocked) {
      setMilestone(unlocked);
    }
  }, [streakData.currentStreak]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center px-6 pb-12">
        <div className="w-20 h-20 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-8 shadow-[0_0_80px_rgba(139,92,246,0.1)]">
          <span className="text-violet-400 text-3xl">📖</span>
        </div>
        <h1 className="text-3xl font-bold mb-3 text-white">Your Journal</h1>
        <p className="text-gray-400 font-serif italic text-base max-w-md text-center leading-relaxed mb-8">
          A private space for raw thought, emotional tracking, and quiet
          reflection. Completely local. Completely yours.
        </p>
        <button
          onClick={handleNewEntry}
          type="button"
          className="flex items-center gap-3 px-10 py-5 bg-white text-black font-bold uppercase tracking-widest text-sm rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          Write First Entry <span className="inline-block">➜</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col pb-32 md:pb-10 space-y-12">
      <MilestoneNotification milestone={milestone} />

      {/* Hero Section */}
      <div className="w-full px-6 md:px-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#0d0d0d] p-6 md:p-10 shadow-xl">
          <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-violet-500/10 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400 mb-4" style={{ background: 'var(--muse-surface-soft)', borderColor: 'var(--muse-border)'}}>
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                Contemplation Layer
              </div>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight text-[var(--muse-text)] mb-4">
                Quiet Your
                <span className="inline-block italic font-serif text-violet-400 bg-gradient-to-r from-violet-400 to-rose-400 bg-clip-text text-transparent px-2">
                  Mental Noise.
                </span>
              </h1>
              <p className="max-w-2xl text-[var(--muse-muted)] text-sm leading-relaxed font-serif italic border-l-2 border-white/5 pl-4">
                Your Journal is the sanctuary for raw thought. This is where
                patterns from your collection are tested against your intuition
                before they become creation.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="px-4 py-3 rounded-xl border" style={{ background: 'var(--muse-surface)', borderColor: 'var(--muse-border)', boxShadow: '0 12px 40px rgba(var(--muse-accent-rgb),0.06)'}}>
                <p className="text-[var(--muse-text)] font-bold text-xl leading-none">
                  {streakData.currentStreak}
                </p>
                <p className="text-[9px] text-[var(--muse-muted)] uppercase tracking-widest mt-1.5">
                  Current Streak
                </p>
              </div>
              <div className="px-4 py-3 rounded-xl border" style={{ background: 'var(--muse-surface)', borderColor: 'var(--muse-border)', boxShadow: '0 12px 40px rgba(var(--muse-accent-rgb),0.06)'}}>
                <p className="text-[var(--muse-text)] font-bold text-xl leading-none">
                  {streakData.longestStreak}
                </p>
                <p className="text-[9px] text-[var(--muse-muted)] uppercase tracking-widest mt-1.5">
                  Best Streak
                </p>
              </div>
              <div className="px-4 py-3 rounded-xl border" style={{ background: 'var(--muse-surface)', borderColor: 'var(--muse-border)', boxShadow: '0 12px 40px rgba(var(--muse-accent-rgb),0.06)'}}>
                <p className="text-[var(--muse-text)] font-bold text-xl leading-none">
                  {todayWords}
                </p>
                <p className="text-[9px] text-[var(--muse-muted)] uppercase tracking-widest mt-1.5">
                  Words Today
                </p>
              </div>
              <div className="px-4 py-3 rounded-xl border" style={{ background: 'var(--muse-surface)', borderColor: 'var(--muse-border)', boxShadow: '0 12px 40px rgba(var(--muse-accent-rgb),0.06)'}}>
                <p className="text-[var(--muse-text)] font-bold text-xl leading-none">
                  {streakData.totalDays}
                </p>
                <p className="text-[9px] text-[var(--muse-muted)] uppercase tracking-widest mt-1.5">
                  Total Days
                </p>
              </div>
            </div>

            {/* Streak Card */}
            <div className="mt-8">
              <StreakCard streakData={streakData} />
            </div>

            {/* New Entry Button */}
            <button
              onClick={handleNewEntry}
              type="button"
              className="w-full md:w-auto inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--muse-text)] border border-[var(--muse-border)] transition-all hover:shadow-[0_12px_30px_rgba(var(--muse-accent-rgb),0.06)] active:scale-98 cursor-pointer bg-[var(--muse-surface-soft)]"
            >
              <Icons.Plus size={16} /> New Journal Entry
            </button>
          </div>
        </section>
      </div>

      {/* Visualizations Section */}
      <div className="px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {showHeatmap && <ActivityHeatmap data={heatmap} />}
        <MoodDistribution
          moodStats={moodStats}
          onMoodClick={(mood) => setFilterMood(mood)}
          activeMood={filterMood}
        />
      </div>

      {/* Search & Filters */}
      <div className="px-6 md:px-10 space-y-6">
        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-0 rounded-4xl bg-violet-600/10 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="relative flex items-center border border-white/10 group-focus-within:border-violet-500/40 bg-white/[0.03] group-focus-within:bg-white/5 rounded-4xl p-2 transition-all duration-500 overflow-hidden">
            <div className="absolute left-8 text-gray-500 group-focus-within:text-violet-400 transition-colors">
              <Icons.Search size={20} />
            </div>
            <EmojiInput
              value={search}
              onInput={setSearch}
              placeholder="Search raw thoughts, patterns, depths…"
              className="w-full bg-transparent pl-20 pr-10 py-6 text-white text-lg font-bold tracking-tight placeholder-gray-700 focus:outline-none"
            />
            <div className="absolute right-8 flex items-center gap-3">
              {search && (
                <button
                  onClick={() => setSearch("")}
                  type="button"
                  className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-600 text-xs font-bold font-mono">
                {filtered.length}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Visibility Filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterVisibility("all")}
              type="button"
              className={`px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                filterVisibility === "all"
                  ? "bg-canvas-primary/20 border-canvas-primary/50 text-canvas-primary"
                  : "bg-white/5 border-white/10 text-gray-500 hover:border-white/25"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterVisibility("public")}
              type="button"
              className={`px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all cursor-pointer flex items-center gap-2 ${
                filterVisibility === "public"
                  ? "bg-canvas-primary/20 border-canvas-primary/50 text-canvas-primary"
                  : "bg-white/5 border-white/10 text-gray-500 hover:border-white/25"
              }`}
            >
              <Icons.Globe size={12} /> Public
            </button>
            <button
              onClick={() => setFilterVisibility("private")}
              type="button"
              className={`px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all cursor-pointer flex items-center gap-2 ${
                filterVisibility === "private"
                  ? "bg-canvas-primary/20 border-canvas-primary/50 text-canvas-primary"
                  : "bg-white/5 border-white/10 text-gray-500 hover:border-white/25"
              }`}
            >
              <Icons.Lock size={12} /> Private
            </button>
          </div>

          <div className="w-px h-6 bg-white/5" />

          {/* Other Filters */}
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            type="button"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${
              showFavorites
                ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                : "bg-white/5 border-white/10 text-gray-500 hover:border-white/25"
            }`}
          >
            <Icons.Star size={12} /> Favorites
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            type="button"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${
              showHeatmap
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : "bg-white/5 border-white/10 text-gray-500 hover:border-white/25"
            }`}
          >
            <Icons.BarChart3 size={12} /> Heatmap
          </button>

          <button
            onClick={() => {
              if (isSyncing) return;
              setIsSyncing(true);
              setTimeout(() => setIsSyncing(false), 2000);
            }}
            type="button"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${
              isSyncing
                ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                : "bg-white/5 border-white/10 text-gray-500 hover:border-white/25"
            }`}
          >
            <Icons.RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} /> 
            {isSyncing ? "Syncing..." : "Data Sync"}
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest border bg-white/5 border-white/10 text-gray-500 hover:border-white/25 transition-all cursor-pointer"
          >
            <Icons.Download size={12} /> Export
          </button>

          <div className="w-px h-6 bg-white/5" />

          {/* Entry Type Filter */}
          <button
            onClick={() =>
              setFilterType(
                filterType === "reflections" ? "all" : "reflections",
              )}
            type="button"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${
              filterType === "reflections"
                ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                : "bg-white/5 border-white/10 text-gray-500 hover:border-white/25"
            }`}
          >
            <Icons.BookOpen size={12} /> Reflections
          </button>

          <button
            onClick={() =>
              setFilterType(filterType === "synthesis" ? "all" : "synthesis")}
            type="button"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${
              filterType === "synthesis"
                ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                : "bg-white/5 border-white/10 text-gray-500 hover:border-white/25"
            }`}
          >
            <Icons.Zap size={12} /> Synthesis
          </button>
        </div>
      </div>

      {/* Mood Filter Pills */}
      <div className="px-6 md:px-10 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setFilterMood("all")}
          type="button"
          className={`px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${
            filterMood === "all"
              ? "bg-canvas-primary/12 border-canvas-primary/40 text-canvas-primary"
              : "bg-[var(--muse-surface)] border-[var(--muse-border)] text-[var(--muse-muted)] hover:border-white/20"
          }`}
        >
          All Moods
        </button>
        {(Object.entries(moodConfig) as [
          JournalMood,
          typeof moodConfig[JournalMood],
        ][])
          .filter(([m]) => m !== "custom")
          .map(([mood, cfg]) => (
            <button
              key={mood}
              onClick={() => setFilterMood(filterMood === mood ? "all" : mood)}
              type="button"
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                filterMood === mood
                  ? "border-opacity-100 text-opacity-100"
                  : "opacity-80 hover:opacity-100"
              }`}
              style={filterMood === mood
                ? {
                  backgroundColor: cfg.hex + "18",
                  borderColor: cfg.hex + "44",
                  color: cfg.hex,
                }
                : undefined}
            >
              <span>{cfg.emoji}</span>
              {cfg.label}
            </button>
          ))}
          {uniqueCustomMoods.map((customMood) => (
            <button
              key={customMood}
              onClick={() => setFilterMood(filterMood === customMood ? "all" : customMood)}
              type="button"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                filterMood === customMood
                  ? "border-opacity-100 text-opacity-100 bg-[#6b7280]/20 border-[#6b7280] text-[#6b7280]"
                  : "opacity-60 hover:opacity-100 bg-white/5 border-white/10 text-gray-500 hover:border-white/25"
              }`}
            >
              <span>✨</span>
              {customMood}
            </button>
          ))}
      </div>

      {/* Entry Gallery */}
      <main className="px-6 md:px-10 pb-20 w-full max-w-none">
        {filtered.length === 0
          ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <Icons.Lightbulb size={48} className="text-gray-600 mb-6" />
              <p className="text-gray-400 text-lg font-serif mb-2">
                Nothing resonates here.
              </p>
              <p className="text-gray-500 text-sm">
                Try adjusting your filters or write a new entry.
              </p>
            </div>
          )
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((entry: JournalEntry) => {
                const isCustom = entry.mood === "custom" && entry.customMood;
                const cfg = moodConfig[entry.mood as JournalMood] || moodConfig["reflective"];
                const emoji = isCustom ? "✨" : cfg.emoji;
                const label = isCustom ? entry.customMood : cfg.label;
                const title = getJournalTitle(entry);
                return (
                  <div
                    key={entry.id}
                    onClick={() => globalThis.location.href = `/journal/${entry.id}`}
                    className="group relative bg-gradient-to-br border rounded-[2.5rem] p-8 cursor-pointer transition-all duration-300 overflow-hidden shadow-xl hover:shadow-2xl hover:scale-105 h-full flex flex-col"
                    style={{
                      backgroundColor: cfg.hex + "15",
                      borderColor: cfg.hex + "44",
                      backgroundImage:
                        `linear-gradient(135deg, ${cfg.hex}22 0%, ${cfg.hex}11 100%)`,
                    }}
                  >
                    {/* Animated Background */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"
                      style={{
                        background:
                          `radial-gradient(circle at 30% 30%, ${cfg.hex}33)`,
                      }}
                    />

                    <div className="relative z-10 flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl animate-pulse">
                            {emoji}
                          </span>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                              {label}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                              {entry.isPublic ? "👁️ Public" : "🔒 Private"}
                            </p>
                            <p className="text-[9px] font-mono text-gray-500">
                              {timeFormat(entry.updatedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 z-20">
                          {entry.vault?.isVaulted && (
                            <div className="px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
                              <Icons.Lock
                                size={12}
                                className="text-amber-400"
                                title="Password protected"
                              />
                            </div>
                          )}
                          {entry.type === "synthesis" && (
                            <div className="px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
                              <Icons.Zap
                                size={12}
                                className="text-orange-400"
                                title="Synthesis entry"
                              />
                            </div>
                          )}
                          
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleFavoriteJournal(entry.id); }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                              entry.isFavorited ? "bg-amber-500/10 text-amber-500" : "text-gray-500 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            <Icons.Star size={14} fill={entry.isFavorited ? "currentColor" : "transparent"} />
                          </button>
                          
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); togglePinJournal(entry.id); }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                              entry.isPinned ? "bg-blue-500/10 text-blue-500" : "text-gray-500 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            <Icons.Pin size={14} fill={entry.isPinned ? "currentColor" : "transparent"} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleArchiveJournal(entry.id); }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                              entry.isArchived ? "bg-gray-500/20 text-gray-400" : "text-gray-500 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            <Icons.Archive size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-white font-bold text-xl leading-tight tracking-tight mb-3 line-clamp-2">
                        {title || (
                          <span className="opacity-40 italic">Empty depth</span>
                        )}
                      </h3>

                      <p className="text-gray-300 text-sm font-serif italic leading-relaxed mb-auto line-clamp-3 opacity-80">
                        {excerpt(entry.body, 150)}
                      </p>

                      {/* Footer */}
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                            {entry.wordCount} words
                          </span>
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
                            <span
                              className="text-[10px] font-bold"
                              style={{ color: cfg.hex }}
                            >
                              {cfg.label}
                            </span>
                          </div>
                        </div>
                        {entry.linkedItemIds.length > 0 && (
                          <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest opacity-60">
                            <Icons.Link size={12} />
                            {entry.linkedItemIds.length} artifacts
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </main>
      {showExportModal && (
        <ExportModal
          entries={entries}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
