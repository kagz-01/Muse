import { useEffect, useMemo } from "preact/hooks";
import * as Icons from "lucide-preact";
import { loadMirrorStats, mirrorSignal } from "../../signals/mirror.ts";
import {
  getActivityHeatmap,
  getMoodStats,
  journalSignal,
} from "../../signals/journal.ts";
import { activeThemesSignal } from "../../signals/connections.ts";
import { threadsSignal } from "../../signals/threads.ts";
import { userSignal } from "../../signals/user.ts";
import ActivityTimeline from "../../components/mirror/ActivityTimeline.tsx";
import {
  LineChart,
  PieChart,
  RadarChart,
} from "../../components/mirror/MirrorCharts.tsx";

import ActivityHeatmap from "./ActivityHeatmap.tsx";

export default function MirrorDashboard() {
  useEffect(() => {
    void loadMirrorStats();
  }, []);

  const stats = mirrorSignal.value;
  const entries = journalSignal.value;
  const user = userSignal.value;
  const threads = threadsSignal.value;
  const topThemes = activeThemesSignal.value.slice(0, 8);

  const moodStats = getMoodStats();
  const activeMood = moodStats[0];
  const totalPublic = entries.filter((entry) => entry.isPublic).length;
  const totalFavorites = entries.filter((entry) => entry.isFavorited).length;
  const totalSyntheses = threads.length;
  const totalWords = useMemo(
    () => getActivityHeatmap().reduce((sum, day) => sum + day.count, 0),
    [entries],
  );

  const heatmap = useMemo(() => {
    return getActivityHeatmap();
  }, [entries]);

  const mirrorSummary = activeMood
    ? `The mirror shows your most frequent mood as ${activeMood.label}. Your focus remains steady as you process ${topThemes[0] || 'emerging concepts'}.`
    : "This mirror is tuning your mood, reflection patterns, and creative cadence into a single private signal.";

  const currentFocus = topThemes[0] || user.weeklyInsights.topThemes[0] || "Focus";
  const moodDistribution = moodStats.slice(0, 4).map((mood) => ({
    label: mood.label,
    value: mood.count,
    color: mood.color,
  }));
  const contentDistribution = [
    { label: "Reflections", value: entries.length, color: "#60a5fa" },
    { label: "Syntheses", value: totalSyntheses, color: "#a78bfa" },
    { label: "Public", value: totalPublic, color: "#f472b6" },
  ];
  const radarData = topThemes.length > 0
    ? topThemes.slice(0, 6).map((theme, index) => ({
      subject: theme,
      A: Math.max(50, 100 - index * 12),
      fullMark: 100,
    }))
    : [
      { subject: "Focus", A: 75, fullMark: 100 },
      { subject: "Clarity", A: 80, fullMark: 100 },
      { subject: "Momentum", A: 70, fullMark: 100 },
      { subject: "Reach", A: 65, fullMark: 100 },
      { subject: "Depth", A: 60, fullMark: 100 },
    ];

  const topThreads = [...threads]
    .sort((a, b) => (b.dialogueLayers?.length ?? 0) - (a.dialogueLayers?.length ?? 0))
    .sort(
      (a, b) =>
        (b.resonanceMetrics.views - a.resonanceMetrics.views) ||
        (b.resonanceMetrics.connections - a.resonanceMetrics.connections),
    )
    .slice(0, 3);

  const timeOfDayCounts = entries.reduce(
    (counts, entry) => {
      const hour = new Date(entry.createdAt).getHours();
      if (hour >= 5 && hour < 12) counts.Morning += 1;
      else if (hour >= 12 && hour < 17) counts.Afternoon += 1;
      else if (hour >= 17 && hour < 21) counts.Evening += 1;
      else counts.Night += 1;
      return counts;
    },
    { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 },
  );

  const activeTimeOfDay = Object.entries(timeOfDayCounts).reduce(
    (best, [period, count]) =>
      count > best.count ? { period, count } : best,
    { period: "Anytime", count: 0 },
  );

  const topMood = activeMood?.label ?? "Balanced";
  const wordTrendLabel = totalWords > 2500
    ? "Strong word momentum"
    : "Steady reflective cadence";

  const formatDelta = (value: number) =>
    `${value >= 0 ? "+" : ""}${value}`;

  const formatCount = (value: number) =>
    value.toLocaleString();

  const now = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  const thisWeekStart = now - oneWeekMs;
  const priorWeekStart = now - 2 * oneWeekMs;

  const thisWeekEntries = entries.filter((entry) =>
    new Date(entry.createdAt).getTime() >= thisWeekStart
  );
  const priorWeekEntries = entries.filter((entry) => {
    const time = new Date(entry.createdAt).getTime();
    return time >= priorWeekStart && time < thisWeekStart;
  });

  const thisWeekThreads = threads.filter((thread) =>
    new Date(thread.updatedAt).getTime() >= thisWeekStart
  );
  const priorWeekThreads = threads.filter((thread) => {
    const time = new Date(thread.updatedAt).getTime();
    return time >= priorWeekStart && time < thisWeekStart;
  });

  const reflectionDelta = thisWeekEntries.length - priorWeekEntries.length;
  const synthesisDelta = thisWeekThreads.length - priorWeekThreads.length;

  const moodWordCounts = entries.reduce<Record<string, number>>((memo, entry) => {
    const moodKey = entry.mood === "custom" && entry.customMood
      ? entry.customMood
      : entry.mood;
    memo[moodKey] = (memo[moodKey] || 0) + entry.wordCount;
    return memo;
  }, {});

  const moodBalanceScore = moodStats.length > 0
    ? Math.max(
      18,
      Math.round(
        (1 - (moodStats[0].count / moodStats.reduce(
          (sum, mood) => sum + mood.count,
          0,
        ))) * 100,
      ),
    )
    : 50;

  const topMoodOutputCount = moodStats[0]
    ? moodWordCounts[moodStats[0].mood] ?? 0
    : 0;

  const focusLens = [
    {
      label: "Reflections",
      title: "Written entries",
      value: `${entries.length} total`,
      icon: Icons.BookOpen,
    },
    {
      label: "Syntheses",
      title: "AI Extractions",
      value: `${totalSyntheses} threads`,
      icon: Icons.Zap,
    },
    {
      label: "Highest mood",
      title: topMood,
      value: `${activeMood?.count ?? 0} entries`,
      icon: Icons.Sparkles,
    },
    {
      label: "Peak time",
      title: activeTimeOfDay.period,
      value: `${activeTimeOfDay.count} entries`,
      icon: Icons.Clock,
    },
  ];

  const mirrorInsights = [
    `Steady cadence: ${thisWeekEntries.length} reflections this week (${formatDelta(reflectionDelta)}).`,
    `Charged mood leads with ${formatCount(topMoodOutputCount)} words written in state.`,
    `You've captured ${totalSyntheses} cognitive threads over time.`,
  ];

  const suggestions = [
    "Log a new private reflection.",
    "Review your latest synthesis.",
    "Tune into your strongest themes.",
  ];

  // Interactive Aura State
  const activeTheme = topThemes[0] || null;
  const resonanceScore = user?.resonance.resonanceScore || 0;

  const getAuraLevel = () => {
    if (resonanceScore >= 80) return 3;
    if (resonanceScore >= 40) return 2;
    return 1;
  };

  const auraLevel = getAuraLevel();

  const getAuraColor = () => {
    if (activeTheme) {
      return "from-canvas-primary via-emerald-500 to-indigo-500 shadow-[0_0_100px_rgba(16,185,129,0.3)]";
    }
    if (auraLevel === 3) {
      return "from-fuchsia-500 via-purple-500 to-indigo-500 shadow-[0_0_80px_rgba(168,85,247,0.4)]";
    }
    if (auraLevel === 2) {
      return "from-purple-500/50 via-indigo-500/50 to-blue-500/50 shadow-[0_0_40px_rgba(99,102,241,0.2)]";
    }
    return "from-gray-700 via-gray-600 to-gray-800 shadow-none opacity-40";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-4 pb-32 flex flex-col items-center animate-in fade-in duration-1000 overflow-hidden relative">
      {/* Background ambient glow based on Aura */}
      <div
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-20 pointer-events-none transition-all duration-1000 mix-blend-screen"
        style={{
          background: activeTheme
            ? "var(--muse-accent)"
            : auraLevel === 3
            ? "#a855f7"
            : auraLevel === 2
            ? "#6366f1"
            : "#374151",
        }}
      />

      <div className="w-full space-y-16 relative z-10">
        {/* INTERACTIVE HERO: THE AURA */}
        <section className="flex flex-col lg:flex-row items-center justify-center gap-12 px-4 md:px-8 min-h-[40vh]">
          <div className="flex-1 space-y-6 text-center lg:text-left z-20">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 flex items-center justify-center lg:justify-start gap-2">
              <Icons.ScanFace
                size={14}
                className={auraLevel === 3
                  ? "text-purple-400"
                  : "text-gray-400"}
              />
              Live Cognitive Mirror
            </h2>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] text-white">
              Level {auraLevel}
              <br />
              <span className="italic font-serif text-gray-400 font-light">
                Resonance.
              </span>
            </h1>
            <p className="max-w-md mx-auto lg:mx-0 text-gray-500 text-lg leading-relaxed font-serif italic opacity-90">
              {activeTheme
                ? `The mirror is currently tuning into "${activeTheme}". Your network is reflecting the theme's pulse.`
                : mirrorSummary}
            </p>
            <div className="grid grid-cols-1 gap-3 mt-8 text-xs font-bold uppercase tracking-[0.25em] text-gray-400 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  icon: Icons.Book,
                  label: "Reflections",
                  value: entries.length,
                  color: "text-emerald-400",
                },
                {
                  icon: Icons.PenTool,
                  label: "Total Words",
                  value: totalWords,
                  color: "text-canvas-primary",
                },
                {
                  icon: Icons.Star,
                  label: "Deep Insights",
                  value: totalFavorites,
                  color: "text-violet-400",
                },
                {
                  icon: Icons.Zap,
                  label: "Syntheses",
                  value: totalSyntheses,
                  color: "text-orange-400",
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="flex items-center justify-between gap-3 p-4 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <metric.icon size={18} className={metric.color} />
                    <div>
                      <div className="text-2xl font-semibold text-white">
                        {metric.value}
                      </div>
                      <div className="text-[10px] tracking-[0.3em] text-gray-400">
                        {metric.label}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative w-full h-[400px]">
            {/* THE AURA ORB */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-tr blur-3xl transition-all duration-1000 ease-in-out ${getAuraColor()} ${
                  activeTheme ? "animate-pulse scale-110" : "scale-100"
                }`}
              />

              <div className="relative z-10 w-40 h-40 md:w-48 md:h-48 rounded-full border border-white/10 bg-[#050505]/80 backdrop-blur-2xl flex flex-col items-center justify-center shadow-[inset_0_0_40px_rgba(255,255,255,0.05)]">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-2">
                  Resonance
                </span>
                <span
                  className={`text-5xl md:text-6xl font-bold tracking-tighter transition-all duration-1000 ${
                    auraLevel === 3
                      ? "text-white"
                      : auraLevel === 2
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  {resonanceScore}
                  <span className="text-2xl text-gray-600">%</span>
                </span>
              </div>

              {/* Orbiting metrics based on Level */}
              <div
                className={`absolute w-full h-full animate-[spin-slow_15s_linear_infinite] transition-opacity duration-1000 ${
                  auraLevel > 1 ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center shadow-lg">
                  <Icons.Layers size={14} className="text-indigo-400" />
                </div>
              </div>
              <div
                className={`absolute w-[130%] h-[130%] animate-[spin-reverse_20s_linear_infinite] transition-opacity duration-1000 ${
                  auraLevel === 3 ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="absolute bottom-0 right-1/4 w-10 h-10 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center shadow-lg">
                  <Icons.Flame size={14} className="text-orange-400" />
                </div>
              </div>
              {activeTheme && (
                <div
                  className={`absolute w-[110%] h-[110%] animate-[spin-slow_8s_linear_infinite] transition-opacity duration-500`}
                >
                  <div className="absolute top-1/2 -left-4 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <Icons.Brain size={12} className="text-emerald-400" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* LOADING / ERROR */}
        {stats.isLoading && (
          <div className="flex flex-col items-center justify-center py-20 w-full">
            <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            <p className="mt-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              Calibrating Resonance...
            </p>
          </div>
        )}

        {stats.error && (
          <div className="px-4 md:px-8 w-full">
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3">
              <Icons.AlertCircle size={20} className="text-rose-500" />
              <p className="text-rose-400 text-sm font-bold">{stats.error}</p>
            </div>
          </div>
        )}

        {!stats.isLoading && !stats.error && (
          <>
            {/* PRIVATE INTROSPECTION KPIs */}
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 px-4 md:px-8 pt-4">
              {focusLens.map((lens) => (
                <div
                  key={lens.label}
                  className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-5 shadow-xl flex items-center gap-4 hover:border-canvas-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <lens.icon size={20} className="text-canvas-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
                      {lens.label}
                    </p>
                    <p className="text-lg font-semibold text-white leading-tight">{lens.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{lens.title}</p>
                  </div>
                </div>
              ))}
            </section>

            <section className="px-4 md:px-8 w-full grid gap-6 lg:grid-cols-[1.3fr_0.95fr] pt-8">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 h-full">
                  <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 shadow-xl flex flex-col justify-between">
                    <PieChart data={moodDistribution} title="Mood × Output" />
                    <div className="mt-6 rounded-3xl border border-white/5 bg-[#111418] p-4 text-sm text-white">
                      <div className="font-semibold text-white">{topMood} + {formatCount(topMoodOutputCount)} words</div>
                      <div className="mt-2 text-gray-400">Balance score {moodBalanceScore}%</div>
                    </div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 shadow-xl flex flex-col justify-center">
                    <PieChart data={contentDistribution} title="Content Mix" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 shadow-xl">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
                        Signal health
                      </p>
                      <p className="text-lg font-semibold text-white mt-2">
                        {resonanceScore}%
                      </p>
                    </div>
                    <div className="text-sm text-gray-400">{wordTrendLabel}</div>
                  </div>
                  <div className="rounded-full bg-white/5 h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-canvas-primary to-emerald-400"
                      style={{ width: `${resonanceScore}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 shadow-xl h-[calc(100%-140px)]">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-4">
                    Mirror insights
                  </p>
                  <ul className="space-y-3 text-sm text-gray-300">
                    {mirrorInsights.map((insight) => (
                      <li key={insight} className="flex gap-3 items-start">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-canvas-primary shrink-0" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 text-[10px] uppercase tracking-[0.3em] text-gray-500">
                    Next actions
                  </div>
                  <div className="mt-3 grid gap-3">
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion}
                        className="rounded-2xl border border-white/5 bg-white/[0.01] p-3 text-sm text-gray-300"
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* COGNITIVE ACTIVITY & HEATMAP */}
            <section className="px-4 md:px-8 w-full pt-16 border-t border-white/5 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12">
              <div className="space-y-12">
                <div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 mb-6">
                    <Icons.Activity size={14} className="text-amber-400" />
                    Cognitive Density (Heatmap)
                  </h2>
                  <div className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 p-6 md:p-10 shadow-xl overflow-x-auto relative">
                    {activeTheme && (
                      <div className="absolute inset-0 bg-[#050505]/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center animate-in fade-in rounded-[2.5rem]">
                        <Icons.Radar
                          size={32}
                          className="text-canvas-primary mb-3 animate-[spin-slow_5s_linear_infinite]"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-canvas-primary">
                          Scanning timeline for #{activeTheme}...
                        </span>
                      </div>
                    )}
                    <ActivityHeatmap data={heatmap} />
                  </div>
                </div>


              </div>

              <div className="space-y-12">
                <div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 mb-6">
                    <Icons.Radar size={14} className="text-purple-400" />
                    Cognitive Aura Profile
                  </h2>
                  <div className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 shadow-xl mb-12">
                    <RadarChart
                      data={radarData}
                      color={activeTheme ? "#22d3ee" : "#a855f7"}
                      title=""
                    />
                  </div>

                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 mb-6">
                    <Icons.PieChart size={14} className="text-blue-400" />
                    Content Synthesis Distribution
                  </h2>
                  <div className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 p-6 md:p-10 shadow-xl">
                    <PieChart data={contentDistribution} title="" />
                  </div>
                </div>

                <div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 mb-6">
                    <Icons.Clock size={14} className="text-rose-400" />
                    Live Event Stream
                  </h2>
                  <div className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 p-6 md:p-8 shadow-xl">
                    <ActivityTimeline activities={stats.activity.slice(0, 6)} />
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
