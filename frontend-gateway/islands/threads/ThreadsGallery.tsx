import { useEffect, useMemo, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  deleteThread,
  type Thread,
  type ThreadMood,
  threadsSignal,
  toggleArchiveThread,
  toggleFavoriteThread,
  togglePinThread,
} from "../../signals/threads.ts";

import BlueprintReview from "../../components/threads/BlueprintReview.tsx";
import EmojiInput from "../../components/ui/EmojiInput.tsx";
import VaultGateModal from "../modals/VaultGateModal.tsx";
import CreateThreadModal from "../modals/CreateThreadModal.tsx";
import ThreadGenerationIndicator from "../../components/threads/ThreadGenerationIndicator.tsx";
import { isVaultUnlockedSignal } from "../../signals/vault.ts";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal.tsx";

type ThreadFilter = "all" | ThreadMood;

const CORE_MOODS: { id: string; label: string }[] = [
  { id: "focus", label: "Focus" },
  { id: "chaos", label: "Chaos" },
  { id: "minimal", label: "Minimal" },
  { id: "cosmic", label: "Cosmic" },
  { id: "noir", label: "Noir" },
];

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

export default function ThreadsGallery() {
  const threads = threadsSignal.value;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMoodFilter, setActiveMoodFilter] = useState<string>("all");
  const [customMoodInput, setCustomMoodInput] = useState("");
  const [filterVisibility, setFilterVisibility] = useState<
    "all" | "public" | "private"
  >("all");
  const [vaultModalThread, setVaultModalThread] = useState<Thread | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isGeneratingThreads, _setIsGeneratingThreads] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedThreadCount, _setGeneratedThreadCount] = useState(0);
  const [zoomingThreadId, setZoomingThreadId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const filteredThreads = useMemo(() => {
    return threads.filter((t: Thread) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMood = activeMoodFilter === "all" ||
        t.mood === activeMoodFilter;

      const matchesVisibility = filterVisibility === "all" ||
        (filterVisibility === "public" && t.isPublic) ||
        (filterVisibility === "private" && !t.isPublic);

      return matchesSearch && matchesMood && matchesVisibility;
    });
  }, [threads, searchQuery, activeMoodFilter, filterVisibility]);

  const stats = useMemo(
    () => ({
      activeSyntheses: threads.length,
      connectedRooms:
        new Set(threads.flatMap((t: Thread) => t.sourceRoomIds)).size,
      totalSignals: threads.reduce(
        (sum: number, t: Thread) => sum + t.itemIds.length,
        0,
      ),
    }),
    [threads],
  );

  if (!isHydrated) {
    return (
      <div className="pb-32 md:pb-28 min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-32 md:pb-28 min-h-screen bg-[#0a0a0a]">
      <div className="w-full max-w-none px-6 md:px-10 space-y-12">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/[0.02] p-10 md:p-16 shadow-2xl">
          <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-canvas-primary/15 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:36px_36px]" />

          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl flex-1">
              <div className="inline-flex items-center rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-canvas-primary mb-6">
                <span className="inline-block w-2 h-2 rounded-full bg-canvas-primary animate-pulse mr-2" />
                Synthesis Layer
              </div>
              <h1 className="max-w-4xl text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] text-white mb-6">
                Thread Engine
              </h1>
              <p className="max-w-3xl text-lg md:text-xl leading-relaxed font-serif italic text-gray-400 border-l-2 border-white/10 pl-8">
                Where diverse signals from your rooms converge into living
                documents of Collective Synthesis.
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              type="button"
              className="group relative w-full lg:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-10 py-6 text-[13px] font-bold uppercase tracking-[0.2em] text-black shadow-[0_20px_50px_rgba(255,255,255,0.15)] transition-all hover:-translate-y-2 hover:shadow-[0_50px_100px_rgba(255,255,255,0.25)] active:scale-95 overflow-hidden h-fit flex-shrink-0"
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
              <div className="absolute inset-0 rounded-2xl ring-2 ring-offset-2 ring-offset-[#0a0a0a] ring-white opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300 -z-10" />
              <Icons.Plus size={18} />
              New Synthesis
            </button>
          </div>

          {/* STATS & QUICK ACTIONS */}
          <div className="relative z-10 mt-12 grid gap-6 grid-cols-1 lg:grid-cols-4">
            <div className="lg:col-span-3 grid gap-4 grid-cols-3">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-canvas-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Syntheses
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white tabular-nums tracking-tighter">
                  {stats.activeSyntheses}
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-canvas-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3 flex items-center gap-2">
                  <Icons.FolderOpen size={12} className="text-gray-400" />
                  Connected Rooms
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white tabular-nums tracking-tighter">
                  {stats.connectedRooms}
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-canvas-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3 flex items-center gap-2">
                  <Icons.Activity size={12} className="text-gray-400" />
                  Total Signals
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white tabular-nums tracking-tighter">
                  {stats.totalSignals}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  if (isAnalyzing) return;
                  setIsAnalyzing(true);
                  // Simulate an analysis scan for 2 seconds
                  setTimeout(() => {
                    setIsAnalyzing(false);
                  }, 2000);
                }}
                className={`w-full h-full rounded-2xl border border-canvas-primary/30 transition-all flex flex-col items-center justify-center gap-3 p-6 group ${
                  isAnalyzing
                    ? "bg-canvas-primary/20 text-canvas-primary/70"
                    : "bg-white/5 hover:bg-canvas-primary/10 text-gray-400 hover:text-white"
                }`}
              >
                <Icons.RefreshCw
                  size={24}
                  className={isAnalyzing
                    ? "animate-spin"
                    : "group-hover:rotate-180 transition-transform duration-700"}
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-center">
                  {isAnalyzing ? "Analyzing..." : (
                    <>
                      Trigger Real-time<br />Analysis
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* SEARCH */}
        <div className="relative">
          <EmojiInput
            value={searchQuery}
            onInput={setSearchQuery}
            placeholder="Search threads, patterns, or themes..."
            iconLeft={<Icons.Search className="text-gray-700" size={20} />}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-6 text-lg text-white placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 focus:bg-white/[0.05] transition-all font-serif italic"
          />
        </div>

        {/* BLUEPRINTS SECTION */}
        <section>
          <BlueprintReview />
        </section>

        {/* FILTERS */}
        <section className="space-y-4">
          <div className="rounded-[2rem] bg-white/[0.02] border border-white/10 p-5 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                Generative Mood Filter
              </h3>
              <div className="relative w-full md:w-64">
                <EmojiInput
                  value={customMoodInput}
                  onInput={(val) => {
                    setCustomMoodInput(val);
                    if (val.trim()) setActiveMoodFilter(val.toLowerCase());
                    else setActiveMoodFilter("all");
                  }}
                  placeholder="Custom mood..."
                  iconLeft={
                    <Icons.Sparkles
                      className="text-canvas-primary/60"
                      size={14}
                    />
                  }
                  className="w-full bg-white/[0.05] border border-white/10 rounded-full py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-canvas-primary/50 transition-all font-mono"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveMoodFilter("all");
                  setCustomMoodInput("");
                }}
                className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeMoodFilter === "all"
                    ? "border-canvas-primary/40 bg-canvas-primary/15 text-canvas-primary"
                    : "border-white/10 bg-white/[0.03] text-gray-500 hover:border-white/20 hover:text-white"
                }`}
              >
                All
              </button>
              {CORE_MOODS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setActiveMoodFilter(option.id);
                    setCustomMoodInput("");
                  }}
                  className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    activeMoodFilter === option.id
                      ? "border-canvas-primary/40 bg-canvas-primary/15 text-canvas-primary"
                      : "border-white/10 bg-white/[0.03] text-gray-500 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/[0.02] border border-white/10 p-5 md:p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Visibility</h3>
            </div>
            <div className="flex gap-2">
              {[
                { id: "all", label: "All" },
                { id: "public", label: "Public" },
                { id: "private", label: "Private" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() =>
                    setFilterVisibility(filter.id as typeof filterVisibility)}
                  className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    filterVisibility === filter.id
                      ? "border-canvas-primary/40 bg-canvas-primary/15 text-canvas-primary"
                      : "border-white/10 bg-white/[0.03] text-gray-500 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* THREADS GRID */}
        <section className="space-y-4">
          <div className="rounded-[2rem] bg-white/[0.02] border border-white/10 p-5 md:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                  <Icons.GitCommit size={24} className="text-gray-700" />
                  Active Patterns
                </h2>
                <p className="mt-1 text-sm font-serif italic text-gray-400">
                  {filteredThreads.length}{" "}
                  {filteredThreads.length === 1 ? "thread" : "threads"}{" "}
                  matching your filters
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                <Icons.ArrowRight size={12} className="text-canvas-primary" />
                {filteredThreads.length} results
              </div>
            </div>

            {isGeneratingThreads ||
              generatedThreadCount > 0 && (
                  <div className="mt-6">
                    <ThreadGenerationIndicator
                      isGenerating={isGeneratingThreads}
                      progress={isGeneratingThreads ? 45 : 0}
                      threadCount={generatedThreadCount}
                    />
                  </div>
                )}

            {filteredThreads.length === 0
              ? (
                <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center mt-6">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white">
                    <Icons.Lightbulb size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    No threads match your filters
                  </h3>
                  <p className="mt-2 max-w-md text-sm font-serif italic leading-relaxed text-gray-400">
                    Try adjusting your mood filter or search query to discover
                    more patterns.
                  </p>
                </div>
              )
              : (
                <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-2 -mx-2 snap-x snap-mandatory custom-scrollbar scroll-smooth mt-6">
                  {filteredThreads.map((thread: Thread) => {
                    const coreMood = CORE_MOODS.find((m) =>
                      m.id === thread.mood
                    );
                    const moodLabel = coreMood?.label || thread.mood;
                    const hex = moodColors[thread.mood] || moodColors.focus;

                    return (
                      <div
                        key={thread.id}
                        onClick={() => {
                          if (thread.isVault && !isVaultUnlockedSignal.value) {
                            setVaultModalThread(thread);
                          } else {
                            setZoomingThreadId(thread.id);
                            setTimeout(() => {
                              globalThis.location.href =
                                `/threads/${thread.id}`;
                            }, 300);
                          }
                        }}
                        className={`group relative shrink-0 snap-start min-w-[85vw] md:min-w-[280px] lg:min-w-[320px] max-w-[350px] flex flex-col overflow-hidden rounded-[2.5rem] border border-white/5 text-white transition-all duration-300 cursor-pointer hover:border-white/20 h-[380px] ${
                          zoomingThreadId === thread.id
                            ? "scale-[0.95] opacity-0 z-[100]"
                            : ""
                        }`}
                        style={{ boxShadow: `0 20px 60px ${hex}33` }}
                      >
                        {/* Background with mood gradient */}
                        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                          {thread.coverImage
                            ? (
                              <img
                                src={thread.coverImage}
                                className="h-full w-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                                alt=""
                              />
                            )
                            : (
                              <div
                                className="h-full w-full opacity-30"
                                style={{
                                  background:
                                    `linear-gradient(135deg, ${hex}22, transparent)`,
                                }}
                              />
                            )}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80" />

                          {/* Vault Lock Overlay */}
                          {thread.isVault && !isVaultUnlockedSignal.value && (
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/80 flex items-center justify-center z-20 group-hover:from-black/40 group-hover:to-black/90 transition-colors">
                              <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center border-2 border-indigo-400/40 group-hover:border-indigo-400/60 transition-colors">
                                  <Icons.Lock
                                    size={32}
                                    className="text-indigo-400"
                                  />
                                </div>
                                <p className="text-center text-sm font-semibold text-white">
                                  Click to Unlock
                                </p>
                                <p className="text-xs text-gray-400">
                                  Private Vault
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div
                          className={`relative z-10 flex flex-col h-full justify-between p-6 md:p-7 ${
                            thread.isVault && !isVaultUnlockedSignal.value
                              ? "opacity-40 blur-sm"
                              : ""
                          }`}
                        >
                          {/* Top section with visibility and mood badges */}
                          <div className="flex items-start justify-between gap-2 mb-4">
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block w-2 h-2 rounded-full animate-pulse"
                                style={{ backgroundColor: hex }}
                              />
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                {thread.isPublic ? "Public" : "Private"}
                              </span>
                            </div>
                            {thread.isPublic
                              ? (
                                <Icons.Globe
                                  size={14}
                                  className="text-white/30"
                                />
                              )
                              : (
                                <Icons.Lock
                                  size={14}
                                  className="text-white/30"
                                />
                              )}

                            <div className="flex items-center gap-1 z-20">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavoriteThread(thread.id);
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                  thread.isFavorited
                                    ? "bg-amber-500/10 text-amber-500"
                                    : "text-gray-500 hover:text-white hover:bg-white/10"
                                }`}
                              >
                                <Icons.Star
                                  size={14}
                                  fill={thread.isFavorited
                                    ? "currentColor"
                                    : "transparent"}
                                />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePinThread(thread.id);
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                  thread.isPinned
                                    ? "bg-blue-500/10 text-blue-500"
                                    : "text-gray-500 hover:text-white hover:bg-white/10"
                                }`}
                              >
                                <Icons.Pin
                                  size={14}
                                  fill={thread.isPinned
                                    ? "currentColor"
                                    : "transparent"}
                                />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleArchiveThread(thread.id);
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                  thread.isArchived
                                    ? "bg-gray-500/20 text-gray-400"
                                    : "text-gray-500 hover:text-white hover:bg-white/10"
                                }`}
                              >
                                <Icons.Archive size={14} />
                              </button>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPendingDeleteId(thread.id);
                                }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                                title="Delete thread"
                              >
                                <Icons.Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Title and description */}
                          <div className="flex-1 mb-6">
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-canvas-primary transition-colors line-clamp-3">
                              {thread.title}
                            </h3>
                            <p className="text-gray-300 font-serif italic leading-relaxed line-clamp-2 text-sm">
                              "{thread.description}"
                            </p>
                          </div>

                          {/* Mood and signal badges */}
                          <div className="flex items-center justify-between mb-6 pb-6 border-t border-white/10 gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div
                                className="px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-[0.15em] flex items-center gap-1.5"
                                style={{
                                  backgroundColor: hex + "22",
                                  border: `1px solid ${hex}44`,
                                  color: hex,
                                }}
                              >
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: hex }}
                                />
                                {moodLabel}
                              </div>
                              {thread.format && (
                                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-bold uppercase tracking-[0.15em] text-gray-400">
                                  {thread.format}
                                </div>
                              )}
                              <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[8px] font-bold uppercase tracking-[0.15em] text-white">
                                {thread.itemIds.length} Signals
                              </div>
                            </div>
                          </div>

                          {/* Room avatars and action */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-gray-500">
                                Rooms
                              </span>
                              <div className="flex -space-x-2">
                                {thread.sourceRoomIds.slice(0, 3).map((
                                  roomId: string,
                                ) => (
                                  <div
                                    key={roomId}
                                    className="w-5 h-5 rounded-full bg-white/15 border border-black/40 flex items-center justify-center text-[6px] font-bold uppercase text-white"
                                    title={roomId}
                                  >
                                    {roomId.slice(0, 1).toUpperCase()}
                                  </div>
                                ))}
                                {thread.sourceRoomIds.length > 3 && (
                                  <div className="w-5 h-5 rounded-full bg-canvas-primary/20 border border-canvas-primary/40 flex items-center justify-center text-[6px] font-bold uppercase text-canvas-primary">
                                    +{thread.sourceRoomIds.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                            <a
                              href={`/threads/${thread.id}`}
                              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 group-hover:bg-canvas-primary group-hover:text-black group-hover:border-canvas-primary transition-all duration-300"
                            >
                              <Icons.ExternalLink size={12} />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </section>
      </div>

      {/* Vault Gate Modal */}
      {vaultModalThread && (
        <VaultGateModal
          onUnlock={() => {
            setVaultModalThread(null);
          }}
          onClose={() => setVaultModalThread(null)}
        />
      )}

      {/* Create Thread Modal */}
      {showCreateModal && (
        <CreateThreadModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Immersive Zoom Overlay */}
      {zoomingThreadId && (
        <div className="fixed inset-0 z-[90] bg-black pointer-events-none animate-in fade-in duration-500" />
      )}

      <ConfirmDeleteModal
        isOpen={pendingDeleteId !== null}
        title="Delete Thread?"
        description="This synthesis and all its dialogue layers will be permanently erased. This action cannot be undone."
        onConfirm={() => {
          if (pendingDeleteId) deleteThread(pendingDeleteId);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
