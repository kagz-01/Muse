import * as Icons from "lucide-preact";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="w-full max-w-[1800px] mx-auto px-6 md:px-16 py-12 space-y-4 relative z-10"
    >
      {/* THE SYSTEM — cyan theme, hover: scale + rotate */}
      <div className="group relative bg-cyan-500/5 border border-cyan-500/15 rounded-2xl p-8 md:p-12 transition-all duration-500 hover:shadow-[0_0_35px_rgba(34,211,238,0.12)] hover:-translate-y-1 hover:border-cyan-400/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="shrink-0">
            <h2 className="text-[9px] font-bold uppercase tracking-[0.4em] text-cyan-400 mb-2 flex items-center gap-2">
              <Icons.Cpu size={10} className="animate-pulse" /> The System
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--muse-text)] leading-tight">
              High-Fidelity Architecture
            </h3>
          </div>
          <p className="text-[var(--muse-muted)] font-serif italic text-sm md:text-base leading-relaxed max-w-2xl group-hover:text-[var(--muse-text)] transition-colors duration-500">
            A sovereign sanctuary engineered to eliminate cognitive noise. By
            fusing Sovereign Knowledge Rooms (The Vaults), Real-time AI Feedback
            pipelines, and a high-performance, fluid Radial Menu interface, the
            system intercepts chaotic data flows and processes them into a
            structured, cryptographic ledger of collective intelligence.
          </p>
        </div>
      </div>

      {/* MISSION & VISION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* THE MISSION — amber theme, hover: slide-up + tilt */}
        <div className="group relative bg-amber-500/5 border border-amber-500/15 rounded-2xl p-8 md:p-10 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] hover:-translate-y-2 hover:border-amber-400/30 overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 group-hover:rotate-12 group-hover:scale-125 transition-all duration-700 text-amber-400">
            <Icons.Target size={100} strokeWidth={0.5} />
          </div>
          <div className="relative z-10">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 mb-5 transition-all duration-500 group-hover:-rotate-12 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <Icons.Rocket size={20} strokeWidth={1.5} />
            </div>
            <h2 className="text-[9px] font-bold uppercase tracking-[0.4em] text-amber-400 mb-1">
              The Mission
            </h2>
            <h4 className="text-xl font-bold text-[var(--muse-text)] mb-3 tracking-tight">
              Cognitive Optimization
            </h4>
            <p className="text-[var(--muse-muted)] font-serif italic text-sm leading-relaxed group-hover:text-[var(--muse-text)] transition-colors duration-500">
              To upgrade human intellectual output. We engineer proactive
              synthesis tools that allow operators to seamlessly capture raw
              signals, contemplate deep patterns, and isolate profound meaning
              from fragmented digital feeds.
            </p>
          </div>
        </div>

        {/* THE VISION — blue theme, hover: scale + glow pulse */}
        <div className="group relative bg-blue-500/5 border border-blue-500/15 rounded-2xl p-8 md:p-10 transition-all duration-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-2 hover:border-blue-400/30 overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 group-hover:-rotate-12 group-hover:scale-125 transition-all duration-700 text-blue-400">
            <Icons.Eye size={100} strokeWidth={0.5} />
          </div>
          <div className="relative z-10">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-5 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <Icons.Globe2 size={20} strokeWidth={1.5} />
            </div>
            <h2 className="text-[9px] font-bold uppercase tracking-[0.4em] text-blue-400 mb-1">
              The Vision
            </h2>
            <h4 className="text-xl font-bold text-[var(--muse-text)] mb-3 tracking-tight">
              Sovereign Attention Networks
            </h4>
            <p className="text-[var(--muse-muted)] font-serif italic text-sm leading-relaxed group-hover:text-[var(--muse-text)] transition-colors duration-500">
              We are building a decentralized information layer where attention
              is treated as an immutable, sovereign asset rather than a liquid
              commodity. We envision an advanced collective intelligence network
              where high-fidelity thoughts compound, evolve, and permanently
              outlast ephemeral social streams.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
