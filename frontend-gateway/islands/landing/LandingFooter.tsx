import * as Icons from "lucide-preact";

export default function LandingFooter() {
  const socialLinks = [
    {
      label: "X",
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "TikTok",
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.99-1.72-.02 3.29-.01 6.58-.02 9.86-.02 1.57-.45 3.19-1.44 4.43-1.42 1.83-3.89 2.76-6.17 2.4-2.18-.32-4.22-1.74-5.11-3.79-1.22-2.67-.65-6.1 1.45-8.15 1.51-1.52 3.76-2.18 5.86-1.7v4.11c-1.26-.39-2.7-.08-3.61.85-.98 1-.95 2.76.07 3.72.93.9 2.45.97 3.44.15.54-.44.82-1.12.83-1.81V.02z" />
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.454L0 24zm6.59-4.846c1.6.95 3.167 1.454 4.81 1.455 5.513 0 10.002-4.49 10.006-10.007.002-2.673-1.037-5.186-2.927-7.078-1.89-1.89-4.402-2.93-7.075-2.931-5.523 0-10.016 4.49-10.02 10.007-.001 1.764.463 3.488 1.344 5.013l-.988 3.606 3.69-.968zm12.382-7.234c-.27-.135-1.602-.79-1.85-.88-.248-.09-.43-.135-.61.135-.18.27-.7 1-.856 1.18-.156.18-.313.202-.584.067-.27-.135-1.144-.421-2.179-1.344-.805-.718-1.348-1.606-1.506-1.876-.157-.27-.017-.416.118-.55.121-.122.27-.315.405-.473.136-.157.18-.27.27-.45.09-.18.045-.337-.023-.473-.067-.135-.61-1.472-.835-2.013-.22-.53-.44-.457-.61-.466-.156-.008-.337-.01-.518-.01-.18 0-.474.068-.72.338-.248.27-.946.924-.946 2.253s.967 2.61 1.102 2.79c.135.18 1.902 2.904 4.608 4.07 2.254.973 2.71 1.17 3.66.082 1-.88 1-.88 1.13-1.127.135-.247.09-.415.023-.55-.068-.135-.27-.27-.584-.405z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="relative bg-[#050505] border-t border-[var(--muse-border)] pt-12 pb-6 overflow-hidden">
      {/* Background terminal grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-16 relative z-10">
        {/* MAIN ROW */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-12 md:gap-6 pb-12">
          {/* LEFT: Logo + Protocol Vibe */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-black/20" />
                <Icons.Infinity size={18} strokeWidth={3} className="relative z-10" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tighter text-white">
                  MUSE
                </span>
                <span className="text-[8px] font-bold uppercase tracking-[0.5em] text-canvas-primary mt-1">
                  Protocol Network
                </span>
              </div>
            </div>
            <p className="text-xs font-bold text-gray-300 max-w-xs leading-snug">
              Turn your consumption into creation.
            </p>
            <div className="pl-4 border-l-2 border-white/10">
              <p className="text-xs font-serif italic text-gray-500 max-w-xs leading-relaxed">
                "The bridge between consumption and consciousness. Every artifact captured is a neuron in your digital soul."
              </p>
            </div>
          </div>

          {/* RIGHT: Broadcasting + Governance */}
          <div className="flex flex-col items-start md:items-end gap-8 w-full md:w-auto">
            
            {/* Broadcasting Channels */}
            <div className="w-full md:w-auto">
              <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-600 mb-4 md:text-right">Broadcasting Channels</h4>
              <div className="flex flex-wrap items-center gap-3">
                {socialLinks.map(({ svg, label }, i) => (
                  <div key={i} className="relative group/social">
                    <a
                      href="#"
                      aria-label={label}
                      title={label}
                      className="w-10 h-10 rounded-[1rem] border border-white/10 flex items-center justify-center text-gray-500 bg-white/[0.02] hover:border-canvas-primary/50 hover:bg-canvas-primary/10 transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Cybernetic scanning animation on hover */}
                      <div className="absolute inset-0 -translate-x-full group-hover/social:animate-[scan_1s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-canvas-primary/30 to-transparent w-1/2 h-full skew-x-12" />
                      <div className="relative z-10 group-hover/social:text-white transition-colors duration-300">
                        {svg}
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Governance Links */}
            <div className="w-full md:w-auto">
              <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-600 mb-4 md:text-right">Governance & Protocol</h4>
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                {[
                  { label: "Manifesto", href: "#" },
                  { label: "Data Sovereignty", href: "#" },
                  { label: "Protocol Rules", href: "#" },
                  { label: "Open Source", href: "#" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="group flex items-center gap-2 text-[10px] text-gray-400 hover:text-white font-bold tracking-widest uppercase transition-colors duration-300"
                  >
                    <Icons.Terminal size={10} className="text-gray-600 group-hover:text-canvas-primary transition-colors" />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM BAR: Live Telemetry Ticker */}
        <div className="pt-5 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">
              © 2026 Muse Protocol
            </span>
          </div>
          
          <div className="flex items-center gap-6 px-4 py-2 rounded-lg bg-white/5 border border-white/5 overflow-hidden">
            <span className="text-[9px] text-emerald-400/80 font-mono flex items-center gap-2">
              <Icons.Activity size={10} /> LATENCY: 12ms
            </span>
            <div className="w-px h-3 bg-white/10" />
            <span className="text-[9px] text-canvas-primary/80 font-mono flex items-center gap-2">
              <Icons.Database size={10} /> BLK: 0x98b4f2
            </span>
            <div className="w-px h-3 bg-white/10" />
            <span className="text-[9px] text-gray-500 font-mono hidden sm:flex items-center gap-2">
              <Icons.Users size={10} /> NODES: 3,402
            </span>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { transform: translateX(-200%) skewX(12deg); }
          100% { transform: translateX(200%) skewX(12deg); }
        }
      `}</style>
    </footer>
  );
}
