import * as Icons from "lucide-preact";

export default function SystemBento() {
  const features = [
    {
      title: "The Pulse",
      desc:
        "A unified mirror of your cognitive patterns. Real-time insights from your collection.",
          icon: Icons.Aperture,
      span: "md:col-span-2",
      bg: "bg-canvas-primary/5",
      border: "border-canvas-primary/20",
      color: "text-canvas-primary",
    },
    {
      title: "Vault Storage",
      desc: "Rooms and Threads. Raw materials meet synthesized wisdom.",
          icon: Icons.Layout,
      span: "md:col-span-1",
      bg: "bg-[var(--muse-surface)]",
      border: "border-[var(--muse-border)]",
      color: "text-[var(--muse-text)]",
    },
    {
      title: "Journal Flow",
      desc:
        "Deep, private introspection. A dated record of your emerging consciousness.",
          icon: Icons.BookOpen,
      span: "md:col-span-1",
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/20",
      color: "text-emerald-400",
    },
    {
      title: "Collective Intelligence",
      desc:
        "Bridge your private rooms with public networks. Sovereign data sharing.",
          icon: Icons.Network,
      span: "md:col-span-2",
      bg: "bg-amber-500/5",
      border: "border-amber-500/20",
      color: "text-amber-400",
    },
  ];

  return (
    <section className="w-full max-w-none px-6 md:px-10 py-32 space-y-20 transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
        <div className="max-w-2xl">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--muse-muted)] mb-6 flex items-center gap-3 transition-colors duration-300">
                <Icons.Target size={14} /> The Ecosystem
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

      <div className="relative overflow-hidden w-full pb-10 pt-4 group">
        {/* Gradient fades for the edges to make the scroll smooth */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--muse-bg)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--muse-bg)] to-transparent z-10 pointer-events-none" />
        
        <div className="flex gap-6 w-max animate-marquee group-hover:[animation-play-state:paused]">
          {[...features, ...features].map((f, i) => (
            <div
              key={`${f.title}-${i}`}
              className={`${f.span} group/card relative overflow-hidden rounded-[2.5rem] border ${f.border} ${f.bg} p-10 transition-all hover:-translate-y-2 hover:shadow-2xl duration-300 w-[380px] flex-shrink-0 cursor-pointer`}
            >
              <div className="absolute top-0 right-0 p-8 text-[var(--muse-surface-soft)] group-hover/card:text-[var(--muse-border)] transition-colors duration-300">
                <f.icon size={120} strokeWidth={0.5} />
              </div>

              <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div
                  className={`w-14 h-14 rounded-2xl bg-[var(--muse-surface-soft)] flex items-center justify-center ${f.color} group-hover/card:scale-110 transition-all duration-300`}
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
      </div>

      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(calc(-50% - 12px)); }
          }
          .animate-marquee {
            animation: marquee 35s linear infinite;
          }
        `}
      </style>


    </section>
  );
}
