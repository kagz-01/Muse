import { useEffect, useMemo, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { userSignal } from "../../signals/user.ts";
import { roomsSignal } from "../../signals/rooms.ts";
import {
  addEntry,
  getJournalTitle,
  journalSignal,
} from "../../signals/journal.ts";
import { threadsSignal } from "../../signals/threads.ts";
import { itemsSignal } from "../../signals/items.ts";
import { setAmbientGlow } from "../../signals/resonance.ts";
import { getStreakState, streaksSignal } from "../../signals/streaks.ts";
import {
  generateDynamicHumor,
  type UserContext,
} from "../../utils/dynamicHumor.ts";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type ServiceStatus = "up" | "down";

interface ServiceHealthResponse {
  status: "healthy" | "degraded";
  checkedAt: string;
  services: {
    ai: { status: ServiceStatus; statusCode: number | null; endpoint: string };
    blockchain: {
      status: ServiceStatus;
      statusCode: number | null;
      endpoint: string;
    };
  };
}

type GreetingPeriod = "morning" | "afternoon" | "evening";

const TIME_MESSAGES: Record<string, string[]> = {
  morning: [
    "A fresh canvas awaits your thoughts.",
    "The dawn carries new patterns. What will you synthesize?",
    "Begin with intention. End with clarity.",
  ],
  afternoon: [
    "You're in the flow. Keep the synthesis going.",
    "Momentum builds. Your threads are weaving something.",
    "The afternoon is yours. What deserves your attention?",
  ],
  evening: [
    "Reflect on the patterns that emerged today.",
    "The quiet hours are for deep contemplation.",
    "Let the day's noise settle. What remains is signal.",
  ],
};

const HUMOR_MESSAGES: Record<GreetingPeriod, string[]> = {
  morning: [
    "I brewed the dashboard early so your ideas could wake up before the rest of the internet.",
    "Coffee is optional. Momentum is not.",
    "The day is soft right now. Perfect time to make it productive.",
  ],
  afternoon: [
    "The session is warm, the lights are on, and the excuses are running out.",
    "Afternoons are for turning scattered thoughts into something that looks intentional.",
    "You still have time to impress your future self.",
  ],
  evening: [
    "The noise is settling down, which is usually a sign the good ideas are about to show up.",
    "Evening mode: fewer distractions, sharper signal, slightly more dramatic lighting.",
    "A quiet hour is a good hour for intelligent trouble.",
  ],
};

function getTimeContext(timeZone?: string) {
  let hour = new Date().getHours();
  if (timeZone) {
    try {
      hour = Number(
        new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          hour12: false,
          timeZone,
        }).format(new Date()),
      );
    } catch {
      // Fall back to the browser clock when timezone data is missing or invalid.
    }
  }

  if (hour >= 5 && hour < 12) {
    const msgs = TIME_MESSAGES.morning;
    return {
      greeting: "Good morning",
      period: "morning" as const,
      hex: "#f59e0b",
      message: msgs[Math.floor(Math.random() * msgs.length)],
    };
  }
  if (hour >= 12 && hour < 18) {
    const msgs = TIME_MESSAGES.afternoon;
    return {
      greeting: "Good afternoon",
      hex: "#0ea5e9",
      period: "afternoon" as const,
      message: msgs[Math.floor(Math.random() * msgs.length)],
    };
  }
  const msgs = TIME_MESSAGES.evening;
  return {
    greeting: "Good evening",
    period: "evening" as const,
    hex: "#6366f1",
    message: msgs[Math.floor(Math.random() * msgs.length)],
  };
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getGuestPrompt(
  period: GreetingPeriod,
  isGuestAccess: boolean,
  userContext?: Partial<UserContext>,
): string {
  if (isGuestAccess) {
    return "Guest access is active. Finish your profile when you're ready and I'll retire the stranger label.";
  }

  // Use dynamic humor based on user engagement metrics
  return generateDynamicHumor(period, userContext);
}

