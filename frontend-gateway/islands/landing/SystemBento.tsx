import {
  BookOpen,
  Layout,
  Network,
  Shield,
  Sparkles,
  Target,
  Zap,
} from "lucide-preact";

export default function SystemBento() {
  const features = [
    {
      title: "The Pulse",
      desc:
        "A unified mirror of your cognitive patterns. Real-time insights from your collection.",
      icon: Sparkles,
      span: "md:col-span-2",
      bg: "bg-canvas-primary/5",
      border: "border-canvas-primary/20",
      color: "text-canvas-primary",
    },
    {
      title: "Vault Storage",
      desc: "Rooms and Threads. Raw materials meet synthesized wisdom.",
      icon: Layout,
      span: "md:col-span-1",
      bg: "bg-[var(--muse-surface)]",
      border: "border-[var(--muse-border)]",
      color: "text-[var(--muse-text)]",
    },
    {
      title: "Journal Flow",
      desc:
        "Deep, private introspection. A dated record of your emerging consciousness.",
      icon: BookOpen,
      span: "md:col-span-1",
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/20",
      color: "text-emerald-400",
    },
    {
      title: "Collective Intelligence",
      desc:
        "Bridge your private rooms with public networks. Sovereign data sharing.",
      icon: Network,
      span: "md:col-span-2",
      bg: "bg-amber-500/5",
      border: "border-amber-500/20",
      color: "text-amber-400",
    },
  ];

  return (
    <section className="max-w-[1800px] mx-auto px-6 md:px-10 py-32 space-y-20 transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
        <div className="max-w-2xl">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--muse-muted)] mb-6 flex items-center gap-3 transition-colors duration-300">
            <Target size={14} /> The Ecosystem
          </h2>
          <h3 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--muse-text)] leading-tight transition-colors duration-300">
            Engineered for{" "}
            <span className="text-[var(--muse-muted)] italic font-serif">
              Intention.
            </span>
          </h3>
        </div>
        <p className="text-[var(--muse-muted)] font-serif italic text-lg md:text-xl max-w-sm transition-colors duration-300">
          Muse isn't just an app; it's a digital extension of your
          neuro-architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className={`${f.span} group relative overflow-hidden rounded-[2.5rem] border ${f.border} ${f.bg} p-10 transition-all hover:scale-[1.01] hover:shadow-2xl duration-300`}
          >
            <div className="absolute top-0 right-0 p-8 text-[var(--muse-surface-soft)] group-hover:text-[var(--muse-border)] transition-colors duration-300">
              <f.icon size={120} strokeWidth={0.5} />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between gap-12">
              <div
                className={`w-14 h-14 rounded-2xl bg-[var(--muse-surface-soft)] flex items-center justify-center ${f.color} transition-all duration-300`}
              >
                <f.icon size={28} />
              </div>

              <div>
                <h4 className="text-2xl font-bold text-[var(--muse-text)] mb-4 tracking-tight transition-colors duration-300">
                  {f.title}
                </h4>
                <p className="text-[var(--muse-muted)] font-serif italic text-lg leading-relaxed max-w-md transition-colors duration-300">
                  {f.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SYSTEM STATS BANNER */}
      <div className="bg-[var(--muse-surface)] border border-[var(--muse-border)] rounded-[3rem] p-8 md:p-16 flex flex-wrap justify-between gap-12 transition-all duration-300">
        {[
          { label: "Data Integrity", val: "100%", icon: Shield },
          { label: "Synthesis Latency", val: "2ms", icon: Zap },
          { label: "Open Standards", val: "W3C", icon: Layout },
          { label: "Network Effect", val: "Global", icon: Network },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-full border border-[var(--muse-border)] flex items-center justify-center text-[var(--muse-muted)] transition-all duration-300">
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--muse-text)] font-mono transition-colors duration-300">
                {s.val}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--muse-muted)] mt-1 transition-colors duration-300">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
