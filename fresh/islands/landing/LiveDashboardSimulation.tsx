import { useEffect, useMemo, useState } from "preact/hooks";
import * as Icons from "lucide-preact";

type LoopScene = "rooms" | "artifacts" | "threads" | "journal" | "growth";
type ViewerMode = "guest" | "stranger" | "member";

type SceneDefinition = {
  id: LoopScene;
  title: string;
  subtitle: string;
  durationMs: number;
};

const SCENES: SceneDefinition[] = [
  {
    id: "rooms",
    title: "Create a room",
    subtitle: "Start a focused space for one intent.",
    durationMs: 4600,
  },
  {
    id: "artifacts",
    title: "Insert artifacts",
    subtitle: "URLs, notes, and docs are indexed into the room.",
    durationMs: 5000,
  },
  {
    id: "threads",
    title: "Synthesize threads",
    subtitle: "Related signals are grouped into emerging themes.",
    durationMs: 5000,
  },
  {
    id: "journal",
    title: "Contemplate in journal",
    subtitle: "Write reflection anchored to room and thread context.",
    durationMs: 5400,
  },
  {
    id: "growth",
    title: "Track momentum",
    subtitle: "Streak, mirror, profile, and community stay in sync.",
    durationMs: 4200,
  },
];

const JOURNAL_SAMPLE_ENTRIES = [
  "Thread: Attention Drift. Today I noticed each context switch costs more energy than I expected.",
  "Room recap: Creative Systems. The strongest artifacts all point to one pattern: constraints increase focus.",
  "I want tomorrow's session to begin with one hard task before any scrolling or inbox checks.",
];

const ARTIFACTS = [
  { kind: "URL", title: "Atomic Habits summary", source: "readwise.io" },
  { kind: "NOTE", title: "Voice memo transcription", source: "captured now" },
  { kind: "DOC", title: "Design review PDF", source: "drive upload" },
];

const THREADS = [
  { theme: "Attention Drift", linked: 2 },
  { theme: "Creative Rhythm", linked: 3 },
  { theme: "Constraint Leverage", linked: 2 },
];

const GROWTH_CARDS = [
  { label: "Streak", value: "+1 day", tone: "text-amber-300" },
  { label: "Mirror", value: "Resonance +4%", tone: "text-cyan-300" },
  { label: "Profile", value: "84% complete", tone: "text-fuchsia-300" },
  { label: "Community", value: "2 new overlaps", tone: "text-emerald-300" },
];

function getViewerHint(mode: ViewerMode): string {
  if (mode === "guest") {
    return "Guest preview active. Sign up to keep your rooms, threads, and streak.";
  }
  if (mode === "stranger") {
    return "Finish profile setup so we can personalize this loop around your identity.";
  }
  return "Your saved loop keeps learning from every room, thread, and reflection.";
}

function getViewerBadge(mode: ViewerMode): string {
  if (mode === "guest") return "Guest Session";
  if (mode === "stranger") return "Stranger Mode";
  return "Personal Loop";
}

function getGrowthCards(mode: ViewerMode) {
  if (mode === "guest") {
    return [
      { label: "Streak", value: "Preview only", tone: "text-amber-300" },
      { label: "Mirror", value: "Unlock on signup", tone: "text-cyan-300" },
      { label: "Profile", value: "Not saved yet", tone: "text-fuchsia-300" },
      { label: "Community", value: "Read-only sample", tone: "text-emerald-300" },
    ];
  }

  if (mode === "stranger") {
    return [
      { label: "Streak", value: "+1 day", tone: "text-amber-300" },
      { label: "Mirror", value: "Resonance +3%", tone: "text-cyan-300" },
      { label: "Profile", value: "Set your username", tone: "text-fuchsia-300" },
      { label: "Community", value: "2 new overlaps", tone: "text-emerald-300" },
    ];
  }

  return GROWTH_CARDS;
}

