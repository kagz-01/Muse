import { Activity, Shield, Twitter, ArrowUpRight, Instagram, Facebook, Video, MessageCircle, Infinity as InfinityIcon } from "lucide-preact";

export default function LandingFooter() {
  const sections = [
    {
      title: "Ecosystem",
      links: [
        { label: "Personal Insights", href: "/mirror" },
        { label: "AI Synthesis", href: "/create" },
        { label: "Community Spaces", href: "/rooms" },
        { label: "Activity Feed", href: "/dashboard" },
      ]
    },
    {
      title: "About",
      links: [
        { label: "Our Mission", href: "#" },
        { label: "System Architecture", href: "#" },
        { label: "Future Vision", href: "#" },
        { label: "Documentation", href: "#" },
      ]
    },
    {
      title: "Ledger",
      links: [
        { label: "Encrypted Vault", href: "#" },
        { label: "Node Status", href: "#" },
        { label: "Proof of Resonance", href: "#" },
        { label: "Developer API", href: "#" },
      ]
    }
  ];

  return (
    <footer className="relative bg-[#050505] border-t border-white/5 pt-32 pb-20 overflow-hidden">
      
      {/* GLOW EFFECT */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-canvas-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1800px] mx-auto px-6 md:px-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 md:gap-12 mb-32">
          
          {/* BRAND BLOCK */}
          <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-black font-bold shadow-2xl">
                <InfinityIcon size={28} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tighter text-white leading-none">MUSE</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-canvas-primary mt-2 leading-none">Intelligence</span>
              </div>
            </div>
            
            <p className="max-w-md text-gray-500 font-serif italic text-lg leading-relaxed">
              "The bridge between consumption and consciousness. Every artifact captured is a neuron in your digital soul."
            </p>

            <div className="flex items-center gap-6">
              {[
                { icon: Twitter, label: "X" }, 
                { icon: Video, label: "TikTok" }, 
                { icon: MessageCircle, label: "WhatsApp" }, 
                { icon: Instagram, label: "Instagram" }, 
                { icon: Facebook, label: "Facebook" }
              ].map(({ icon: Icon, label }, i) => (
                <a key={i} href="#" aria-label={label} title={label} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/10 hover:bg-white/10 transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* LINK COLUMNS */}
          {sections.map(section => (
            <div key={section.title} className="space-y-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map(link => (
                  <li key={link.label}>
                    <a href={link.href} className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 group text-sm font-medium">
                      {link.label}
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* SYSTEM STATUS BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 pt-12 border-t border-white/5">
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">System Resonance Stable</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield size={14} className="text-gray-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Encrypted Ledger</span>
            </div>
            <div className="flex items-center gap-3">
              <Activity size={14} className="text-gray-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Latency: 2ms</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-800">
             <span>© 2026 Muse Intelligence Protocol</span>
             <span className="h-4 w-px bg-white/5" />
             <span>Built on Sovereignty</span>
          </div>
        </div>

      </div>

    </footer>
  );
}