function toMillis(timestamp: string | number): number {
  if (typeof timestamp === "number") return timestamp;
  const parsed = Date.parse(timestamp);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

export default function PulseHome({ initialUser, isDemo = false }: { initialUser?: { id: string; name?: string; username: string; email: string }; isDemo?: boolean }) {
  const user = userSignal.value;
  const rooms = roomsSignal.value;
  const journalEntries = journalSignal.value;
  const threads = threadsSignal.value;
  const items = itemsSignal.value;

  // Use initialUser for name/username if available (from SSR), fall back to signal
  const displayUserName = initialUser?.name || initialUser?.username || user?.name || user?.username;
  const displayUserEmail = initialUser?.email || user?.email;

  const [timeContext, setTimeContext] = useState(getTimeContext());
  const [serviceHealth, setServiceHealth] = useState<
    ServiceHealthResponse | null
  >(null);
  const [mounted, setMounted] = useState(false);
  const [heroGreeting, setHeroGreeting] = useState("");
  const [heroPrompt, setHeroPrompt] = useState("");
  const [aiGreeting, setAiGreeting] = useState<string | null>(null);

  // Quick Capture State
  const [quickCaptureText, setQuickCaptureText] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);

  // Compute display name once for use throughout the component
  const isGuestAccess = isDemo || user?.id === "__demo__";
  const finalDisplayName = displayUserName?.trim() ||
    (isGuestAccess ? "Guest" : "Stranger");

  useEffect(() => {
    const ctx = getTimeContext(user?.timezone);
    setTimeContext(ctx);
    setAmbientGlow(ctx.hex);
    requestAnimationFrame(() => setMounted(true));
    return () => setAmbientGlow(null);
  }, [user?.timezone]);

  useEffect(() => {
    const controller = new AbortController();
    const loadHealth = async () => {
      try {
        const response = await fetch("/api/health/services", {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = await response.json() as ServiceHealthResponse;
        setServiceHealth(data);
      } catch { /* best effort */ }
    };
    loadHealth();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const body = {
      context: "general_dashboard",
      period: timeContext.period,
      streak: user?.cognitiveStreak ?? 0,
      resonanceScore: user?.resonance?.resonanceScore ?? 0,
      entries: journalEntries.length,
      rooms: rooms.length,
      threads: threads.length,
    };

    const loadAiGreeting = async () => {
      try {
        const response = await fetch("/api/personality/greeting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = await response.json();
        if (data?.greeting) {
          setAiGreeting(data.greeting);
        }
      } catch {
        // best effort; keep fallback humor
      }
    };

    loadAiGreeting();

    // Rotate greeting every 40 seconds for a dynamic feel
    const rotateInterval = setInterval(loadAiGreeting, 40_000);

    return () => {
      controller.abort();
      clearInterval(rotateInterval);
    };
  }, [
    timeContext.period,
    user?.cognitiveStreak,
    user?.resonance?.resonanceScore,
    journalEntries.length,
    rooms.length,
    threads.length,
  ]);

  useEffect(() => {
    if (!aiGreeting) return;
    setHeroPrompt(aiGreeting);
  }, [aiGreeting]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;
    let promptTimeout: ReturnType<typeof setTimeout>;

    const hasDisplayName = Boolean(
      displayUserName?.trim(),
    );

    // Build user context for dynamic humor generation
    const userContext: Partial<UserContext> = {
      currentStreak: user?.cognitiveStreak ?? 0,
      resonanceScore: user?.resonance?.resonanceScore ?? 0,
      journalEntryCount: journalEntries.length,
      roomsJoined: rooms.length,
      threadsActive: threads.length,
      hasUsername: hasDisplayName,
    };

    const prompt = aiGreeting ?? getGuestPrompt(
      timeContext.period,
      isGuestAccess,
      userContext,
    );

    // Animate both greeting and name together as one flowing line
    const fullGreeting = `${timeContext.greeting}, ${capitalize(finalDisplayName || "Stranger")}.`;

    setHeroGreeting("");
    setHeroPrompt("");

    timeout = setTimeout(() => {
      let index = 0;
      interval = setInterval(() => {
        index += 1;
        setHeroGreeting(fullGreeting.slice(0, index));
        if (index >= fullGreeting.length) {
          clearInterval(interval);
          promptTimeout = setTimeout(() => {
            setHeroPrompt(prompt);
          }, 350);
        }
      }, 28);
    }, 220);

    return () => {
      clearTimeout(timeout);
      clearTimeout(promptTimeout);
      clearInterval(interval);
    };
  }, [
    timeContext.greeting,
    timeContext.period,
    user?.id,
    user?.username,
    user?.cognitiveStreak,
    user?.resonance?.resonanceScore,
    journalEntries.length,
    rooms.length,
    threads.length,
  ]);

  const handleQuickCapture = () => {
    if (!quickCaptureText.trim()) return;
    setIsCapturing(true);
    // Simulate network delay for "professional" feel
    setTimeout(async () => {
      try {
        await addEntry(quickCaptureText, false);
        setQuickCaptureText("");
      } catch (e) {
        console.error("Failed to capture:", e);
      } finally {
        setIsCapturing(false);
      }
    }, 600);
  };

  // --- DATA ---
  const now = Date.now();
  const weekItems = useMemo(
    () => items.filter((i) => now - toMillis(i.createdAt) < ONE_WEEK_MS),
    [items],
  );
  const activeLinks = streaksSignal.value.filter((s) =>
    getStreakState(s) !== "broken"
  );

  const latestEntry = journalEntries[0];
  const latestThread = threads[0];
  const latestRoom = rooms[0];

  const sysStatus = serviceHealth?.status === "healthy" ? "Online" : "Degraded";
  const sysColor = sysStatus === "Online"
    ? "text-emerald-400"
    : "text-rose-400";

  const stagger = (i: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(24px)",
    transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 120}ms`,
  });

  return (
    <div className="w-full pt-8 pb-32 flex flex-col items-center">
      <div className="w-full space-y-6 px-4 md:px-8">
        {/* BENTO GRID ROW 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* WIDGET 1: THE CAPTURE TERMINAL (Hero) */}
          <section
            className="lg:col-span-8 relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d0d0d] p-8 md:p-12 shadow-2xl group flex flex-col justify-between min-h-[360px]"
            style={stagger(1)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                {isGuestAccess ? "Guest Access" : finalDisplayName ? "Terminal Ready" : "Stranger Mode"}
              </div>

              <h1 className="text-5xl md:text-6xl font-bold tracking-tighter leading-[1.1] text-white">
                {heroGreeting}
              </h1>

              <p className="mt-6 max-w-2xl text-sm md:text-base text-gray-400 font-serif italic leading-relaxed">
                {heroPrompt || timeContext.message}
              </p>
            </div>

            <div className="mt-12 relative z-10">
              <div
                className={`p-6 rounded-[2rem] bg-black/40 border transition-all duration-500 shadow-2xl backdrop-blur-md ${
                  isCapturing
                    ? "border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                    : "border-white/10 group-hover:border-white/20"
                }`}
              >
                <textarea
                  value={quickCaptureText}
                  onInput={(e) =>
                    setQuickCaptureText(
                      (e.target as HTMLTextAreaElement).value,
                    )}
                  placeholder="What's on your mind? Capture a raw thought..."
                  className="w-full bg-transparent text-white placeholder-gray-600 outline-none resize-none min-h-[80px] text-lg md:text-xl font-serif italic"
                />
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Icons.Shield
                      size={12}
                      className={isCapturing ? "text-emerald-400" : ""}
                    />
                    <span
                      className={`text-[9px] uppercase tracking-widest font-bold ${
                        isCapturing ? "text-emerald-400" : ""
                      }`}
                    >
                      Encrypted Local Ledger
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickCapture}
                    disabled={isCapturing || !quickCaptureText.trim()}
                    className="px-6 py-2.5 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 cursor-pointer flex items-center gap-2 border border-white/10"
                  >
                    {isCapturing
                      ? (
                        <Icons.Loader
                          size={12}
                          className="animate-spin text-emerald-400"
                        />
                      )
                      : <Icons.Zap size={12} />}
                    {isCapturing ? "Synthesizing..." : "Commit"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* WIDGET 2: COGNITIVE WEATHER (Status) */}
          <section
            className="lg:col-span-4 relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d0d0d] p-8 shadow-2xl group flex flex-col justify-between min-h-[360px]"
            style={stagger(2)}
          >
            <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-gradient-to-bl from-cyan-500/20 to-transparent blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                <Icons.Activity size={14} className="text-cyan-400" />
                Cognitive Weather
              </h2>
              <div className="flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${sysColor} animate-pulse`}
                />
                <span className="text-[9px] font-mono tracking-widest text-gray-500">
                  {sysStatus}
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-8 flex flex-col items-center text-center">
              {/* Spinning 3D CSS Aura representation */}
              <div className="w-32 h-32 relative mb-6">
                <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/30 animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border border-cyan-500/20 animate-[spin_15s_linear_infinite_reverse]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 blur-md animate-pulse" />
                  <Icons.Brain size={24} className="text-cyan-400 absolute" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Divergent Flow
              </h3>
              <p className="text-sm text-gray-400 font-serif italic mt-2">
                {timeContext.message}
              </p>
            </div>

            <div className="relative z-10 mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="text-2xl font-mono text-white font-bold">
                  {weekItems.length}
                </div>
                <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">
                  Artifacts
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="text-2xl font-mono text-white font-bold">
                  {activeLinks.length}
                </div>
                <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">
                  Active Links
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* BENTO GRID ROW 2: TIER 2 & TIER 3 (SPLIT BRAIN) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* THE INNER WORLD (Private Momentum & Graph) */}
          <section
            className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d0d0d] p-8 md:p-10 shadow-2xl group min-h-[400px] flex flex-col"
            style={stagger(3)}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                <Icons.Brain size={14} className="text-purple-400" />
                Inner World (Cognitive Nodes)
              </h2>
              <a
                href="/mirror"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
              >
                Open Mirror →
              </a>
            </div>

            {/* Visual Node Graph (Show, Don't Tell) */}
            <div className="flex-1 relative flex items-center justify-center min-h-[200px] my-4">
              {/* Central Node */}
              <a href="/journal" className="absolute w-24 h-24 rounded-full bg-purple-500/10 border border-purple-500/30 flex flex-col items-center justify-center animate-[pulse_4s_ease-in-out_infinite] z-20 group/node hover:scale-110 hover:bg-purple-500/20 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-500">
                <Icons.BookOpen size={20} className="text-purple-400 mb-1" />
                <span className="text-[8px] uppercase tracking-widest text-purple-300 font-bold max-w-[80%] truncate text-center opacity-0 group-hover/node:opacity-100 transition-opacity duration-300">
                  {latestEntry ? getJournalTitle(latestEntry) : "Journal"}
                </span>
                {/* Connecting Lines */}
                <svg className="absolute w-full h-full overflow-visible -z-10 opacity-30">
                  <line x1="50%" y1="50%" x2="-20%" y2="-10%" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="50%" y1="50%" x2="120%" y2="120%" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" />
                </svg>
              </a>

              {/* Orbiting Node 1 */}
              <a href="/threads" className="absolute -left-2 -top-4 w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center animate-[pulse_5s_ease-in-out_infinite] z-10 hover:scale-110 hover:bg-amber-500/20 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all duration-500 group/node">
                <Icons.GitCommit size={14} className="text-amber-400" />
                <span className="absolute -top-6 text-[8px] uppercase tracking-widest text-amber-300 font-bold whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity duration-300 drop-shadow-md">
                  {latestThread ? latestThread.title : "Thread"}
                </span>
              </a>

              {/* Orbiting Node 2 */}
              <a href="/rooms" className="absolute -right-2 -bottom-4 w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/30 flex flex-col items-center justify-center animate-[pulse_6s_ease-in-out_infinite] z-10 hover:scale-110 hover:bg-blue-500/20 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-500 group/node">
                <Icons.Layout size={16} className="text-blue-400" />
                <span className="absolute -bottom-6 text-[8px] uppercase tracking-widest text-blue-300 font-bold whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity duration-300 drop-shadow-md">
                  {latestRoom ? latestRoom.name : "Room"}
                </span>
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <div>
                <div className="text-2xl font-mono text-white font-bold leading-none">
                  {weekItems.length}
                </div>
                <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-2">
                  Nodes this week
                </div>
              </div>
              <div className="flex gap-1">
                 {/* Mini heatmap visual (simulated) */}
                 {[1,2,3,4,5,6,7].map((day, i) => (
                   <div key={day} className={`w-3 h-8 rounded-sm ${i === 6 ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : i % 2 === 0 ? 'bg-purple-500/30' : 'bg-white/5'}`} />
                 ))}
              </div>
            </div>
          </section>

          {/* THE OUTER WORLD (Community Pulse & Telemetry) */}
          <section
            className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d0d0d] p-8 md:p-10 shadow-2xl group min-h-[400px] flex flex-col"
            style={stagger(4)}
          >
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                <Icons.Globe size={14} className="text-emerald-400" />
                Outer World (Network)
              </h2>
              <a
                href="/connections"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
              >
                Open Hub →
              </a>
            </div>

            {/* Minimalist SVG Sparkline (Telemetry) */}
            <div className="flex-1 relative w-full flex items-end min-h-[100px] mb-8">
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl" />
              <svg
                viewBox="0 0 100 50"
                preserveAspectRatio="none"
                className="w-full h-[100px] overflow-visible drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] relative z-10"
              >
                <polyline
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,40 10,45 20,30 30,35 40,20 50,25 60,10 70,15 80,5 90,10 100,0"
                  className="animate-[dash_3s_ease-out_forwards]"
                  style={{ strokeDasharray: 300, strokeDashoffset: 300 }}
                />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-auto">
              <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col justify-center">
                <div className="text-[28px] font-mono text-white font-bold leading-none">
                  {user.resonance.resonanceScore}%
                </div>
                <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-2">
                  Signal Reach
                </div>
              </div>
              
              <div className="p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col justify-center relative overflow-hidden group/pulse">
                 <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover/pulse:opacity-100 transition-opacity duration-500" />
                 <div className="flex items-center gap-2 mb-2 relative z-10">
                   <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                   </span>
                   <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold">Live Pulse</span>
                 </div>
                 <div className="text-xs font-serif italic text-emerald-100/70 line-clamp-2 relative z-10">
                   "A shift in cognitive alignment detected across your network."
                 </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