export default function LiveDashboardSimulation(
  { viewerMode = "guest" }: { viewerMode?: ViewerMode },
) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [typedText, setTypedText] = useState("");

  const currentScene = useMemo(() => SCENES[sceneIndex], [sceneIndex]);
  const currentSceneId = currentScene.id;
  const viewerHint = useMemo(() => getViewerHint(viewerMode), [viewerMode]);
  const viewerBadge = useMemo(() => getViewerBadge(viewerMode), [viewerMode]);
  const growthCards = useMemo(() => getGrowthCards(viewerMode), [viewerMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSceneIndex((current) => (current + 1) % SCENES.length);
    }, currentScene.durationMs);

    return () => clearTimeout(timer);
  }, [currentScene]);

  useEffect(() => {
    const sceneStart = Date.now();
    setSceneProgress(0);

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - sceneStart;
      const progress = Math.min(100, (elapsed / currentScene.durationMs) * 100);
      setSceneProgress(progress);
    }, 70);

    return () => clearInterval(progressTimer);
  }, [currentScene]);

  useEffect(() => {
    if (currentSceneId !== "journal") {
      setTypedText("");
      return;
    }

    const fullText = JOURNAL_SAMPLE_ENTRIES[sceneIndex % JOURNAL_SAMPLE_ENTRIES.length];
    setTypedText("");
    let i = 0;
    const typeTimer = setInterval(() => {
      i += 1;
      setTypedText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(typeTimer);
      }
    }, 26);

    return () => clearInterval(typeTimer);
  }, [currentSceneId, sceneIndex]);

  const artifactCount = useMemo(() => {
    if (currentSceneId === "rooms") return 0;
    if (currentSceneId === "artifacts") {
      if (sceneProgress < 28) return 1;
      if (sceneProgress < 62) return 2;
      return 3;
    }
    return 3;
  }, [currentSceneId, sceneProgress]);

  const threadCount = currentSceneId === "threads" || currentSceneId === "journal" || currentSceneId === "growth"
    ? (currentSceneId === "threads" && sceneProgress < 50 ? 2 : 3)
    : 0;

  const resonanceScore = useMemo(() => {
    if (currentSceneId === "rooms") return "86%";
    if (currentSceneId === "artifacts") return "89%";
    if (currentSceneId === "threads") return "93%";
    if (currentSceneId === "journal") return "95%";
    return "97%";
  }, [currentSceneId]);

  const statusPill = useMemo(() => {
    if (currentSceneId === "rooms") return "Room seeded";
    if (currentSceneId === "artifacts") return "Indexing artifacts";
    if (currentSceneId === "threads") return "Synthesizing themes";
    if (currentSceneId === "journal") return "Contemplation active";
    if (viewerMode === "guest") return "Preview mode";
    return "Momentum synced";
  }, [currentSceneId, viewerMode]);

  return (
    <section
      className="w-full max-w-[1800px] mx-auto px-4 md:px-16 py-20 space-y-12 relative z-10 overflow-hidden"
      id="ecosystem"
    >
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-canvas-primary mb-2 flex items-center justify-center gap-2">
          <Icons.Workflow size={10} /> The Ecosystem
        </h2>
        <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--muse-text)] leading-tight">
          The Cognitive Loop.
        </h3>
        <p className="mt-4 text-[var(--muse-muted)] font-serif italic text-base">
          Hover over the modules below to understand the architecture. Watch the
          system actively synthesize raw capture into the live network.
        </p>
      </div>

      <div className="relative w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
          <div className="lg:col-span-8 relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d0d0d] p-8 md:p-12 shadow-2xl group flex flex-col justify-between min-h-[360px] cursor-help">
            <div
              className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-1000 pointer-events-none ${
                currentSceneId === "artifacts" || currentSceneId === "threads"
                  ? "from-cyan-500/20 via-transparent to-emerald-500/10 opacity-100"
                  : "from-indigo-500/10 via-transparent to-emerald-500/5 opacity-60"
              }`}
            />

            <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl w-72 pointer-events-none z-20 shadow-2xl">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <Icons.Workflow size={12} /> Product Loop
              </h4>
              <p className="text-[10px] text-gray-300 font-serif italic">
                One sequence only: rooms, artifacts, threads, journal, then
                momentum telemetry.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-[#151515] border border-white/10 flex items-center justify-center shadow-inner relative overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-cyan-500/20 transition-opacity duration-500 ${
                      currentSceneId === "artifacts" || currentSceneId === "threads"
                        ? "opacity-100 animate-pulse"
                        : "opacity-0"
                    }`}
                  />
                  <Icons.Orbit
                    size={18}
                    className="text-gray-400 relative z-10"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight leading-none">
                    {currentScene.title}
                  </h2>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-500 mr-3">
                    Stage {sceneIndex + 1} of {SCENES.length}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-cyan-300">
                    {viewerBadge}
                  </span>
                </div>
              </div>

              {currentSceneId === "rooms" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                      New Room
                    </p>
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white">
                      {sceneProgress > 20 ? "Creative Systems" : "_"}
                    </div>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {sceneProgress > 36 && (
                        <span className="px-2 py-1 rounded-full text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          focus
                        </span>
                      )}
                      {sceneProgress > 48 && (
                        <span className="px-2 py-1 rounded-full text-[9px] bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                          synthesis
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200 transition-opacity duration-300 ${sceneProgress > 58 ? "opacity-100" : "opacity-0"}`}>
                    Room created. Ready for artifact ingestion.
                  </div>
                </div>
              )}

              {currentSceneId === "artifacts" && (
                <div className="space-y-3">
                  {ARTIFACTS.map((artifact, index) => {
                    const show = artifactCount > index;
                    return (
                      <div
                        key={artifact.title}
                        className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-30 translate-y-2"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm text-white font-medium">{artifact.title}</p>
                          <span className="px-2 py-1 rounded-full text-[9px] font-bold tracking-widest bg-white/10 text-gray-300 border border-white/10">
                            {artifact.kind}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">
                          {artifact.source}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentSceneId === "threads" && (
                <div className="grid md:grid-cols-3 gap-3">
                  {THREADS.map((thread, index) => {
                    const enabled = threadCount > index;
                    return (
                      <div
                        key={thread.theme}
                        className={`rounded-2xl border p-4 transition-all duration-500 ${enabled ? "border-amber-500/30 bg-amber-500/10 opacity-100" : "border-white/10 bg-white/[0.03] opacity-40"}`}
                      >
                        <p className="text-xs uppercase tracking-widest text-gray-500">Theme</p>
                        <p className="mt-2 text-base font-semibold text-white">{thread.theme}</p>
                        <p className="mt-2 text-[10px] uppercase tracking-widest text-gray-400">
                          {thread.linked} linked artifacts
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentSceneId === "journal" && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <div className="flex gap-2 flex-wrap mb-4">
                    <span className="px-2 py-1 rounded-full text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Room: Creative Systems
                    </span>
                    <span className="px-2 py-1 rounded-full text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Thread: Attention Drift
                    </span>
                  </div>
                  <p className="text-xl md:text-2xl font-serif text-white/90 leading-relaxed font-light italic">
                    {typedText}
                    <span className="inline-block w-2 h-6 ml-1 align-middle bg-cyan-400 animate-pulse" />
                  </p>
                </div>
              )}

              {currentSceneId === "growth" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {growthCards.map((card) => (
                    <div
                      key={card.label}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <p className="text-[10px] uppercase tracking-widest text-gray-500">{card.label}</p>
                      <p className={`mt-2 text-lg font-semibold ${card.tone}`}>{card.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 flex items-center gap-1.5 font-mono">
                  <Icons.CornerDownRight size={10} />
                  {statusPill}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <Icons.ArrowUp
                  size={16}
                  className="transition-all duration-500 text-emerald-400 -translate-y-1"
                />
              </div>
            </div>

            <p className="mt-4 text-[11px] text-gray-500 max-w-2xl">
              {viewerHint}
            </p>
          </div>

          <div className="lg:col-span-4 relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d0d0d] p-8 shadow-2xl group flex flex-col justify-between min-h-[360px] cursor-help">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl w-56 pointer-events-none z-20 shadow-2xl">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <Icons.ScanFace size={12} /> Cognitive Mirror
              </h4>
              <p className="text-[10px] text-gray-300 font-serif italic">
                This panel reflects each stage of the loop as it unfolds.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#151515] border border-white/10 flex items-center justify-center shadow-inner">
                <Icons.Activity size={14} className="text-purple-400" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-500">
                System State
              </span>
            </div>

            <div className="relative w-full aspect-square max-w-[200px] mx-auto flex items-center justify-center mt-6">
              {/* Animated Aura */}
              <div
                className="absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ease-in-out bg-gradient-to-tr from-fuchsia-500/60 via-purple-500/60 to-indigo-500/60 scale-105"
              />

              <div className="relative z-10 w-24 h-24 rounded-full border border-white/10 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center shadow-2xl">
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">
                  Resonance
                </span>
                <span
                  className="text-3xl font-bold tracking-tighter transition-all duration-1000 text-white"
                >
                  {resonanceScore}
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="text-2xl font-mono text-white font-bold">
                  1
                </div>
                <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">
                  Rooms
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="text-2xl font-mono text-white font-bold">
                  {artifactCount}
                </div>
                <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">
                  Artifacts
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d0d0d] p-8 shadow-2xl group min-h-[300px] cursor-help">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl w-56 pointer-events-none z-20 shadow-2xl">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <Icons.GitBranch size={12} /> Synthesis Threads
              </h4>
              <p className="text-[10px] text-gray-300 font-serif italic">
                Threads only appear after artifacts are present in the room.
              </p>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-[#151515] border border-white/10 flex items-center justify-center shadow-inner">
                <Icons.LayoutGrid size={14} className="text-amber-400" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-500">
                Live Ledger
              </span>
            </div>

            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border bg-amber-500/10 border-amber-500/20 transition-all duration-700 ${
                  threadCount > 0
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-4"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icons.GitCommit size={12} className="text-amber-400" />
                  <span className="text-[9px] uppercase tracking-widest text-amber-400 font-bold">
                    New Thread Detected
                  </span>
                </div>
                <p className="text-sm font-serif italic text-white leading-snug">
                  "{THREADS[0].theme}"
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                <p className="text-sm font-serif italic text-gray-400 leading-snug">
                  {threadCount > 1
                    ? `"${THREADS[1].theme}"`
                    : "Waiting for grouped themes..."}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d0d0d] p-8 shadow-2xl group flex flex-col justify-between min-h-[300px] cursor-help">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl w-64 pointer-events-none z-20 shadow-2xl">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <Icons.Network size={12} /> Global Community
              </h4>
              <p className="text-[10px] text-gray-300 font-serif italic">
                Teaser lane: streak, mirror, profile, and community pulses.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#151515] border border-white/10 flex items-center justify-center shadow-inner">
                <Icons.Activity size={14} className="text-emerald-400" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-500">
                Loop Timeline
              </span>
            </div>

            <div className="relative w-full flex-1 mt-6 border-b border-white/5 flex items-end">
              <div className="w-full grid grid-cols-5 gap-3 pb-5">
                {SCENES.map((scene, index) => {
                  const isCurrent = index === sceneIndex;
                  const isDone = index < sceneIndex;
                  return (
                    <div key={scene.id} className="space-y-2">
                      <div className={`h-1 rounded-full transition-colors ${isCurrent ? "bg-cyan-400" : isDone ? "bg-emerald-400" : "bg-white/10"}`} />
                      <p className={`text-[9px] uppercase tracking-widest ${isCurrent ? "text-cyan-300" : isDone ? "text-emerald-300" : "text-gray-600"}`}>
                        {scene.id}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative z-10 mt-6 flex items-center justify-between">
              <div>
                <div className="text-xl font-mono text-white font-bold">
                  {threadCount} threads
                </div>
                <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">
                  Active Groupings
                </div>
              </div>
              <p className="text-xs text-gray-400 max-w-sm text-right">
                {currentScene.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
