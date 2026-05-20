import {
  Activity,
  ArrowUpRight,
  Infinity as InfinityIcon,
  Shield,
} from "lucide-preact";

export default function LandingFooter() {
  const socialLinks = [
    {
      label: "X",
      svg: (
        <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "TikTok",
      svg: (
        <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.99-1.72-.02 3.29-.01 6.58-.02 9.86-.02 1.57-.45 3.19-1.44 4.43-1.42 1.83-3.89 2.76-6.17 2.4-2.18-.32-4.22-1.74-5.11-3.79-1.22-2.67-.65-6.1 1.45-8.15 1.51-1.52 3.76-2.18 5.86-1.7v4.11c-1.26-.39-2.7-.08-3.61.85-.98 1-.95 2.76.07 3.72.93.9 2.45.97 3.44.15.54-.44.82-1.12.83-1.81V.02z" />
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      svg: (
        <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.454L0 24zm6.59-4.846c1.6.95 3.167 1.454 4.81 1.455 5.513 0 10.002-4.49 10.006-10.007.002-2.673-1.037-5.186-2.927-7.078-1.89-1.89-4.402-2.93-7.075-2.931-5.523 0-10.016 4.49-10.02 10.007-.001 1.764.463 3.488 1.344 5.013l-.988 3.606 3.69-.968zm12.382-7.234c-.27-.135-1.602-.79-1.85-.88-.248-.09-.43-.135-.61.135-.18.27-.7 1-.856 1.18-.156.18-.313.202-.584.067-.27-.135-1.144-.421-2.179-1.344-.805-.718-1.348-1.606-1.506-1.876-.157-.27-.017-.416.118-.55.121-.122.27-.315.405-.473.136-.157.18-.27.27-.45.09-.18.045-.337-.023-.473-.067-.135-.61-1.472-.835-2.013-.22-.53-.44-.457-.61-.466-.156-.008-.337-.01-.518-.01-.18 0-.474.068-.72.338-.248.27-.946.924-.946 2.253s.967 2.61 1.102 2.79c.135.18 1.902 2.904 4.608 4.07 2.254.973 2.71 1.17 3.66.082 1-.88 1-.88 1.13-1.127.135-.247.09-.415.023-.55-.068-.135-.27-.27-.584-.405z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      svg: (
        <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      svg: (
        <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ];
  const sections = [
    {
      title: "Ecosystem",
      links: [
        { label: "Personal Insights", href: "/mirror" },
        { label: "AI Synthesis", href: "/create" },
        { label: "Community Spaces", href: "/rooms" },
        { label: "Activity Feed", href: "/dashboard" },
      ],
    },
    {
      title: "About",
      links: [
        { label: "Our Mission", href: "#" },
        { label: "System Architecture", href: "#" },
        { label: "Future Vision", href: "#" },
        { label: "Documentation", href: "#" },
      ],
    },
    {
      title: "Ledger",
      links: [
        { label: "Encrypted Vault", href: "#" },
        { label: "Node Status", href: "#" },
        { label: "Proof of Resonance", href: "#" },
        { label: "Developer API", href: "#" },
      ],
    },
  ];

  return (
    <footer className="relative bg-[var(--muse-bg)] border-t border-[var(--muse-border)] pt-32 pb-20 overflow-hidden transition-all duration-300">
      {/* GLOW EFFECT */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-canvas-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-none px-6 md:px-10">
        <div className="flex gap-12 overflow-x-auto pb-8 mb-32 scrollbar-hide">
          {/* BRAND BLOCK */}
          <div className="space-y-10 min-w-[360px] flex-[1.4] flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-[var(--muse-text)] rounded-2xl flex items-center justify-center text-[var(--muse-bg)] font-bold shadow-2xl transition-all duration-300">
                <InfinityIcon size={28} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tighter text-[var(--muse-text)] leading-none transition-colors duration-300">
                  MUSE
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-canvas-primary mt-2 leading-none">
                  Intelligence
                </span>
              </div>
            </div>

            <p className="max-w-md text-[var(--muse-muted)] font-serif italic text-lg leading-relaxed transition-colors duration-300">
              "The bridge between consumption and consciousness. Every artifact
              captured is a neuron in your digital soul."
            </p>

            <div className="flex items-center gap-6">
              {socialLinks.map(({ svg, label }, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={label}
                  title={label}
                  className="w-10 h-10 rounded-full border border-[var(--muse-border)] flex items-center justify-center text-[var(--muse-muted)] bg-transparent hover:text-[var(--muse-text)] hover:border-[var(--muse-text)]/40 hover:bg-[var(--muse-text)]/[0.04] transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(212,168,83,0.05)] active:scale-95"
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* LINK COLUMNS */}
          {sections.map((section) => (
            <div key={section.title} className="space-y-8 min-w-[220px] flex-shrink-0">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--muse-text)] transition-colors duration-300">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-colors flex items-center gap-2 group text-sm font-medium duration-300"
                    >
                      {link.label}
                      <ArrowUpRight
                        size={12}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* SYSTEM STATUS BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 pt-12 border-t border-[var(--muse-border)] transition-colors duration-300">
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)] transition-colors duration-300">
                System Resonance Stable
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Shield
                size={14}
                className="text-[var(--muse-muted)] transition-colors duration-300"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)] transition-colors duration-300">
                Encrypted Ledger
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Activity
                size={14}
                className="text-[var(--muse-muted)] transition-colors duration-300"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)] transition-colors duration-300">
                Latency: 2ms
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--muse-muted)] opacity-60 transition-colors duration-300">
            <span>© 2026 Muse Intelligence Protocol</span>
            <span className="h-4 w-px bg-[var(--muse-border)]" />
            <span>Built on Sovereignty</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
