import { useMemo, useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { loadMirrorStats, mirrorSignal } from "../../signals/mirror.ts";
import { getActivityHeatmap, getStreakData, journalSignal } from "../../signals/journal.ts";
import { activeThemesSignal } from "../../signals/connections.ts";
import { streaksSignal, getStreakState as getSocialStreakState } from "../../signals/streaks.ts";
import { userSignal } from "../../signals/user.ts";
import ActivityTimeline from "../../components/mirror/ActivityTimeline.tsx";
import { LineChart, PieChart } from "../../components/mirror/MirrorCharts.tsx";
import StreakCard from "./StreakCard.tsx";
import ActivityHeatmap from "./ActivityHeatmap.tsx";

export default function MirrorDashboard() {
  const currentUserId = "user-123";

  useEffect(() => {
    loadMirrorStats(currentUserId);
  }, []);

  const stats = mirrorSignal.value;
  const streakData = getStreakData();
  const entries = journalSignal.value;
  const user = userSignal.value;
  const topThemes = activeThemesSignal.value.slice(0, 8);
  const socialStreaks = streaksSignal.value.filter((s) => getSocialStreakState(s) !== "broken");

  const heatmap = useMemo(() => {
    return getActivityHeatmap();
  }, [entries]);

  // Interactive Aura State
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const resonanceScore = user?.resonance.resonanceScore || 0;
  
  const getAuraLevel = () => {
    if (resonanceScore >= 80) return 3;
    if (resonanceScore >= 40) return 2;
    return 1;
  };

  const auraLevel = getAuraLevel();

  const getAuraColor = () => {
    if (activeTheme) return "from-canvas-primary via-emerald-500 to-indigo-500 shadow-[0_0_100px_rgba(16,185,129,0.3)]";
    if (auraLevel === 3) return "from-fuchsia-500 via-purple-500 to-indigo-500 shadow-[0_0_80px_rgba(168,85,247,0.4)]";
    if (auraLevel === 2) return "from-purple-500/50 via-indigo-500/50 to-blue-500/50 shadow-[0_0_40px_rgba(99,102,241,0.2)]";
    return "from-gray-700 via-gray-600 to-gray-800 shadow-none opacity-40";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-4 pb-32 flex flex-col items-center animate-in fade-in duration-1000 overflow-hidden relative">
      
      {/* Background ambient glow based on Aura */}
      <div 
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-20 pointer-events-none transition-all duration-1000 mix-blend-screen"
        style={{ background: activeTheme ? 'var(--muse-accent)' : auraLevel === 3 ? '#a855f7' : auraLevel === 2 ? '#6366f1' : '#374151' }}
      />

      <div className="w-full space-y-16 relative z-10">
        
        {/* INTERACTIVE HERO: THE AURA */}
        <section className="flex flex-col lg:flex-row items-center justify-center gap-12 px-4 md:px-8 min-h-[40vh]">
          
          <div className="flex-1 space-y-6 text-center lg:text-left z-20">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 flex items-center justify-center lg:justify-start gap-2">
               <Icons.ScanFace size={14} className={auraLevel === 3 ? "text-purple-400" : "text-gray-400"} /> 
               Live Cognitive Mirror
            </h2>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] text-white">
              Level {auraLevel}<br />
              <span className="italic font-serif text-gray-400 font-light">Resonance.</span>
            </h1>
            <p className="max-w-md mx-auto lg:mx-0 text-gray-500 text-lg leading-relaxed font-serif italic opacity-90">
              {activeTheme 
                ? `You are currently analyzing the "${activeTheme}" network.` 
                : "Your neural footprint is stabilizing. Interact with the metrics below to focus the mirror."}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 pt-4">
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
                <Icons.Activity size={14} className="text-emerald-400" />
                Score: {resonanceScore}%
              </span>
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
                <Icons.Network size={14} className="text-indigo-400" />
                {stats.followerCount} Nodes
              </span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative w-full h-[400px]">
             {/* THE AURA ORB */}
             <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full bg-gradient-to-tr blur-3xl transition-all duration-1000 ease-in-out ${getAuraColor()} ${activeTheme ? 'animate-pulse scale-110' : 'scale-100'}`} />
                
                <div className="relative z-10 w-40 h-40 md:w-48 md:h-48 rounded-full border border-white/10 bg-[#050505]/80 backdrop-blur-2xl flex flex-col items-center justify-center shadow-[inset_0_0_40px_rgba(255,255,255,0.05)]">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-2">Resonance</span>
                  <span className={`text-5xl md:text-6xl font-bold tracking-tighter transition-all duration-1000 ${auraLevel === 3 ? 'text-white' : auraLevel === 2 ? 'text-gray-300' : 'text-gray-600'}`}>
                    {resonanceScore}<span className="text-2xl text-gray-600">%</span>
                  </span>
                </div>

                {/* Orbiting metrics based on Level */}
                <div className={`absolute w-full h-full animate-[spin-slow_15s_linear_infinite] transition-opacity duration-1000 ${auraLevel > 1 ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center shadow-lg">
                    <Icons.Layers size={14} className="text-indigo-400" />
                  </div>
                </div>
                <div className={`absolute w-[130%] h-[130%] animate-[spin-reverse_20s_linear_infinite] transition-opacity duration-1000 ${auraLevel === 3 ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="absolute bottom-0 right-1/4 w-10 h-10 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center shadow-lg">
                    <Icons.Flame size={14} className="text-orange-400" />
                  </div>
                </div>
                {activeTheme && (
                  <div className={`absolute w-[110%] h-[110%] animate-[spin-slow_8s_linear_infinite] transition-opacity duration-500`}>
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
            <p className="mt-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold">Calibrating Resonance...</p>
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
            {/* THE RESONANCE METRICS STRIP */}
            <section className="flex flex-wrap items-center gap-4 p-2 bg-white/[0.02] border-y md:border border-white/5 md:rounded-full backdrop-blur-3xl shadow-2xl w-full">
              {[
                { icon: Icons.ArrowUpCircle, value: stats.stats.likes, label: "Upvotes", color: "text-emerald-400" },
                { icon: Icons.Eye, value: stats.stats.views, label: "Impressions", color: "text-canvas-primary" },
                { icon: Icons.MessageSquare, value: stats.stats.comments, label: "Extensions", color: "text-amber-400" },
                { icon: Icons.Network, value: stats.followerCount, label: "Network Size", color: "text-violet-400" },
              ].map((m, i) => (
                <div key={i} className={`flex-1 flex items-center justify-between px-6 py-4 ${i < 3 ? "border-r border-white/5" : ""}`}>
                  <div className="flex items-center gap-3">
                    <m.icon size={18} className={m.color} />
                    <span className="text-2xl font-bold text-white font-mono">{m.value}</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold hidden sm:block">{m.label}</span>
                </div>
              ))}
            </section>

            {/* THEME & CONNECTION TRENDS */}
            <section className="px-4 md:px-8 w-full grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 pt-8">
              
              <div className="space-y-6">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                  <Icons.Brain size={14} className="text-canvas-primary" />
                  Interactive Theme Trends
                </h2>
                <div className="flex flex-wrap gap-3">
                  {topThemes.length > 0 ? topThemes.map((theme, i) => {
                    const isActive = activeTheme === theme;
                    return (
                      <button
                        type="button"
                        key={theme}
                        onMouseEnter={() => setActiveTheme(theme)}
                        onMouseLeave={() => setActiveTheme(null)}
                        className={`group flex items-center gap-3 px-5 py-4 rounded-[2rem] border transition-all hover:scale-105 hover:shadow-2xl cursor-pointer
                          ${isActive ? 'bg-canvas-primary/10 border-canvas-primary/30 text-white' : 'bg-white/[0.02] border-white/5 text-gray-300'}`}
                      >
                        <span className={`text-xs font-mono transition-colors ${isActive ? 'text-canvas-primary/80' : 'text-gray-500/50'}`}>{(i+1).toString().padStart(2, '0')}</span>
                        #{theme}
                        <Icons.TrendingUp size={14} className={`${isActive ? 'text-canvas-primary opacity-100' : 'text-emerald-400 opacity-20'} transition-opacity ml-2`} />
                      </button>
                    )
                  }) : (
                    <span className="text-sm italic font-serif text-gray-500">Not enough data to analyze themes.</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-serif italic mt-6 border-l-2 border-white/10 pl-4 leading-relaxed max-w-xl transition-all">
                  {activeTheme ? `Focusing Mirror on #${activeTheme}... The aura has shifted to reflect this specific pattern density.` : `Hover over any theme to focus the Mirror and shift your Aura projection.`}
                </p>
              </div>

              <div className="space-y-8">
                 <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                  <Icons.GitMerge size={14} className="text-indigo-400" />
                  Network Momentum
                </h2>
                <div className={`bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 shadow-xl transition-all duration-500 ${activeTheme ? 'border-canvas-primary/20 shadow-[0_0_30px_rgba(34,211,238,0.1)]' : ''}`}>
                  <LineChart 
                    data={stats.followerHistory.map(h => h.count)} 
                    title="" 
                    color={activeTheme ? "#22d3ee" : "#818cf8"} 
                  />
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
                         <Icons.Radar size={32} className="text-canvas-primary mb-3 animate-[spin-slow_5s_linear_infinite]" />
                         <span className="text-[10px] font-bold uppercase tracking-widest text-canvas-primary">Scanning timeline for #{activeTheme}...</span>
                       </div>
                     )}
                     <ActivityHeatmap data={heatmap} />
                   </div>
                 </div>
                 
                 <div>
                   <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 mb-6">
                    <Icons.Zap size={14} className="text-orange-400" />
                    Synthesis Chain
                   </h2>
                   <div className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 p-6 md:p-10 shadow-xl space-y-6">
                      <StreakCard streakData={streakData} />

                      {/* Social streaks summary bridging to Streak Hub */}
                      <div className="border-t border-white/5 pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                            <Icons.Link2 size={14} className="text-indigo-400" />
                            Active Cognitive Links
                          </h3>
                          <a href="/streaks" className="text-[10px] font-bold uppercase tracking-widest text-canvas-primary hover:text-white transition-colors">
                            View All →
                          </a>
                        </div>

                        {socialStreaks.length > 0 ? (
                          <div className="space-y-2">
                            {socialStreaks.slice(0, 3).map((s) => {
                              const state = getSocialStreakState(s);
                              const isFading = state === "fading";
                              return (
                                <a 
                                  key={s.id} 
                                  href="/streaks"
                                  className={`flex items-center justify-between p-3 rounded-2xl transition-all hover:bg-white/[0.04] ${isFading ? "bg-rose-500/5 border border-rose-500/10" : "bg-white/[0.02]"}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-gray-300">
                                      {s.partnerName.charAt(0)}
                                    </div>
                                    <span className="text-sm font-bold text-gray-300">{s.partnerName}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-lg font-mono font-bold ${isFading ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
                                      {s.count}
                                    </span>
                                    <span className="text-[9px] uppercase tracking-widest text-gray-600">days</span>
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm italic font-serif text-gray-600">No active cognitive links yet.</p>
                        )}
                      </div>
                   </div>
                 </div>
               </div>

               <div className="space-y-12">
                 <div>
                   <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 mb-6">
                    <Icons.PieChart size={14} className="text-blue-400" />
                    Content Synthesis Distribution
                   </h2>
                   <div className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 p-6 md:p-10 shadow-xl">
                     <PieChart
                        data={[
                          { label: "Reflections", value: entries.length, color: "#60a5fa" },
                          { label: "Syntheses", value: stats.stats.collaborations, color: "#a78bfa" },
                          { label: "Public Broadcasts", value: entries.filter(e => e.isPublic).length, color: "#f472b6" }
                        ]}
                        title=""
                      />
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
