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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const ctx = getTimeContext();
    setTimeContext(ctx);
    setAmbientGlow(ctx.hex);
    // Trigger staggered animations
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

  // --- DATA ---
  const now = Date.now();
  const weekItems = useMemo(() => items.filter((i) => now - toMillis(i.createdAt) < ONE_WEEK_MS), [items]);
  const weekEntries = useMemo(() => journalEntries.filter((e) => now - e.createdAt < ONE_WEEK_MS), [journalEntries]);

  const roomCounts = weekItems.reduce<Record<string, number>>((acc, i) => {
    acc[i.roomId] = (acc[i.roomId] || 0) + 1;
    return acc;
  }, {});
  const topRoomId = Object.keys(roomCounts).sort((a, b) => roomCounts[b] - roomCounts[a])[0];
  const topRoom = rooms.find((r) => r.id === topRoomId);

  const streak = getJournalStreak();
  const topThemes = activeThemesSignal.value.slice(0, 5);
  const activeLinks = streaksSignal.value.filter((s) => getStreakState(s) !== "broken");
  const fadingLinks = streaksSignal.value.filter((s) => getStreakState(s) === "fading");

  const latestEntry = journalEntries[0];
  const latestThread = threads[0];
  const latestRoom = rooms[0];

  // Use `name` (display name) first, then `username`, then fallback
  const name = user?.name || user?.username?.split(" ")[0] || "Creator";
  const sysStatus = serviceHealth?.status === "healthy" ? "Online" : "Degraded";
  const sysColor = sysStatus === "Online" ? "text-emerald-400" : "text-rose-400";

  // Animation delay helper
  const stagger = (i: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(24px)",
    transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 120}ms`,
  });

  return (
    <div className="w-full pt-4 pb-32 flex flex-col items-center">
      
      {/* SYSTEM STATUS PILL */}
      <div className="w-full flex justify-end mb-8 px-4 md:px-8" style={stagger(0)}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md">
          <div className={`w-1.5 h-1.5 rounded-full bg-current ${sysColor} animate-pulse`} />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
            System {sysStatus}
          </span>
        </div>
      </div>

      <div className="w-full space-y-16">
        
        {/* ═══════ HERO: THE TEMPORAL MONOLITH ═══════ */}
        <section className="text-center md:text-left space-y-8 px-4 md:px-8">
          <h1 style={stagger(1)} className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] text-white">
            {timeContext.greeting},<br />
            <span className="italic font-serif text-gray-400 font-light">{name}.</span>
          </h1>

          {/* Motivational sub-message */}
          <p style={stagger(2)} className="max-w-xl text-gray-500 text-lg md:text-xl leading-relaxed font-serif italic">
            {timeContext.message}
          </p>

          {/* Status pills */}
          <div style={stagger(3)} className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
              <Icons.Flame size={14} className="text-orange-400" />
              {streak} Day Streak
            </span>
            
            {activeLinks.length > 0 && (
              <a href="/streaks" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 transition-all">
                <Icons.Link2 size={14} className="text-indigo-400" />
                {activeLinks.length} Active Link{activeLinks.length > 1 ? "s" : ""}
              </a>
            )}

            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
              <Icons.Zap size={14} className="text-emerald-400" />
              {user.resonance.resonanceScore}% Resonance
            </span>

            {topRoom && (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
                <Icons.Focus size={14} className="text-cyan-400" />
                Anchored to "{topRoom.name}"
              </span>
            )}
          </div>
        </section>

        {/* ═══════ FADING STREAKS ALERT ═══════ */}
        {fadingLinks.length > 0 && (
          <section className="px-4 md:px-8 w-full" style={stagger(4)}>
            <a
              href="/streaks"
              className="flex items-center justify-between p-4 rounded-[2rem] bg-rose-500/5 border border-rose-500/15 hover:bg-rose-500/10 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center animate-pulse">
                  <Icons.Link2 size={18} className="text-rose-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-rose-400">
                    {fadingLinks.length} link{fadingLinks.length > 1 ? "s" : ""} fading — {fadingLinks.map((l) => l.partnerName).join(", ")}
                  </span>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Extend a thought before they expire</p>
                </div>
              </div>
              <Icons.ArrowRight size={16} className="text-gray-600 group-hover:text-rose-400 transition-colors" />
            </a>
          </section>
        )}

        {/* ═══════ QUICK MIRROR WIDGET (METRICS STRIP) ═══════ */}
        <section style={stagger(5)} className="flex flex-wrap items-center p-2 bg-white/[0.02] border-y md:border border-white/5 md:rounded-full backdrop-blur-3xl shadow-2xl w-full">
          {[
            { icon: Icons.Layers, value: weekItems.length, label: "Artifacts (Week)", color: "text-canvas-primary" },
            { icon: Icons.BookOpen, value: weekEntries.length, label: "Reflections (Week)", color: "text-emerald-400" },
            { icon: Icons.Hash, value: topThemes.length, label: "Active Themes", color: "text-amber-400" },
            { icon: Icons.Link2, value: activeLinks.length, label: "Active Links", color: "text-indigo-400" },
          ].map((metric, i) => (
            <div key={i} className={`flex-1 flex items-center justify-between px-6 py-4 ${i < 3 ? "border-r border-white/5" : ""}`}>
              <div className="flex items-center gap-3">
                <metric.icon size={18} className={metric.color} />
                <span className="text-2xl font-bold text-white font-mono">{metric.value}</span>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold hidden sm:block">{metric.label}</span>
            </div>
          ))}
        </section>

        {/* ═══════ LAUNCHPAD (QUICK ACTIONS) ═══════ */}
        <section className="px-4 md:px-8 w-full" style={stagger(6)}>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 mb-6">
            <Icons.Rocket size={14} className="text-blue-400" />
            Launchpad
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "New Journal Entry", icon: Icons.PenTool, href: "/journal", iconColor: "text-emerald-400", bgColor: "bg-emerald-500/10" },
              { label: "Create New Room", icon: Icons.FolderPlus, href: "/rooms", iconColor: "text-blue-400", bgColor: "bg-blue-500/10" },
              { label: "Start Thread", icon: Icons.GitCommit, href: "/threads", iconColor: "text-amber-400", bgColor: "bg-amber-500/10" },
              { label: "View Mirror", icon: Icons.Activity, href: "/mirror", iconColor: "text-rose-400", bgColor: "bg-rose-500/10" },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="group flex flex-col items-center gap-3 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/15 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-2xl ${action.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon size={22} className={action.iconColor} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-white uppercase tracking-widest text-center transition-colors">
                  {action.label}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ═══════ THEMES CLOUD ═══════ */}
        <section className="px-4 md:px-8 w-full" style={stagger(7)}>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 mb-6">
            <Icons.Brain size={14} className="text-canvas-primary" />
            Trending Consciousness
          </h2>
          <div className="flex flex-wrap gap-2">
            {topThemes.length > 0 ? topThemes.map((theme, i) => (
              <span
                key={theme}
                className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-medium text-gray-300 hover:text-white hover:border-canvas-primary/50 hover:bg-canvas-primary/10 transition-all cursor-default"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                #{theme}
              </span>
            )) : (
              <span className="text-sm italic font-serif text-gray-500">No established themes yet. Start journaling to surface patterns.</span>
            )}
          </div>
        </section>

        {/* ═══════ RECENT RESONANCE (DYNAMIC LIST) ═══════ */}
        <section className="space-y-6 pt-8 border-t border-white/5 px-4 md:px-8 w-full" style={stagger(8)}>
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
              <Icons.Activity size={14} className="text-rose-400" />
              Recent Resonance
            </h2>
            <a href="/mirror" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
              View All →
            </a>
          </div>

          <div className="grid grid-cols-1 divide-y divide-white/5">
            {[
              latestEntry ? {
                title: getJournalTitle(latestEntry),
                detail: `${latestEntry.wordCount} words`,
                time: formatRelativeTime(latestEntry.createdAt),
                type: "Reflection",
                href: "/journal",
                icon: Icons.BookOpen,
                iconColor: "text-emerald-400",
              } : null,
              latestThread ? {
                title: latestThread.title,
                detail: `${latestThread.itemIds.length} artifacts`,
                time: formatRelativeTime(toMillis(latestThread.updatedAt)),
                type: "Thread",
                href: "/threads",
                icon: Icons.GitCommit,
                iconColor: "text-amber-400",
              } : null,
              latestRoom ? {
                title: latestRoom.name,
                detail: `${latestRoom.count} items`,
                time: formatRelativeTime(toMillis(latestRoom.updatedAt)),
                type: "Room",
                href: "/rooms",
                icon: Icons.Layout,
                iconColor: "text-blue-400",
              } : null,
              // Dynamic: show second journal entry if available
              journalEntries[1] ? {
                title: getJournalTitle(journalEntries[1]),
                detail: `${journalEntries[1].wordCount} words`,
                time: formatRelativeTime(journalEntries[1].createdAt),
                type: "Reflection",
                href: "/journal",
                icon: Icons.BookOpen,
                iconColor: "text-emerald-400",
              } : null,
              // Dynamic: show second thread if available
              threads[1] ? {
                title: threads[1].title,
                detail: `${threads[1].itemIds.length} artifacts`,
                time: formatRelativeTime(toMillis(threads[1].updatedAt)),
                type: "Thread",
                href: "/threads",
                icon: Icons.GitCommit,
                iconColor: "text-amber-400",
              } : null,
            ].filter(Boolean).slice(0, 5).map((item, i) => (
              <a
                key={i}
                href={item!.href}
                className="group flex flex-col md:flex-row md:items-center justify-between py-5 hover:bg-white/[0.02] px-4 -mx-4 rounded-2xl transition-all cursor-pointer"
                style={stagger(9 + i)}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={16} className={`${item!.iconColor} opacity-40 group-hover:opacity-100 transition-opacity`} />
                  <div>
                    <h3 className="text-lg font-bold text-gray-300 group-hover:text-white transition-colors font-serif italic tracking-tight line-clamp-1">
                      "{item!.title}"
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-gray-600">{item!.type}</span>
                      <div className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500">{item!.time || "No data"}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-xs font-mono text-gray-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    {item!.detail}
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
