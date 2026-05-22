import * as Icons from "lucide-preact";

export default function LedgerSection() {
  return (
    <section
      id="ledger"
      className="w-full max-w-none px-6 md:px-10 py-32 space-y-20 relative border-t border-[var(--muse-border)] transition-colors duration-300"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
        <div className="max-w-2xl">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--muse-muted)] mb-6 flex items-center gap-3 transition-colors duration-300">
            <Icons.Database size={14} /> The Ledger
          </h2>
          <h3 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--muse-text)] leading-tight transition-colors duration-300">
            Immutable{" "}
            <span className="text-emerald-400 italic font-serif">Provenance.</span>
          </h3>
        </div>
        <p className="text-[var(--muse-muted)] font-serif italic text-lg md:text-xl max-w-sm transition-colors duration-300">
          Your thoughts belong to you. Mathematically proven, cryptographically secured, and immortalized on the collective stream.
        </p>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {[
          {
            title: "Thought Stream",
            desc:
              "Publish your internal synthesis to the global collective. Every thought carries a unique cryptographic signature.",
            icon: Icons.Activity,
            color: "text-[var(--muse-text)]",
            bg: "bg-[var(--muse-surface)]",
          },
          {
            title: "Proof of Resonance",
            desc:
              "A verifiable blockchain ledger of your intellectual growth. Watch your ideas compound and influence the network.",
            icon: Icons.Shield,
            color: "text-emerald-400",
            bg: "bg-emerald-500/5",
          },
          {
            title: "The Intelligence Loop",
            desc:
              "Real-time AI pipeline working in tandem with your journal to detect patterns and generate blueprints.",
            icon: Icons.BrainCircuit,
            color: "text-canvas-primary",
            bg: "bg-canvas-primary/5",
          },
        ].map((item) => (
          <div
            key={item.title}
            className={`${item.bg} border border-[var(--muse-border)] rounded-[2.5rem] p-10 flex flex-col gap-8 hover:scale-[1.02] transition-all duration-300 min-w-[340px] flex-shrink-0`}
          >
            <div
              className={`w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center ${item.color} transition-colors duration-300`}
            >
              <item.icon size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-[var(--muse-text)] mb-2 transition-colors duration-300">
                {item.title}
              </h4>
              <p className="text-[var(--muse-muted)] text-sm leading-relaxed transition-colors duration-300">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
