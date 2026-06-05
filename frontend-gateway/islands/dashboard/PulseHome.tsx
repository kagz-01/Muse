import { useEffect, useMemo, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { userSignal } from "../../signals/user.ts";
import { roomsSignal } from "../../signals/rooms.ts";
import {
  getJournalStreak,
  getJournalTitle,
  journalSignal,
} from "../../signals/journal.ts";
import { threadsSignal } from "../../signals/threads.ts";
import { activeThemesSignal } from "../../signals/connections.ts";
import { itemsSignal } from "../../signals/items.ts";
import { setAmbientGlow } from "../../signals/resonance.ts";

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

function getTimeContext() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { greeting: "Good morning", hex: "#f59e0b" }; // Amber
  }
  if (hour >= 12 && hour < 18) {
    return { greeting: "Good afternoon", hex: "#0ea5e9" }; // Sky Blue
  }
  return { greeting: "Good evening", hex: "#6366f1" }; // Indigo
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / 86400000);
  return `${days}d ago`;
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

  useEffect(() => {
    const ctx = getTimeContext();
    setTimeContext(ctx);
    setAmbientGlow(ctx.hex);
    
    return () => setAmbientGlow(null); // Clean up on dismount
  }, []);

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
      } catch {
        // Best effort dashboard telemetry.
      }
    };

    loadHealth();

    return () => controller.abort();
  }, []);

  // --- MIRROR LOGIC ---
  const now = Date.now();
  const weekItems = useMemo(
    () => items.filter((i) => now - toMillis(i.createdAt) < ONE_WEEK_MS),
    [items],
  );
  const weekEntries = useMemo(
    () => journalEntries.filter((e) => now - e.createdAt < ONE_WEEK_MS),
    [journalEntries],
  );

  const roomCounts = weekItems.reduce<Record<string, number>>((acc, i) => {
    acc[i.roomId] = (acc[i.roomId] || 0) + 1;
    return acc;
  }, {});
  const topRoomId = Object.keys(roomCounts).sort((a, b) => roomCounts[b] - roomCounts[a])[0];
  const topRoom = rooms.find((r) => r.id === topRoomId);

  const streak = getJournalStreak();
  const topThemes = activeThemesSignal.value.slice(0, 5);

  const latestEntry = journalEntries[0];
  const latestThread = threads[0];
  const latestRoom = rooms[0];

  const name = user?.username?.split(" ")[0] || "Creator";
  const sysStatus = serviceHealth?.status === "healthy" ? "Online" : "Degraded";
  const sysColor = sysStatus === "Online" ? "text-emerald-400" : "text-rose-400";

  return (
    <div className="w-full pt-4 pb-32 flex flex-col items-center animate-in fade-in duration-1000">
      
      {/* SYSTEM STATUS PILL */}
      <div className="w-full flex justify-end mb-8 px-4 md:px-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md">
          <div className={`w-1.5 h-1.5 rounded-full bg-current ${sysColor} animate-pulse`} />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
            System {sysStatus}
          </span>
        </div>
      </div>

      <div className="w-full space-y-16">
        
        {/* HERO: THE TEMPORAL MONOLITH */}
        <section className="text-center md:text-left space-y-8 px-4 md:px-8">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] text-white">
            {timeContext.greeting},<br />
            <span className="italic font-serif text-gray-400 font-light">{name}.</span>
          </h1>

          <div className="flex flex-col md:flex-row items-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
            <span className="flex items-center gap-2">
              <Icons.Flame size={14} className="text-orange-400" />
              {streak} Day Streak
            </span>
            <div className="hidden md:block w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-2 text-indigo-400">
              <Icons.Zap size={14} />
              Resonance Stable
            </span>
            {topRoom && (
              <>
                <div className="hidden md:block w-1 h-1 rounded-full bg-white/20" />
                <span className="flex items-center gap-2 text-emerald-400">
                  <Icons.Focus size={14} />
                  Anchored to "{topRoom.name}"
                </span>
              </>
            )}
          </div>
        </section>

        {/* QUICK MIRROR WIDGET (INLINE STRIP) */}
        <section className="flex flex-wrap items-center gap-4 p-2 bg-white/[0.02] border-y md:border border-white/5 md:rounded-full backdrop-blur-3xl shadow-2xl w-full">
          <div className="flex-1 flex items-center justify-between px-6 py-4 border-r border-white/5">
            <div className="flex items-center gap-3">
              <Icons.Layers size={18} className="text-canvas-primary" />
              <span className="text-2xl font-bold text-white font-mono">{weekItems.length}</span>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold hidden sm:block">Artifacts (Week)</span>
          </div>
          
          <div className="flex-1 flex items-center justify-between px-6 py-4 border-r border-white/5">
            <div className="flex items-center gap-3">
              <Icons.BookOpen size={18} className="text-emerald-400" />
              <span className="text-2xl font-bold text-white font-mono">{weekEntries.length}</span>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold hidden sm:block">Reflections (Week)</span>
          </div>

          <div className="flex-1 flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Icons.Hash size={18} className="text-amber-400" />
              <span className="text-2xl font-bold text-white font-mono">{topThemes.length}</span>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold hidden sm:block">Active Themes</span>
          </div>
        </section>

        {/* SECONDARY GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 px-4 md:px-8 w-full">
          
          {/* THEMES CLOUD */}
          <div className="space-y-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
              <Icons.Brain size={14} className="text-canvas-primary" />
              Trending Consciousness
            </h2>
            <div className="flex flex-wrap gap-2">
              {topThemes.length > 0 ? topThemes.map((theme) => (
                <span
                  key={theme}
                  className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-medium text-gray-300 hover:text-white hover:border-canvas-primary/50 hover:bg-canvas-primary/10 transition-all cursor-default"
                >
                  #{theme}
                </span>
              )) : (
                <span className="text-sm italic font-serif text-gray-500">No established themes yet.</span>
              )}
            </div>
          </div>

          {/* LAUNCHPAD (QUICK ACTIONS) */}
          <div className="space-y-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
              <Icons.Rocket size={14} className="text-blue-400" />
              Launchpad
            </h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => globalThis.location.href = "/journal"}
                className="group flex items-center justify-between p-4 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Icons.PenTool size={18} className="text-emerald-400" />
                  </div>
                  <span className="text-sm font-bold text-white group-hover:pl-1 transition-all">New Journal Entry</span>
                </div>
                <Icons.ArrowRight size={16} className="text-gray-500 group-hover:text-white" />
              </button>

              <button
                onClick={() => globalThis.location.href = "/rooms"}
                className="group flex items-center justify-between p-4 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Icons.FolderPlus size={18} className="text-blue-400" />
                  </div>
                  <span className="text-sm font-bold text-white group-hover:pl-1 transition-all">Create New Room</span>
                </div>
                <Icons.ArrowRight size={16} className="text-gray-500 group-hover:text-white" />
              </button>
            </div>
          </div>

        </section>

        {/* RECENT RESONANCE (MINIMALIST LIST) */}
        <section className="space-y-6 pt-8 border-t border-white/5 px-4 md:px-8 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
              <Icons.Activity size={14} className="text-rose-400" />
              Recent Resonance
            </h2>
            <a href="/mirror" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
              View History
            </a>
          </div>

          <div className="grid grid-cols-1 divide-y divide-white/5">
            {[
              {
                title: latestEntry ? getJournalTitle(latestEntry) : "Journaling Context",
                detail: latestEntry ? `${latestEntry.wordCount} words` : "Empty",
                time: latestEntry ? formatRelativeTime(latestEntry.createdAt) : "",
                type: "Reflection",
                href: "/journal",
              },
              {
                title: latestThread ? latestThread.title : "Community Thread",
                detail: latestThread ? `${latestThread.itemIds.length} artifacts` : "Empty",
                time: latestThread ? formatRelativeTime(toMillis(latestThread.updatedAt)) : "",
                type: "Thread",
                href: "/threads",
              },
              {
                title: latestRoom ? latestRoom.name : "Active Room",
                detail: latestRoom ? `${latestRoom.count} items` : "Empty",
                time: latestRoom ? formatRelativeTime(toMillis(latestRoom.updatedAt)) : "",
                type: "Room",
                href: "/rooms",
              },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                className="group flex flex-col md:flex-row md:items-center justify-between py-5 hover:bg-white/[0.02] px-4 -mx-4 rounded-2xl transition-all cursor-pointer"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-300 group-hover:text-white transition-colors font-serif italic tracking-tight line-clamp-1">
                    "{item.title}"
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-gray-600">{item.type}</span>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500">{item.time || "No data"}</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 opacity-0 md:opacity-100 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-mono text-gray-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    {item.detail}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
