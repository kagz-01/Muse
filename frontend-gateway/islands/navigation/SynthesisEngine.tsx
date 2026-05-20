import { Activity, Plus } from "lucide-preact";
import { toggleCapture } from "../../signals/ui.ts";

export default function SynthesisEngine() {
  return (
    <div className="fixed bottom-24 right-6 z-[200] flex flex-col gap-3">
      {/* MIRROR FLOATING BUBBLE */}
      <a
        href="/mirror"
        title="Mirror Insights"
        className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--muse-surface)] border border-[var(--muse-border)] text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:border-canvas-primary/40 hover:bg-[var(--muse-surface-soft)] transition-all duration-300 shadow-xl opacity-60 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer animate-in slide-in-from-bottom-4 duration-500"
      >
        <Activity size={18} />
      </a>

      {/* REMEMBER / SYNTHESIZE TRIGGER */}
      <button
        type="button"
        onClick={toggleCapture}
        title="Remember / Synthesize Link"
        className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--muse-surface)] border border-[var(--muse-border)] text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:border-canvas-primary/40 hover:bg-[var(--muse-surface-soft)] transition-all duration-300 shadow-xl opacity-60 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer animate-in slide-in-from-bottom-5 duration-600"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
