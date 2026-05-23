import { useMemo, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  type Thread,
  type ThreadMood,
  threadsSignal,
} from "../../signals/threads.ts";
import BlueprintReview from "../../components/threads/BlueprintReview.tsx";
import ThreadVaultUnlockModal from "../modals/VaultUnlockModal.tsx";
import CreateThreadModal from "../modals/CreateThreadModal.tsx";
import ThreadGenerationIndicator from "../../components/threads/ThreadGenerationIndicator.tsx";

type ThreadFilter =
  | "all"
  | "contemplative"
  | "curious"
  | "dark"
  | "hopeful"
  | "urgent"
  | "serene";

const moodMapping: Record<ThreadMood, {
  color: string;
  bg: string;
  text: string;
}> = {
  contemplative: {
    color: "indigo",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
  },
  curious: { color: "cyan", bg: "bg-cyan-500/10", text: "text-cyan-400" },
  dark: { color: "slate", bg: "bg-slate-500/10", text: "text-slate-400" },
  hopeful: {
    color: "emerald",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
  },
  urgent: { color: "rose", bg: "bg-rose-500/10", text: "text-rose-400" },
  serene: { color: "amber", bg: "bg-amber-500/10", text: "text-amber-400" },
};

const moodFilterOptions: {
  id: ThreadFilter;
  label: string;
  mood?: ThreadMood;
}[] = [
  { id: "all", label: "All Moods" },
  { id: "contemplative", label: "Contemplative", mood: "contemplative" },
  { id: "curious", label: "Curious", mood: "curious" },
  { id: "dark", label: "Dark", mood: "dark" },
  { id: "hopeful", label: "Hopeful", mood: "hopeful" },
  { id: "urgent", label: "Urgent", mood: "urgent" },
  { id: "serene", label: "Serene", mood: "serene" },
];

export default function ThreadsGallery() {
  const threads = threadsSignal.value;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMoodFilter, setActiveMoodFilter] = useState<ThreadFilter>("all");
  const [filterVisibility, setFilterVisibility] = useState<
    "all" | "public" | "private"
  >("all");
  const [vaultModalThread, setVaultModalThread] = useState<Thread | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isGeneratingThreads, setIsGeneratingThreads] = useState(false);
  const [generatedThreadCount, setGeneratedThreadCount] = useState(0);

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
                documents of collective intelligence.
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

          {/* STATS */}
          <div className="relative z-10 mt-12 grid gap-4 grid-cols-3 md:grid-cols-3 lg:grid-cols-3">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">
                Active Syntheses
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white">
                {stats.activeSyntheses}
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">
                Connected Rooms
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white">
                {stats.connectedRooms}
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">
                Total Signals
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white">
                {stats.totalSignals}
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH */}
        <div className="relative">
          <Icons.Search
            className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700"
            size={20}
          />
          <input
            type="text"
            placeholder="Search threads, patterns, or themes..."
            value={searchQuery}
            onInput={(e) =>
              setSearchQuery((e.target as HTMLInputElement).value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-16 py-6 text-lg text-white placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 focus:bg-white/[0.05] transition-all font-serif italic"
          />
        </div>

        {/* BLUEPRINTS SECTION */}
        <section>
          <BlueprintReview />
        </section>

        {/* FILTERS */}
        <section className="space-y-4">
          <div className="rounded-[2rem] bg-white/[0.02] border border-white/10 p-5 md:p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Mood Filters</h3>
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
                {moodFilterOptions.length} moods
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {moodFilterOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActiveMoodFilter(option.id)}
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
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6">
                  {filteredThreads.map((thread: Thread) => {
                    const mood = moodMapping[thread.mood as ThreadMood];
                    const baseHexMap: Record<string, string> = {
                      indigo: "#6366f1",
                      cyan: "#06b6d4",
                      slate: "#64748b",
                      emerald: "#10b981",
                      rose: "#fb7185",
                      amber: "#f59e0b",
                    };
                    const hex = baseHexMap[mood.color] || baseHexMap.indigo;

                    return (
                      <div
                        key={thread.id}
                        onClick={() => {
                          if (thread.isVault && !thread.isVaultUnlocked) {
                            setVaultModalThread(thread);
                          }
                        }}
                        className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-white/5 text-white transition-all duration-500 cursor-pointer hover:border-white/20 h-full"
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
                          {thread.isVault && !thread.isVaultUnlocked && (
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
                            thread.isVault && !thread.isVaultUnlocked
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
                                className="px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-[0.15em]"
                                style={{
                                  backgroundColor: hex + "22",
                                  border: `1px solid ${hex}44`,
                                  color: hex,
                                }}
                              >
                                {thread.mood}
                              </div>
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

      {/* Vault Unlock Modal */}
      {vaultModalThread && (
        <ThreadVaultUnlockModal
          threadId={vaultModalThread.id}
          threadTitle={vaultModalThread.title}
          onUnlock={() => setVaultModalThread(null)}
          onClose={() => setVaultModalThread(null)}
        />
      )}

      {/* Create Thread Modal */}
      {showCreateModal && (
        <CreateThreadModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
