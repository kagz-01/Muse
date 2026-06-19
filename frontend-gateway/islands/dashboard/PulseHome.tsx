import { useEffect, useMemo, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { userSignal } from "../../signals/user.ts";
import { roomsSignal } from "../../signals/rooms.ts";
import {
  getJournalTitle,
  journalSignal,
  addEntry,
} from "../../signals/journal.ts";
import { threadsSignal } from "../../signals/threads.ts";
import { itemsSignal } from "../../signals/items.ts";
import { setAmbientGlow } from "../../signals/resonance.ts";
import { streaksSignal, getStreakState } from "../../signals/streaks.ts";

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

function getTimeContext() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    const msgs = TIME_MESSAGES.morning;
    return {
      greeting: "Good morning",
      hex: "#f59e0b",
      period: "morning" as const,
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
    hex: "#6366f1",
    period: "evening" as const,
    message: msgs[Math.floor(Math.random() * msgs.length)],
  };
}



function toMillis(timestamp: string | number): number {
  if (typeof timestamp === "number") return timestamp;
  const parsed = Date.parse(timestamp);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

export default function PulseHome() {
  const user = userSignal.value;
  const rooms = roomsSignal.value;
  const journalEntries = journalSignal.value;
  const threads = threadsSignal.value;
  const items = itemsSignal.value;
  
  const [timeContext, setTimeContext] = useState(getTimeContext());
  const [serviceHealth, setServiceHealth] = useState<ServiceHealthResponse | null>(null);
  const [mounted, setMounted] = useState(false);

  // Quick Capture State
  const [quickCaptureText, setQuickCaptureText] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    const ctx = getTimeContext();
    setTimeContext(ctx);
    setAmbientGlow(ctx.hex);
    requestAnimationFrame(() => setMounted(true));
    return () => setAmbientGlow(null);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadHealth = async () => {
      try {
        const response = await fetch("/api/health/services", { signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json() as ServiceHealthResponse;
        setServiceHealth(data);
      } catch { /* best effort */ }
    };
    loadHealth();
    return () => controller.abort();
  }, []);

  const handleQuickCapture = () => {
    if (!quickCaptureText.trim()) return;
    setIsCapturing(true);
    // Simulate network delay for "professional" feel
    setTimeout(() => {
      addEntry(quickCaptureText, false);
      setQuickCaptureText("");
      setIsCapturing(false);
    }, 600);
  };



  // --- DATA ---
  const now = Date.now();
  const weekItems = useMemo(() => items.filter((i) => now - toMillis(i.createdAt) < ONE_WEEK_MS), [items]);
  const activeLinks = streaksSignal.value.filter((s) => getStreakState(s) !== "broken");

  const latestEntry = journalEntries[0];
  const latestThread = threads[0];
  const latestRoom = rooms[0];

  const name = user?.name || user?.username?.split(" ")[0] || "Creator";
  const sysStatus = serviceHealth?.status === "healthy" ? "Online" : "Degraded";
  const sysColor = sysStatus === "Online" ? "text-emerald-400" : "text-rose-400";

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
                Terminal Ready
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold tracking-tighter leading-[0.9] text-white">
                {timeContext.greeting},<br />
                <span className="italic font-serif text-gray-400 font-light">{name}.</span>
              </h1>
            </div>

            <div className="mt-12 relative z-10">
              <div className={`p-6 rounded-[2rem] bg-black/40 border transition-all duration-500 shadow-2xl backdrop-blur-md ${isCapturing ? 'border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'border-white/10 group-hover:border-white/20'}`}>
                <textarea 
                  value={quickCaptureText}
                  onInput={(e) => setQuickCaptureText((e.target as HTMLTextAreaElement).value)}
                  placeholder="What's on your mind? Capture a raw thought..."
                  className="w-full bg-transparent text-white placeholder-gray-600 outline-none resize-none min-h-[80px] text-lg md:text-xl font-serif italic"
                />
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-gray-500">
                     <Icons.Shield size={12} className={isCapturing ? "text-emerald-400" : ""} />
                     <span className={`text-[9px] uppercase tracking-widest font-bold ${isCapturing ? "text-emerald-400" : ""}`}>Encrypted Local Ledger</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleQuickCapture} 
                    disabled={isCapturing || !quickCaptureText.trim()} 
                    className="px-6 py-2.5 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 cursor-pointer flex items-center gap-2 border border-white/10"
                  >
                    {isCapturing ? <Icons.Loader size={12} className="animate-spin text-emerald-400" /> : <Icons.Zap size={12} />}
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
                <div className={`w-1.5 h-1.5 rounded-full ${sysColor} animate-pulse`} />
                <span className="text-[9px] font-mono tracking-widest text-gray-500">{sysStatus}</span>
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
              <h3 className="text-2xl font-bold text-white tracking-tight">Divergent Flow</h3>
              <p className="text-sm text-gray-400 font-serif italic mt-2">{timeContext.message}</p>
            </div>

            <div className="relative z-10 mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="text-2xl font-mono text-white font-bold">{weekItems.length}</div>
                <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Artifacts</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="text-2xl font-mono text-white font-bold">{activeLinks.length}</div>
                <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Active Links</div>
              </div>
            </div>
          </section>

        </div>

        {/* BENTO GRID ROW 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* WIDGET 3: RECENT NODES (Spatial Grid) */}
          <section 
            className="lg:col-span-8 relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d0d0d] p-8 md:p-10 shadow-2xl group min-h-[400px]"
            style={stagger(3)}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                <Icons.Layers size={14} className="text-rose-400" />
                Recent Nodes
              </h2>
              <a href="/mirror" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                Open Ledger →
              </a>
            </div>

            {/* Spatial Layout of recent items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                latestEntry ? { title: getJournalTitle(latestEntry), detail: `${latestEntry.wordCount} words`, type: "Reflection", href: "/journal", icon: Icons.BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" } : null,
                latestThread ? { title: latestThread.title, detail: `${latestThread.itemIds.length} artifacts`, type: "Thread", href: "/threads", icon: Icons.GitCommit, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" } : null,
                latestRoom ? { title: latestRoom.name, detail: `${latestRoom.count} items`, type: "Room", href: "/rooms", icon: Icons.Layout, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" } : null,
              ].filter(Boolean).map((item, i) => {
                const Icon = item!.icon;
                return (
                <a 
                  key={i}
                  href={item!.href}
                  className={`group/node relative flex flex-col justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 ${i % 2 === 1 ? 'md:mt-8' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-2xl ${item!.bg} ${item!.border} border flex items-center justify-center mb-6`}>
                    <Icon size={18} className={item!.color} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-200 group-hover/node:text-white transition-colors font-serif italic tracking-tight line-clamp-2 mb-2">
                      "{item!.title}"
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-gray-600">{item!.type}</span>
                      <Icons.ArrowRight size={14} className="text-gray-600 opacity-0 group-hover/node:opacity-100 -translate-x-4 group-hover/node:translate-x-0 transition-all duration-300" />
                    </div>
                  </div>
                </a>
              )})}
            </div>
          </section>

          {/* WIDGET 4: ACTIVITY SPARKLINE (Telemetry) */}
          <section 
            className="lg:col-span-4 relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d0d0d] p-8 shadow-2xl group flex flex-col justify-between min-h-[400px]"
            style={stagger(4)}
          >
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                <Icons.TrendingUp size={14} className="text-emerald-400" />
                Resonance Telemetry
              </h2>
            </div>
            
            {/* Minimalist SVG Sparkline */}
            <div className="flex-1 relative w-full h-full min-h-[150px] flex items-end">
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full overflow-visible drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] relative z-10">
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
              {/* CSS Animation for SVG Line drawing */}
              <style>{`
                @keyframes dash {
                  to {
                    stroke-dashoffset: 0;
                  }
                }
              `}</style>
            </div>

            <div className="relative z-10 mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
              <div>
                <div className="text-[28px] font-mono text-white font-bold">{user.resonance.resonanceScore}%</div>
                <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Current Sync Level</div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                <Icons.TrendingUp size={12} />
                +4% this week
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
