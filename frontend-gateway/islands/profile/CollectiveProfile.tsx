import { userSignal } from "../../signals/user.ts";
import { threadsSignal } from "../../signals/threads.ts";
import {
  Activity,
  ArrowUpRight,
  Award,
  Cpu,
  Flame,
  GitCommit,
  Globe,
  Layers,
  Shield,
  Zap,
} from "lucide-preact";
import { type Thread } from "../../signals/threads.ts";

export default function CollectiveProfile() {
  const user = userSignal.value;
  const threads = threadsSignal.value.filter((t: Thread) => t.isPublic);

  return (
    <div className="pb-24 md:pb-10 min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* DYNAMIC AURA BACKGROUND */}
      <div
        className="fixed inset-0 pointer-events-none blur-[140px] opacity-20 transition-all duration-1000"
        style={{
          background:
            `radial-gradient(circle at center, ${user.auraColor} 0%, transparent 70%)`,
        }}
      />

      <header className="relative w-full h-[50vh] min-h-[450px] flex flex-col items-center justify-center text-center p-6 pt-24">
        <div className="relative mb-10 group">
          <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150 animate-pulse" />
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-black/40 border-4 border-white/10 flex items-center justify-center relative z-10 overflow-hidden shadow-3xl">
            <span className="text-4xl md:text-5xl font-bold text-white">
              {user.name[0]}
            </span>
            {/* AURA TYPE BADGE */}
            <div className="absolute bottom-0 left-0 right-0 bg-canvas-primary/90 py-2 text-[8px] font-bold uppercase tracking-[0.2em] text-white">
              {user.auraType}
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
          {user.name}
        </h1>
        <div className="flex items-center gap-6 mb-12">
          <div className="flex items-center gap-2 text-canvas-primary">
            <Flame size={16} className="animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">
              {user.cognitiveStreak} Day Streak
            </span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-emerald-500">
            <Activity size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">
              {user.resonance.resonanceScore}% Resonance
            </span>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide max-w-full">
          {[
            {
              label: "Intelligence Lineage",
              value: user.synthesisLineage.totalRooms,
              sub: "Source Rooms",
              icon: Layers,
            },
            {
              label: "Woven Synthesis",
              value: user.synthesisLineage.wovenThreads,
              sub: "Public Threads",
              icon: GitCommit,
            },
            {
              label: "Cognitive Impact",
              value: user.resonance.connections,
              sub: "Resonance Conn.",
              icon: Zap,
            },
            {
              label: "Signal Stream",
              value: user.synthesisLineage.totalArtifacts,
              sub: "Sovereign Nodes",
              icon: Cpu,
            },
          ].map((stat: any) => (
            <div
              key={stat.label}
              className="min-w-[200px] flex-shrink-0 snap-start p-6 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-md"
            >
              <stat.icon size={18} className="text-gray-600 mx-auto mb-4" />
              <div className="text-2xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </header>

      <main className="p-6 md:p-10 max-w-[1800px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* COGNITIVE IDENTITY CARD */}
          <div className="lg:col-span-1 space-y-8">
            <section className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 mb-8 flex items-center gap-3">
                <Shield size={14} className="text-canvas-primary" />{" "}
                Collective Soul
              </h3>
              <p className="text-lg text-gray-300 font-serif italic leading-relaxed mb-10">
                "A master of raw forms and cognitive sovereignty. Your patterns
                focus on the intersection of brutalist honesty and stoic
                resilience."
              </p>
              <div className="space-y-4">
                <div className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
                  Primary Resonance Clusters
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.weeklyInsights.topThemes.map((theme: string) => (
                    <span
                      key={theme}
                      className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white hover:border-canvas-primary/40 transition-colors cursor-pointer"
                    >
                      #{theme}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 flex flex-col items-center text-center">
              <Award size={40} className="text-amber-500 mb-6" />
              <h4 className="text-lg font-bold text-white uppercase tracking-widest mb-2">
                Architect of Pattern
              </h4>
              <p className="text-xs text-gray-500 font-serif italic mb-8">
                Awarded for woven synthesis involving 10+ source rooms.
              </p>
              <button
                type="button"
                className="w-full py-4 bg-white/5 border border-white/10 text-gray-400 font-bold uppercase tracking-widest text-[9px] rounded-2xl hover:text-white transition-all"
              >
                View Credentials
              </button>
            </section>
          </div>

          {/* WOVEN KNOWLEDGE SHOWCASE */}
          <div className="lg:col-span-2 space-y-12">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 flex items-center gap-3">
                <Globe size={14} className="text-emerald-500" />{" "}
                Public Synthesis Stream
              </h3>
              <button
                type="button"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
              >
                View All Patterns
              </button>
            </div>

            <div className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {threads.map((thread: Thread) => (
                <div
                  key={thread.id}
                  className="min-w-[360px] flex-shrink-0 snap-start group bg-[#111] border border-white/5 rounded-[3rem] overflow-hidden hover:border-white/20 transition-all duration-500 shadow-2xl"
                >
                  <div className="h-48 relative overflow-hidden">
                    {thread.coverImage
                      ? (
                        <img
                          src={thread.coverImage}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          alt=""
                        />
                      )
                      : <div className="w-full h-full bg-white/5" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-8 flex items-center gap-3">
                      <div className="px-3 py-1 bg-canvas-primary/90 rounded-lg text-[8px] font-bold uppercase tracking-[0.2em] text-white">
                        {thread.synthesisScore}% Synthesis
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <h4 className="text-xl font-bold text-white mb-4 group-hover:text-canvas-primary transition-colors">
                      {thread.title}
                    </h4>
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-700">
                          {thread.resonanceMetrics.connections} Connections
                        </span>
                      </div>
                      <ArrowUpRight
                        size={16}
                        className="text-gray-700 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
