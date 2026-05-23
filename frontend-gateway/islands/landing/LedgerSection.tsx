import * as Icons from "lucide-preact";
import { useEffect, useState } from "preact/hooks";

export default function LedgerSection(
  { onCTA, onGuestEntry }: { onCTA: () => void; onGuestEntry: () => void },
) {
  const items = [
    {
      title: "The Thought Stream",
      subtitle: "Collective Consensus",
      desc:
        "Broadcast your cognitive workflow. Every broadcasted thread carries a rigorous cryptographic signature that guarantees individual provenance while plugging into the global intelligence layer.",
      icon: Icons.Activity,
      color: "text-purple-400",
      bg: "bg-purple-500/5",
      border: "border-purple-500/15 hover:border-purple-400/30",
      glow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]",
      hoverAnim: "hover:-translate-y-2 hover:rotate-[0.5deg]",
      iconAnim: "group-hover:scale-110 group-hover:-rotate-12",
      slideAnim: "animate-[zigzag-right_20s_ease-in-out_infinite_alternate]",
    },
    {
      title: "Proof of Resonance",
      subtitle: "Intellectual Compounding",
      desc:
        "A verifiable audit trail of your intellectual velocity. Watch your ideas compound across pulsing node clusters as the decentralized engine logs your structural influence.",
      icon: Icons.Shield,
      color: "text-amber-400",
      bg: "bg-amber-500/5",
      border: "border-amber-500/15 hover:border-amber-400/30",
      glow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]",
      hoverAnim: "hover:-translate-y-2 hover:-rotate-[0.5deg]",
      iconAnim: "group-hover:scale-110 group-hover:rotate-12",
      slideAnim: "animate-[zigzag-left_25s_ease-in-out_infinite_alternate]",
    },
    {
      title: "The Intelligence Loop",
      subtitle: "Predictive Pipeline",
      desc:
        "A multi-stage AI Analysis Pipeline works with your private Journal Terminal — extracting semantic meaning, automating pattern recognition, and constructing Blueprint Scores.",
      icon: Icons.BrainCircuit,
      color: "text-cyan-400",
      bg: "bg-cyan-500/5",
      border: "border-cyan-500/15 hover:border-cyan-400/30",
      glow: "hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]",
      hoverAnim: "hover:-translate-y-2 hover:rotate-[0.5deg]",
      iconAnim: "group-hover:scale-110 group-hover:-rotate-6",
      slideAnim: "animate-[zigzag-right_22s_ease-in-out_infinite_alternate]",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [items.length]);

  return (
    <section className="w-full max-w-[1800px] mx-auto px-6 md:px-16 py-16 space-y-16 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-12">
        {/* LEFT COLUMN: Header */}
        <div className="w-full md:w-1/4 sticky top-32 shrink-0 z-20">
          <h2 className="text-[9px] font-bold uppercase tracking-[0.4em] text-emerald-400 mb-2 flex items-center gap-2">
            <Icons.Database size={10} /> The Ledger
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--muse-text)] leading-tight">
            Cryptographic{" "}
            <span className="text-emerald-400 font-serif italic">
              Provenance.
            </span>
          </h3>
          <p className="mt-4 text-[var(--muse-muted)] font-serif italic text-sm leading-relaxed">
            Absolute ownership by design. Your intellectual output is
            mathematically isolated, cryptographically sealed, and anchored
            permanently to the distributed ledger via unique Ledger IDs.
          </p>
        </div>

        {/* RIGHT COLUMN: Zigzag crisscross layout with auto-focus */}
        <div className="w-full md:w-3/4 relative h-[450px] md:h-[500px]">
          {items.map((item, i) => {
            const isActive = i === activeIndex;
            const isPrev = i === (activeIndex - 1 + items.length) % items.length;
            const isNext = i === (activeIndex + 1) % items.length;

            let translateY = "translate-y-0";
            let translateX = "translate-x-0";
            let scale = "scale-100";
            let opacity = "opacity-100";
            let zIndex = "z-10";

            if (isActive) {
              translateY = "top-[120px] md:top-[150px]";
              translateX = i % 2 === 0 ? "left-0 md:left-[10%]" : "right-0 md:right-[10%]";
              scale = "scale-105";
              opacity = "opacity-100";
              zIndex = "z-30 shadow-[0_30px_60px_rgba(0,0,0,0.3)]";
            } else if (isPrev) {
              translateY = "top-0 md:top-[20px]";
              translateX = i % 2 === 0 ? "left-0 md:-left-[5%]" : "right-0 md:-right-[5%]";
              scale = "scale-95";
              opacity = "opacity-40";
              zIndex = "z-10";
            } else if (isNext) {
              translateY = "top-[240px] md:top-[300px]";
              translateX = i % 2 === 0 ? "left-0 md:-left-[5%]" : "right-0 md:-right-[5%]";
              scale = "scale-95";
              opacity = "opacity-40";
              zIndex = "z-20";
            }

            return (
              <div
                key={item.title}
                className={`absolute w-full md:w-[75%] transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] ${translateY} ${translateX} ${scale} ${opacity} ${zIndex}`}
              >
                <div
                  className={`group ${item.bg} border ${item.border} rounded-3xl p-6 md:p-8 ${
                    isActive ? item.glow : ""
                  } backdrop-blur-xl h-full flex items-start gap-5`}
                >
                  <div
                    className={`p-4 rounded-2xl ${item.bg} border ${
                      item.border.split(" ")[0]
                    } ${item.color} shrink-0 transition-transform duration-700 ${
                      isActive ? "scale-110 shadow-lg" : "scale-100"
                    }`}
                  >
                    <item.icon size={24} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-bold ${item.color} tracking-tight mb-1 transition-colors`}
                    >
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)] block mb-3">
                      {item.subtitle}
                    </span>
                    <p className={`font-serif italic text-sm leading-relaxed transition-colors duration-500 ${isActive ? "text-[var(--muse-text)]" : "text-[var(--muse-muted)]"}`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="relative border border-[var(--muse-border)] bg-[var(--muse-surface)] rounded-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-canvas-primary to-transparent opacity-40" />
        <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-[var(--muse-text)] tracking-tight">
              Ready to explore?
            </h3>
            <p className="text-[var(--muse-muted)] mt-1 font-serif italic text-sm">
              Initialize your sovereign knowledge room today.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onCTA}
              className="group px-7 py-3 bg-[var(--muse-text)] text-[var(--muse-bg)] font-bold uppercase tracking-[0.2em] text-[10px] rounded-full hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              Start The Loop{" "}
              <Icons.ArrowRight
                size={12}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button
              type="button"
              onClick={onGuestEntry}
              className="group px-7 py-3 rounded-full border border-[var(--muse-border)] bg-transparent text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muse-text)] hover:bg-[var(--muse-surface-soft)] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Icons.Activity size={12} className="text-canvas-primary" />
              Guest Access
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Global styles for the zig-zag slide
const globalStyles = `
  @keyframes zigzag-right {
    0% { transform: translateX(0); }
    100% { transform: translateX(10%); }
  }
  @keyframes zigzag-left {
    0% { transform: translateX(0); }
    100% { transform: translateX(-10%); }
  }
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = globalStyles;
  document.head.appendChild(style);
}
