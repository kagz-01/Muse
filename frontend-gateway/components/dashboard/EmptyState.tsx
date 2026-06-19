import * as Icons from "lucide-preact";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export default function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center animate-in fade-in zoom-in-95 duration-700">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-canvas-primary/20 blur-3xl rounded-full animate-pulse" />
        <div className="relative w-24 h-24 bg-[var(--muse-surface)] border border-[var(--muse-border)] rounded-[2rem] shadow-2xl flex items-center justify-center rotate-3 hover:rotate-6 transition-transform duration-500 cursor-default">
          <Icons.Inbox size={40} className="text-[var(--muse-muted)]" />
        </div>
      </div>
      
      <h2 className="text-3xl font-bold tracking-tight text-[var(--muse-text)] mb-4">
        Your Canvas is Empty
      </h2>
      <p className="text-[var(--muse-muted)] text-lg mb-10 max-w-lg leading-relaxed font-serif italic">
        "The mind that is anxious about future events is miserable."
        <br />
        <span className="text-sm font-sans not-italic block mt-4">— Seneca. Let's organize the chaos.</span>
      </p>

      <button
        onClick={onCreateClick}
        className="group relative px-8 py-4 rounded-full bg-[var(--muse-text)] text-[var(--muse-bg)] font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_var(--muse-text)]/10 hover:shadow-[0_0_40px_var(--muse-text)]/30 hover:-translate-y-1 active:scale-95 transition-all overflow-hidden"
      >
        <div className="absolute inset-0 bg-canvas-primary/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
        <span className="relative z-10 flex items-center gap-3 text-xs">
          <Icons.Plus size={16} />
          Initialize First Room
        </span>
      </button>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
        <div className="p-6 rounded-2xl bg-[var(--muse-surface)]/50 border border-[var(--muse-border)]/50">
          <Icons.Link size={20} className="text-canvas-primary mb-3" />
          <h3 className="text-sm font-bold text-[var(--muse-text)] mb-2">Engulf the Web</h3>
          <p className="text-xs text-[var(--muse-muted)] leading-relaxed">Paste links, tweets, and articles. We extract the raw thought.</p>
        </div>
        <div className="p-6 rounded-2xl bg-[var(--muse-surface)]/50 border border-[var(--muse-border)]/50">
          <Icons.FileText size={20} className="text-emerald-500 mb-3" />
          <h3 className="text-sm font-bold text-[var(--muse-text)] mb-2">Upload Documents</h3>
          <p className="text-xs text-[var(--muse-muted)] leading-relaxed">PDFs, Word docs, Excel sheets. The parser handles everything.</p>
        </div>
        <div className="p-6 rounded-2xl bg-[var(--muse-surface)]/50 border border-[var(--muse-border)]/50">
          <Icons.BrainCircuit size={20} className="text-purple-500 mb-3" />
          <h3 className="text-sm font-bold text-[var(--muse-text)] mb-2">Synthesize</h3>
          <p className="text-xs text-[var(--muse-muted)] leading-relaxed">AI automatically groups artifacts into cohesive threads.</p>
        </div>
      </div>
    </div>
  );
}
