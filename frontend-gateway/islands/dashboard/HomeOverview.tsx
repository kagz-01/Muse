import { useEffect, useState } from "preact/hooks";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CircleDot,
  FolderOpen,
  Flame,
  MessageSquare,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-preact";
import { userSignal } from "../../signals/user.ts";
import { roomsSignal } from "../../signals/rooms.ts";
import { journalSignal, getJournalStreak, getTodayWordCount, getJournalTitle } from "../../signals/journal.ts";
import { threadsSignal } from "../../signals/threads.ts";
import { circlesSignal, collaboratorsSignal, insightsSignal, activeThemesSignal } from "../../signals/connections.ts";

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

export default function HomeOverview() {
  const user = userSignal.value;
  const rooms = roomsSignal.value;
  const journalEntries = journalSignal.value;
  const threads = threadsSignal.value;
  const circles = circlesSignal.value;
  const collaborators = collaboratorsSignal.value;
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    setGreeting(timeOfDayGreeting());
  }, []);

  const totalArtifacts = rooms.reduce((sum, room) => sum + room.count, 0);
  const publicRooms = rooms.filter((room) => room.isPublic).length;
  const publicThreads = threads.filter((thread) => thread.isPublic).length;
  const streak = getJournalStreak();
  const todayWords = getTodayWordCount();
  const latestEntry = journalEntries[0];
  const latestThread = threads[0];
  const latestRoom = rooms[0];
  const activeCollaborator = collaborators[0];
  const topThemes = activeThemesSignal.value.slice(0, 4);

  const stats = [
    { label: "Artifacts", value: totalArtifacts, helper: `${publicRooms} public rooms`, icon: FolderOpen },
    { label: "Journal streak", value: `${streak}d`, helper: `${todayWords} words today`, icon: Flame },
    { label: "Threads", value: threads.length, helper: `${publicThreads} public`, icon: MessageSquare },
    { label: "Community circles", value: circles.length, helper: `${collaborators.length} collaborators`, icon: Users },
  ];

  const recentActivity = [
    {
      title: latestEntry ? getJournalTitle(latestEntry) : "No journal entries yet",
      detail: latestEntry ? `${latestEntry.wordCount} words · ${formatRelativeTime(latestEntry.createdAt)}` : "Start your first reflection",
      icon: BookOpen,
      href: latestEntry ? `/journal/${latestEntry.id}` : "/journal",
    },
    {
      title: latestRoom ? latestRoom.name : "No rooms yet",
      detail: latestRoom ? `${latestRoom.count} artifacts · ${latestRoom.isPublic ? "Public" : "Solo"}` : "Create your first room",
      icon: FolderOpen,
      href: latestRoom ? `/rooms/${latestRoom.id}` : "/rooms",
    },
    {
      title: latestThread ? latestThread.title : "No threads yet",
      detail: latestThread ? `${latestThread.itemIds.length} linked artifacts · ${latestThread.isPublic ? "Community" : "Solo"}` : "Start a thread",
      icon: MessageSquare,
      href: latestThread ? `/threads/${latestThread.id}` : "/threads",
    },
  ];

  return (
    <div className="max-w-[1800px] mx-auto px-6 md:px-10 pt-8 pb-10 space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-linear-to-br from-white/[0.04] via-white/[0.02] to-transparent p-8 md:p-10 shadow-2xl">
        <div className="absolute -top-16 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-canvas-primary/10 blur-3xl" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.4fr_0.9fr] items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
              <Sparkles size={12} className="text-canvas-primary" />
              Home Overview
            </div>

            <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] text-white max-w-3xl">
              {greeting}, {user?.name || "Creator"}.
              <span className="block bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                Your creative universe is in motion.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-gray-400 text-base md:text-lg leading-relaxed font-serif italic">
              A quiet dashboard for collecting, contemplating, and turning patterns into output. This is the skeleton; the real intelligence will layer in here next.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="/journal"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-black shadow-[0_0_30px_rgba(255,255,255,0.18)] transition-all hover:-translate-y-0.5"
              >
                New Journal Entry <ArrowRight size={14} />
              </a>
              <a
                href="/create"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:border-white/20 hover:bg-white/10"
              >
                Create Room <Plus size={14} />
              </a>
              <a
                href="/threads"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:border-white/20 hover:bg-white/10"
              >
                Start Thread <Target size={14} />
              </a>
            </div>
          </div>

          <div className="space-y-4 rounded-[1.75rem] border border-white/5 bg-black/25 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">Weekly Mirror</p>
                <p className="mt-1 text-sm text-gray-300">Fast signals from your current week</p>
              </div>
              <BarChart3 size={18} className="text-canvas-primary" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {stats.slice(0, 2).map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</span>
                      <Icon size={14} className="text-canvas-primary" />
                    </div>
                    <p className="mt-3 text-2xl font-bold text-white">{stat.value}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-widest text-gray-600">{stat.helper}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                <CircleDot size={14} className="text-emerald-400" />
                Now
              </div>
              <p className="mt-3 text-sm text-gray-300 leading-relaxed font-serif italic">
                {activeCollaborator
                  ? `${activeCollaborator.name} is ${activeCollaborator.status.toLowerCase()} around ${activeCollaborator.sharedThemes.join(" + ")}.`
                  : "No active collaborators yet."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6 rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Contemplation</h2>
              <p className="mt-1 text-sm text-gray-400 font-serif italic">Your latest patterns and insights.</p>
            </div>
            <a href="/mirror" className="text-[11px] font-bold uppercase tracking-widest text-canvas-primary hover:text-white transition-colors">
              Open Mirror
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-3xl border border-white/5 bg-black/20 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-white">
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-widest text-gray-600">{stat.helper}</p>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            {recentActivity.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.title}
                  href={item.href}
                  className="group flex items-center justify-between gap-4 rounded-3xl border border-white/5 bg-black/20 p-4 transition-all hover:border-white/15 hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-canvas-primary">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.detail}</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-gray-600 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">Community Hub</h3>
                <p className="mt-1 text-sm text-gray-400 font-serif italic">Active circles and collaborators.</p>
              </div>
              <Users size={18} className="text-canvas-primary" />
            </div>

            <div className="mt-5 space-y-4">
              {circles.slice(0, 2).map((circle) => (
                <div key={circle.id} className="rounded-3xl border border-white/5 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{circle.name}</p>
                      <p className="mt-1 text-xs text-gray-500">{circle.description}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {circle.memberCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">Trending Themes</h3>
                <p className="mt-1 text-sm text-gray-400 font-serif italic">What is surfacing right now.</p>
              </div>
              <TrendingUp size={18} className="text-canvas-primary" />
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {topThemes.map((theme) => (
                <span key={theme} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-300">
                  {theme}
                </span>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-white/5 bg-black/20 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">Community signal</p>
              <p className="mt-2 text-sm text-gray-300 leading-relaxed font-serif italic">
                {insightsSignal.value[0] || "Community dialogue is still forming."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
