import * as Icons from "lucide-preact";
import { useState } from "preact/hooks";
import { toggleCapture } from "../../signals/ui.ts";
import StreakDashboard from "../streaks/StreakDashboard.tsx";

export default function SynthesisEngine() {
  const [isStreakOpen, setIsStreakOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-24 right-6 z-[200] flex flex-col gap-3 items-center">
        {/* STREAK FLOATING BUBBLE */}
        <button
          type="button"
          onClick={() => setIsStreakOpen(true)}
          title="Cognitive Momentum"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-rose-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition-all duration-300 shadow-[inset_0_2px_8px_rgba(255,255,255,0.1),0_0_12px_rgba(249,115,22,0.3)] hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-400"
        >
          {/* @ts-ignore dynamic import */}
          <Icons.Flame size={18} />
        </button>

        {/* MIRROR FLOATING BUBBLE */}
      <a
        href="/mirror"
        title="Mirror Insights"
        className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-tr from-[var(--muse-surface)] via-[var(--muse-overlay)] to-canvas-primary/20 border border-[var(--muse-border)] text-[var(--muse-text)] hover:bg-[var(--muse-surface-soft)] transition-all duration-300 shadow-[inset_0_4px_10px_rgba(255,255,255,0.1),0_0_15px_rgba(var(--muse-accent-rgb),0.2)] hover:shadow-[inset_0_4px_15px_rgba(255,255,255,0.2),0_0_20px_rgba(var(--muse-accent-rgb),0.4)] opacity-90 hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-500"
      >
        <Icons.Gauge size={20} />
      </a>

      {/* REMEMBER / SYNTHESIZE TRIGGER */}
      <button
        type="button"
        onClick={toggleCapture}
        title="Remember / Synthesize Link"
        className="w-14 h-14 rounded-full flex items-center justify-center bg-canvas-primary border border-canvas-primary/50 text-white hover:bg-canvas-primary hover:brightness-110 transition-all duration-300 shadow-[0_0_15px_rgba(var(--muse-accent-rgb),0.4)] hover:shadow-[0_0_25px_rgba(var(--muse-accent-rgb),0.6)] opacity-90 hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md animate-in slide-in-from-bottom-5 duration-600 relative overflow-hidden"
      >
        <Icons.Plus size={22} className="relative z-10 drop-shadow-md" />
        <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </button>
    </div>
    
    {isStreakOpen && (
      <StreakDashboard isOpen={isStreakOpen} onClose={() => setIsStreakOpen(false)} />
    )}
    </>
  );
}
