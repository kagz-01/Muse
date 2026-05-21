import { userSignal } from "../../signals/user.ts";
import * as Icons from "lucide-preact";

export default function IntelligencePulse() {
  const user = userSignal.value;
  const { resonanceScore, topThemes, synthesisCount } = user.weeklyInsights;

  return (
    <div className="bg-[#111318] border border-white/10 rounded-[3rem] p-10 md:p-12 relative overflow-hidden shadow-3xl">
      <div className="absolute top-0 right-0 h-full w-1/3 bg-canvas-primary/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 space-y-10">
        <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 flex items-center gap-3">
            <Icons.Activity size={14} className="text-canvas-primary" /> Intelligence Pulse
          </h3>
          <div className="flex items-center gap-3 px-4 py-1.5 bg-canvas-primary/10 border border-canvas-primary/30 rounded-xl">
            <Icons.Flame size={14} className="text-canvas-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-canvas-primary">
              {user.cognitiveStreak} Day Streak
            </span>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          <div className="min-w-[220px] md:min-w-[260px] snap-start p-8 bg-white/2 border border-white/5 rounded-[2.5rem] text-center">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mb-2">
              Weekly Resonance
            </p>
            <div className="text-4xl font-bold text-white mb-2">
              {resonanceScore}%
            </div>
            <div className="flex items-center justify-center gap-2 text-emerald-500 text-[10px] font-bold">
              <Icons.TrendingUp size={12} /> +12% from last week
            </div>
          </div>

          <div className="min-w-[220px] md:min-w-[260px] snap-start p-8 bg-white/2 border border-white/5 rounded-[2.5rem] text-center">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mb-2">
              Active Syntheses
            </p>
            <div className="text-4xl font-bold text-white mb-2">
              {synthesisCount}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Live Threads
            </p>
          </div>

          <div className="min-w-[260px] md:min-w-[300px] snap-start p-8 bg-white/2 border border-white/5 rounded-[2.5rem] text-center flex flex-col justify-center">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mb-4">
              Top Cognitive Themes
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {topThemes.map((theme) => (
                <span
                  key={theme}
                  className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[8px] font-bold uppercase tracking-widest text-white"
                >
                  #{theme}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-canvas-primary/5 border border-canvas-primary/20 rounded-[2.5rem] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-canvas-primary/20 flex items-center justify-center text-canvas-primary">
              <Icons.Aperture size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-widest">
                Cognitive Blueprint Ready
              </h4>
              <p className="text-[10px] text-gray-500 font-serif italic">
                The AI has synthesized a new pattern from your recent
                reflections.
              </p>
            </div>
          </div>
          <button type="button" className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-[9px] rounded-xl hover:-translate-y-1 transition-all">
            Review Blueprint
          </button>
        </div>
      </div>
    </div>
  );
}
