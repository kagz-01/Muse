import { useMemo, useEffect } from "preact/hooks";
import * as Icons from "lucide-preact";
import { loadMirrorStats, mirrorSignal } from "../../signals/mirror.ts";
import { getActivityHeatmap, getStreakData, journalSignal } from "../../signals/journal.ts";
import { activeThemesSignal } from "../../signals/connections.ts";
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
  const topThemes = activeThemesSignal.value.slice(0, 8); // Top 8 themes

  const heatmap = useMemo(() => {
    return getActivityHeatmap();
  }, [entries]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-4 pb-32 flex flex-col items-center animate-in fade-in duration-1000">
      
      <div className="w-full space-y-16">
        
        {/* HERO */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] text-white">
              The Mirror.<br />
              <span className="italic font-serif text-gray-400 font-light">Your cognitive reflection.</span>
            </h1>
            <p className="max-w-2xl text-gray-500 text-lg md:text-xl leading-relaxed font-serif italic opacity-90">
              A precise analysis of your thematic trends, neural connections, and how the network resonates with your thought patterns.
            </p>
          </div>

          <a 
            href="/streaks"
            className="group flex items-center gap-4 p-4 md:p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/20 transition-all cursor-pointer shadow-xl self-start md:self-auto"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <Icons.Link2 size={24} className="text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">Active Links</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">View Cognitive Streaks</p>
            </div>
            <Icons.ArrowRight size={20} className="text-gray-600 group-hover:text-white transition-colors ml-2 md:ml-6" />
          </a>
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
            {/* THE RESONANCE METRICS STRIP (Replacing Engagement Cards) */}
            <section className="flex flex-wrap items-center gap-4 p-2 bg-white/[0.02] border-y md:border border-white/5 md:rounded-full backdrop-blur-3xl shadow-2xl w-full">
              
              <div className="flex-1 flex items-center justify-between px-6 py-4 border-r border-white/5">
                <div className="flex items-center gap-3">
                  <Icons.ArrowUpCircle size={18} className="text-emerald-400" />
                  <span className="text-2xl font-bold text-white font-mono">{stats.stats.likes}</span>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold hidden sm:block">Upvotes / Resonance</span>
              </div>
              
              <div className="flex-1 flex items-center justify-between px-6 py-4 border-r border-white/5">
                <div className="flex items-center gap-3">
                  <Icons.Eye size={18} className="text-canvas-primary" />
                  <span className="text-2xl font-bold text-white font-mono">{stats.stats.views}</span>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold hidden sm:block">Impressions</span>
              </div>

              <div className="flex-1 flex items-center justify-between px-6 py-4 border-r border-white/5">
                <div className="flex items-center gap-3">
                  <Icons.MessageSquare size={18} className="text-amber-400" />
                  <span className="text-2xl font-bold text-white font-mono">{stats.stats.comments}</span>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold hidden sm:block">Extensions</span>
              </div>

              <div className="flex-1 flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <Icons.Network size={18} className="text-violet-400" />
                  <span className="text-2xl font-bold text-white font-mono">{stats.followerCount}</span>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold hidden sm:block">Network Size</span>
              </div>

            </section>

            {/* THEME & CONNECTION TRENDS */}
            <section className="px-4 md:px-8 w-full grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 pt-8">
              
              <div className="space-y-6">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                  <Icons.Brain size={14} className="text-canvas-primary" />
                  Theme Trends
                </h2>
                <div className="flex flex-wrap gap-3">
                  {topThemes.length > 0 ? topThemes.map((theme, i) => (
                    <div
                      key={theme}
                      className="group flex items-center gap-3 px-5 py-4 rounded-[2rem] bg-white/[0.02] border border-white/5 text-sm font-bold text-gray-300 transition-all hover:bg-white/[0.05] hover:border-white/20 hover:scale-105 hover:shadow-2xl cursor-default"
                    >
                      <span className="text-xs font-mono text-gray-500/50">{(i+1).toString().padStart(2, '0')}</span>
                      #{theme}
                      <Icons.TrendingUp size={14} className="text-emerald-400 opacity-20 group-hover:opacity-100 transition-opacity ml-2" />
                    </div>
                  )) : (
                    <span className="text-sm italic font-serif text-gray-500">Not enough data to analyze themes.</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-serif italic mt-6 border-l-2 border-white/10 pl-4 leading-relaxed max-w-xl">
                  These concepts form the core of your current semantic network. They represent areas of high pattern density where you spend the most cognitive effort.
                </p>
              </div>

              <div className="space-y-8">
                 <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                  <Icons.GitMerge size={14} className="text-indigo-400" />
                  Network Momentum
                </h2>
                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 shadow-xl">
                  <LineChart 
                    data={stats.followerHistory.map(h => h.count)} 
                    title="" 
                    color="#818cf8" 
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
                   <div className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 p-6 md:p-10 shadow-xl overflow-x-auto">
                     <ActivityHeatmap data={heatmap} />
                   </div>
                 </div>
                 
                 <div>
                   <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 mb-6">
                    <Icons.Zap size={14} className="text-orange-400" />
                    Synthesis Chain
                   </h2>
                   <div className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 p-6 md:p-10 shadow-xl">
                      <StreakCard streakData={streakData} />
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
