import { useEffect, useMemo, useState } from "preact/hooks";
import {
  Aperture,
  ArrowRight,
  BarChart2,
  BookOpen,
  ChevronRight,
  FolderOpen,
  Layers,
  MessageSquare,
  TrendingUp,
  Wifi,
  WifiOff,
} from "lucide-preact";
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

function timeOfDayGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
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
  const [greeting, setGreeting] = useState("Good morning");
  const [serviceHealth, setServiceHealth] = useState<ServiceHealthResponse | null>(
    null,
  );

  useEffect(() => {
    setGreeting(timeOfDayGreeting());
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
  const topRoomId =
    Object.keys(roomCounts).sort((a, b) => roomCounts[b] - roomCounts[a])[0];
  const topRoom = rooms.find((r) => r.id === topRoomId);

  const streak = getJournalStreak();
  const topThemes = activeThemesSignal.value.slice(0, 4);

  const latestEntry = journalEntries[0];
  const latestThread = threads[0];
  const latestRoom = rooms[0];

  const mirrorStats = [
    {
      label: "Artifacts",
      value: weekItems.length,
      icon: Layers,
      color: "text-canvas-primary",
    },
    {
      label: "Reflections",
      value: weekEntries.length,
      icon: BookOpen,
      color: "text-emerald-400",
    },
    {
      label: "Rooms Active",
      value: new Set(weekItems.map((i) => i.roomId)).size,
      icon: BarChart2,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="max-w-[1800px] mx-auto px-6 md:px-10 pt-8 pb-20 space-y-10 animate-in fade-in duration-1000">
      {/* HERO SECTION: THE MONOLITH GREETER */}
      <section className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-linear-to-br from-white/[0.04] via-transparent to-transparent p-10 md:p-16 shadow-3xl">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-canvas-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5 blur-[120px]" />

        <div className="relative z-10 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] text-white">
              {greeting},{" "}
              <span className="text-gray-600 italic font-serif">
                {user?.name?.split(" ")[0] || "Creator"}
              </span>.
              <span className="block mt-4 bg-gradient-to-r from-white via-white to-gray-700 bg-clip-text text-transparent">
                Your resonance is stable.
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-gray-400 text-lg md:text-xl leading-relaxed font-serif italic opacity-80">
              The platform is reflecting your semantic patterns. You have
              maintained a{" "}
              <span className="text-white font-sans font-bold not-italic">
                {streak} day
              </span>{" "}
              reflection streak.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => globalThis.location.href = "/journal"}
                className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-black shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all hover:-translate-y-1 hover:shadow-white/20 active:scale-95 cursor-pointer"
              >
                Sync Journal <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => globalThis.location.href = "/rooms"}
                className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-95 cursor-pointer"
              >
                Enter Rooms <FolderOpen size={16} />
              </button>
            </div>
          </div>

          {/* QUICK MIRROR WIDGET */}
          <div className="bg-black/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <div className="flex items-center gap-3">
                <Aperture size={20} className="text-canvas-primary" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                  Mirror Insights
                </span>
              </div>
              <a
                href="/mirror"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
              >
                History
              </a>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {mirrorStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex flex-col items-center gap-2">
                    <stat.icon size={18} className={stat.color} />
                    <span className="text-2xl font-bold text-white font-mono">
                      {stat.value}
                    </span>
                  </div>
                  <p className="mt-2 text-[8px] font-bold uppercase tracking-widest text-gray-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-canvas-primary mb-3">
                Pattern Detected
              </p>
              <p className="text-sm text-gray-300 leading-relaxed font-serif italic">
                {topRoom
                  ? `Your focus on "${topRoom.name}" has intensified this week with ${
                    roomCounts[topRoomId]
                  } new artifacts.`
                  : "Start collecting to see your primary cognitive patterns here."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECONDARY GRID: ACTIVITY & THEMES */}
      <section className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
        {/* RECENT RESONANCE */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              Recent Resonance{" "}
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              Latest Actions
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                title: latestEntry ? getJournalTitle(latestEntry) : "Journal",
                detail: latestEntry
                  ? `${latestEntry.wordCount} words`
                  : "No entries",
                time: latestEntry
                  ? formatRelativeTime(latestEntry.createdAt)
                  : "",
                icon: BookOpen,
                href: "/journal",
              },
              {
                title: latestThread ? latestThread.title : "Threads",
                detail: latestThread
                  ? `${latestThread.itemIds.length} items`
                  : "No threads",
                time: latestThread
                  ? formatRelativeTime(toMillis(latestThread.updatedAt))
                  : "",
                icon: MessageSquare,
                href: "/threads",
              },
              {
                title: latestRoom ? latestRoom.name : "Rooms",
                detail: latestRoom ? `${latestRoom.count} total` : "No rooms",
                time: latestRoom
                  ? formatRelativeTime(toMillis(latestRoom.updatedAt))
                  : "",
                icon: FolderOpen,
                href: "/rooms",
              },
            ].map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="group flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-canvas-primary group-hover:scale-110 transition-transform">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.detail} • {item.time}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className="text-gray-700 group-hover:text-white transition-colors"
                />
              </a>
            ))}
          </div>
        </div>

        {/* TRENDING CONSCIOUSNESS */}
        <div className="space-y-8">
          <div className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <TrendingUp size={20} className="text-canvas-primary" />{" "}
              Active Themes
            </h3>
            <div className="flex flex-wrap gap-2">
              {topThemes.map((theme) => (
                <span
                  key={theme}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:border-canvas-primary/50 transition-colors"
                >
                  {theme}
                </span>
              ))}
            </div>
            <div className="mt-8 p-6 rounded-3xl bg-black/20 border border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Soul Signal
              </p>
              <p className="text-sm text-gray-400 font-serif italic leading-relaxed">
                Your current focus suggests a high degree of pattern density in
                {" "}
                {topThemes[0] || "emergent topics"}.
              </p>
            </div>
          </div>

          {/* STATS STRIP */}
          <div className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 p-8">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                Service Health
              </p>
              <div className="text-[9px] uppercase tracking-widest text-gray-600">
                {serviceHealth?.checkedAt
                  ? formatRelativeTime(toMillis(serviceHealth.checkedAt))
                  : "No signal"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {([
                {
                  key: "ai",
                  label: "AI Engine",
                  state: serviceHealth?.services.ai.status,
                  code: serviceHealth?.services.ai.statusCode,
                },
                {
                  key: "blockchain",
                  label: "Ledger Node",
                  state: serviceHealth?.services.blockchain.status,
                  code: serviceHealth?.services.blockchain.statusCode,
                },
              ]).map((service) => (
                <div
                  key={service.key}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                      {service.label}
                    </span>
                    {service.state === "up"
                      ? <Wifi size={14} className="text-emerald-400" />
                      : <WifiOff size={14} className="text-rose-400" />}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                    {service.state === "up" ? "Online" : "Offline"}
                  </p>
                  <p className="text-[9px] text-gray-500 mt-1">
                    HTTP {service.code ?? "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-canvas-primary/10 rounded-[2.5rem] border border-canvas-primary/20 p-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-canvas-primary mb-2">
              Total Intelligence
            </p>
            <p className="text-4xl font-bold text-white mb-2">
              {rooms.reduce((s, r) => s + r.count, 0)}
            </p>
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              Anchored Artifacts
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
