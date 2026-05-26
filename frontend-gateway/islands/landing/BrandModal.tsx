import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";

const themes = [
  {
    name: "Dark",
    bg: "#0a0a0f",
    text: "#f1f5f9",
    accent: "#64748b",
    ring: "shadow-[0_0_30px_rgba(15,15,25,0.8)]",
  },
  {
    name: "Charcoal",
    bg: "#1a1f2e",
    text: "#e2e8f0",
    accent: "#94a3b8",
    ring: "shadow-[0_0_30px_rgba(26,31,46,0.8)]",
  },
  {
    name: "Tint",
    bg: "#e8eaf2",
    text: "#1e293b",
    accent: "#64748b",
    ring: "shadow-[0_0_30px_rgba(232,234,242,0.8)]",
  },
  {
    name: "Light",
    bg: "#f8fafc",
    text: "#0f172a",
    accent: "#475569",
    ring: "shadow-[0_0_30px_rgba(248,250,252,0.8)]",
  },
];

const touchpoints = [
  {
    icon: Icons.LayoutGrid,
    label: "Rooms",
    desc: "Sovereign cognitive environments",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    icon: Icons.GitBranch,
    label: "Threads",
    desc: "Real-time AI synthesis engine",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: Icons.PenTool,
    label: "Journal",
    desc: "Contemplation terminal",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Icons.Globe2,
    label: "Community",
    desc: "Decentralized thought network",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Icons.ScanFace,
    label: "Mirror",
    desc: "Cognitive growth visualizer",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Icons.Lock,
    label: "Vault",
    desc: "Cryptographic ownership layer",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
];

export default function BrandModal({ onClose, onOpenAuth }: {
  onClose: () => void;
  onOpenAuth: (mode: "login" | "signup") => void;
}) {
  const [activeTheme, setActiveTheme] = useState(0);
  const [visible, setVisible] = useState(false);

  // Animate in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Auto-cycle themes
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTheme((prev) => (prev + 1) % themes.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  // Close on backdrop click
  const handleBackdrop = (e: MouseEvent) => {
    if ((e.target as HTMLElement).id === "brand-backdrop") handleClose();
  };

  return (
    <div
      id="brand-backdrop"
      onClick={handleBackdrop}
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 transition-all duration-300 ${
        visible
          ? "bg-black/70 backdrop-blur-xl"
          : "bg-black/0 backdrop-blur-none"
      }`}
    >
      <div
        className={`relative w-full max-w-3xl bg-[var(--muse-surface)] border border-[var(--muse-border)] rounded-3xl overflow-hidden transition-all duration-300 ${
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-95"
        }`}
      >
        {/* TOP GRADIENT BAR cycling through theme colors */}
        <div
          className="absolute top-0 left-0 w-full h-1 transition-all duration-1000"
          style={{
            background: `linear-gradient(to right, ${themes[activeTheme].bg}, ${
              themes[(activeTheme + 1) % 4].bg
            }, ${themes[(activeTheme + 2) % 4].bg}, ${
              themes[(activeTheme + 3) % 4].bg
            })`,
          }}
        />

        {/* CLOSE */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full border border-[var(--muse-border)] flex items-center justify-center text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:border-[var(--muse-text)]/30 transition-all duration-200"
        >
          <Icons.X size={14} />
        </button>

        <div className="p-8 md:p-10 pt-10">
          {/* LOGO + THEME SWATCHES */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
            {/* Central Logo with pulsing ring */}
            <div className="relative flex items-center justify-center shrink-0">
              {/* Outer animated ring */}
              <div
                className="absolute w-28 h-28 rounded-full transition-all duration-1000 opacity-20 blur-lg"
                style={{
                  background: themes[activeTheme].bg === "#f8fafc"
                    ? "#0f172a"
                    : themes[activeTheme].bg,
                }}
              />
              <div className="relative w-20 h-20 rounded-2xl bg-[var(--muse-text)] flex items-center justify-center shadow-2xl">
                <Icons.Infinity
                  size={40}
                  className="text-[var(--muse-bg)]"
                  strokeWidth={2}
                />
              </div>
            </div>

            {/* Brand text + theme pills */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                <span className="text-3xl font-bold tracking-tighter text-[var(--muse-text)]">
                  MUSE
                </span>
                <span className="text-[8px] font-bold uppercase tracking-[0.5em] text-canvas-primary border border-canvas-primary/30 px-2 py-0.5 rounded-full">
                  Intelligence
                </span>
              </div>
              <p className="text-sm font-bold text-[var(--muse-text)] mb-3">
                Turn your consumption into creation.
              </p>
              <p className="text-xs font-serif italic text-[var(--muse-muted)] leading-relaxed mb-4 max-w-sm">
                A sovereign cognitive loop where scattered signals evolve into
                an immutable cryptographic ledger of collective wisdom.
              </p>

              {/* 4 THEME COLOR SWATCHES */}
              <div className="flex items-center gap-2 justify-center md:justify-start">
                {themes.map((theme, i) => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => setActiveTheme(i)}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${
                      activeTheme === i
                        ? "border-[var(--muse-text)]/40 bg-[var(--muse-text)]/5 scale-105"
                        : "border-[var(--muse-border)] hover:border-[var(--muse-text)]/20"
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-white/10 shrink-0"
                      style={{
                        background: theme.bg === "#f8fafc"
                          ? "#e2e8f0"
                          : theme.bg,
                      }}
                    />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muse-muted)] group-hover:text-[var(--muse-text)] transition-colors">
                      {theme.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="relative mb-6">
            <div className="h-px bg-[var(--muse-border)]" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--muse-surface)] px-3 text-[9px] font-bold uppercase tracking-[0.4em] text-[var(--muse-muted)]">
              Platform
            </span>
          </div>

          {/* TOUCHPOINTS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {touchpoints.map((tp) => (
              <div
                key={tp.label}
                className={`group flex items-center gap-3 p-3 rounded-xl border ${tp.bg} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default`}
              >
                <div
                  className={`w-8 h-8 rounded-lg bg-[var(--muse-surface)]/60 flex items-center justify-center ${tp.color} shrink-0 group-hover:scale-110 transition-transform duration-300`}
                >
                  <tp.icon size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--muse-text)]">
                    {tp.label}
                  </p>
                  <p className="text-[10px] font-serif italic text-[var(--muse-muted)] leading-tight">
                    {tp.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-center pt-2">
            <p className="text-[10px] text-[var(--muse-muted)] font-serif italic">
              © 2026 Muse Protocol · v2.1.0
            </p>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes theme-pulse {
            0%, 100% { transform: scale(1); opacity: 0.2; }
            50% { transform: scale(1.1); opacity: 0.35; }
          }
        `}
      </style>
    </div>
  );
}
