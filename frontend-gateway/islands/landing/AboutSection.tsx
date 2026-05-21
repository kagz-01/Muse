import * as Icons from "lucide-preact";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="max-w-[1800px] mx-auto px-6 md:px-10 py-32 space-y-20 relative border-t border-[var(--muse-border)] transition-colors duration-300"
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4 relative z-10">
        <div className="max-w-3xl">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--muse-muted)] mb-6 flex items-center gap-3 transition-colors duration-300">
            <Icons.Target size={14} /> Our Mission
          </h2>
          <h3 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--muse-text)] leading-tight transition-colors duration-300">
            Elevating Human{" "}
            <span className="text-canvas-primary italic font-serif">
              Consciousness.
            </span>
          </h3>
        </div>
        <p className="text-[var(--muse-muted)] font-serif italic text-lg md:text-xl max-w-sm transition-colors duration-300">
          A sanctuary from the noise. We build tools that help you synthesize
          meaning from chaos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="bg-[var(--muse-surface)] border border-[var(--muse-border)] rounded-[2.5rem] p-12 hover:bg-[var(--muse-surface-soft)] transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-canvas-primary/10 flex items-center justify-center text-canvas-primary mb-8">
            <Icons.Globe size={28} />
          </div>
          <h4 className="text-2xl font-bold text-[var(--muse-text)] mb-4 tracking-tight transition-colors duration-300">
            The Vision
          </h4>
          <p className="text-[var(--muse-muted)] font-serif text-lg leading-relaxed transition-colors duration-300">
            We envision a digital ecosystem where attention is a sovereign
            asset, not a commodity. Muse acts as your personal cognitive
            mirror—a place where ideas compound, evolve, and transcend ephemeral
            feeds.
          </p>
        </div>

        <div className="bg-[var(--muse-surface)] border border-[var(--muse-border)] rounded-[2.5rem] p-12 hover:bg-[var(--muse-surface-soft)] transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[var(--muse-surface-soft)] flex items-center justify-center text-[var(--muse-text)] mb-8 transition-colors duration-300">
            <Icons.Lightbulb size={28} />
          </div>
          <h4 className="text-2xl font-bold text-[var(--muse-text)] mb-4 tracking-tight transition-colors duration-300">
            The System
          </h4>
          <p className="text-[var(--muse-muted)] font-serif text-lg leading-relaxed transition-colors duration-300">
            A high-fidelity architecture combining end-to-end encrypted vaults,
            AI-driven synthesis engines, and fluid spatial interfaces. Muse
            translates your scattered thoughts into a structured ledger of
            intelligence.
          </p>
        </div>
      </div>
    </section>
  );
}
