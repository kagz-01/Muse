import { Layout, Sparkles, BookOpen, Network, Layers, Shield, Zap, Target } from "lucide-preact";

export default function SystemBento() {
  const features = [
    {
      title: "The Pulse",
      desc: "A unified mirror of your cognitive patterns. Real-time insights from your collection.",
      icon: Sparkles,
      span: "md:col-span-2",
      bg: "bg-canvas-primary/5",
      border: "border-canvas-primary/20",
      color: "text-canvas-primary"
    },
    {
      title: "Vault Storage",
      desc: "Rooms and Threads. Raw materials meet synthesized wisdom.",
      icon: Layout,
      span: "md:col-span-1",
      bg: "bg-white/[0.03]",
      border: "border-white/10",
      color: "text-white"
    },
    {
      title: "Journal Flow",
      desc: "Deep, private introspection. A dated record of your emerging consciousness.",
      icon: BookOpen,
      span: "md:col-span-1",
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/20",
      color: "text-emerald-400"
    },
    {
      title: "Collective Intelligence",
      desc: "Bridge your private rooms with public networks. Sovereign data sharing.",
      icon: Network,
      span: "md:col-span-2",
      bg: "bg-amber-500/5",
      border: "border-amber-500/20",
      color: "text-amber-400"
    },
  ];

  return (
    <section className="max-w-[1800px] mx-auto px-6 md:px-10 py-32 space-y-20">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
        <div className="max-w-2xl">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-600 mb-6 flex items-center gap-3">
            <Target size={14} /> The Ecosystem
          </h2>
          <h3 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Engineered for <span className="text-gray-600 italic font-serif">Intention.</span>
          </h3>
        </div>
        <p className="text-gray-500 font-serif italic text-lg md:text-xl max-w-sm">
          Muse isn't just an app; it's a digital extension of your neuro-architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div 
            key={f.title}
            className={`${f.span} group relative overflow-hidden rounded-[2.5rem] border ${f.border} ${f.bg} p-10 transition-all hover:scale-[1.01] hover:shadow-2xl`}
          >
            <div className="absolute top-0 right-0 p-8 text-gray-900 group-hover:text-white/10 transition-colors">
              <f.icon size={120} strokeWidth={0.5} />
            </div>
            
            <div className="relative z-10 flex flex-col h-full justify-between gap-12">
              <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${f.color}`}>
                <f.icon size={28} />
              </div>
              
              <div>
                <h4 className="text-2xl font-bold text-white mb-4 tracking-tight">{f.title}</h4>
                <p className="text-gray-500 font-serif italic text-lg leading-relaxed max-w-md">
                  {f.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SYSTEM STATS BANNER */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 md:p-16 flex flex-wrap justify-between gap-12">
        {[
          { label: "Data Integrity", val: "100%", icon: Shield },
          { label: "Synthesis Latency", val: "2ms", icon: Zap },
          { label: "Open Standards", val: "W3C", icon: Layout },
          { label: "Network Effect", val: "Global", icon: Network },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-6">
             <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-gray-500">
                <s.icon size={20} />
             </div>
             <div>
                <p className="text-2xl font-bold text-white font-mono">{s.val}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mt-1">{s.label}</p>
             </div>
          </div>
        ))}
      </div>

    </section>
  );
}
