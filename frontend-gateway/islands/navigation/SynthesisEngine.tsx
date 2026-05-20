import { Activity, Plus } from "lucide-preact";
import { toggleCapture } from "../../signals/ui.ts";

export default function SynthesisEngine() {
  return (
    <div className="fixed bottom-24 right-6 z-[200] flex flex-col gap-3">
      {/* MIRROR FLOATING BUBBLE */}
      <a
        href="/mirror"
        title="Mirror Insights"
        className="w-12 h-12 rounded-full flex items-center justify-center bg-canvas-primary/10 border border-canvas-primary/30 text-canvas-primary hover:bg-canvas-primary/20 transition-all duration-300 shadow-[0_0_15px_rgba(var(--muse-accent-rgb),0.2)] hover:shadow-[0_0_20px_rgba(var(--muse-accent-rgb),0.4)] opacity-80 hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md animate-in slide-in-from-bottom-4 duration-500"
      >
        <Activity size={18} />
      </a>

      {/* REMEMBER / SYNTHESIZE TRIGGER */}
      <button
        type="button"
        onClick={toggleCapture}
        title="Remember / Synthesize Link"
        className="w-14 h-14 rounded-full flex items-center justify-center bg-canvas-primary border border-canvas-primary/50 text-white hover:bg-canvas-primary hover:brightness-110 transition-all duration-300 shadow-[0_0_15px_rgba(var(--muse-accent-rgb),0.4)] hover:shadow-[0_0_25px_rgba(var(--muse-accent-rgb),0.6)] opacity-90 hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md animate-in slide-in-from-bottom-5 duration-600 relative overflow-hidden"
      >
        <Plus size={22} className="relative z-10 drop-shadow-md" />
        <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </button>
    </div>
  );
}
