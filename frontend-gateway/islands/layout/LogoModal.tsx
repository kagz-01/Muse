import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";

export default function LogoModal({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-500 ${
        visible
          ? "bg-[var(--muse-bg)]/80 backdrop-blur-2xl"
          : "bg-transparent backdrop-blur-none"
      }`}
      onClick={(e) => {
        if ((e.target as HTMLElement).id === "logo-modal-backdrop") {
          handleClose();
        }
      }}
      id="logo-modal-backdrop"
    >
      <div
        className={`relative max-w-md w-full bg-[var(--muse-surface)] border border-[var(--muse-border)] rounded-3xl p-10 overflow-hidden shadow-2xl transition-all duration-500 ${
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-10"
        }`}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--muse-surface-soft)]"
        >
          <Icons.X size={16} />
        </button>

        {/* 3D Core Animation */}
        <div className="flex justify-center mb-10 mt-6 perspective-[1000px]">
          <div className="w-32 h-32 relative preserve-3d animate-[spin-slow_12s_linear_infinite]">
            {/* Inner glowing sphere/cube mix */}
            <div className="absolute inset-0 border border-canvas-primary/50 rounded-xl transform rotate-x-45 rotate-y-45 shadow-[0_0_30px_rgba(var(--muse-accent-rgb),0.3)]">
            </div>
            <div className="absolute inset-0 border border-[var(--muse-text)]/30 rounded-full transform -rotate-x-45 -rotate-y-45">
            </div>
            <div className="absolute inset-0 border border-[var(--muse-text)]/10 transform rotate-x-90 rotate-y-90 rounded-2xl">
            </div>
            <div className="absolute inset-1/4 bg-canvas-primary rounded-full blur-2xl opacity-20 animate-pulse">
            </div>
            <div className="absolute inset-0 flex items-center justify-center transform preserve-3d animate-[spin-slow-reverse_10s_linear_infinite]">
              <Icons.Aperture size={32} className="text-canvas-primary" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--muse-text)] uppercase font-mono">
            Nexus Core Active
          </h2>
          <p className="text-sm font-serif italic text-[var(--muse-muted)] leading-relaxed">
            The neural architecture is processing. You are seamlessly connected
            to the central synthesis grid. Your cognitive footprint contributes
            to the unified topology.
          </p>
          <div className="pt-6 border-t border-[var(--muse-border)] mt-6 flex justify-between items-center px-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_infinite]">
              </span>
              Nominal
            </div>
            <div className="text-[10px] font-mono text-[var(--muse-muted)]">
              v2.1.0-STABLE
            </div>
          </div>
        </div>
      </div>
      <style>
        {`
          .perspective-\\[1000px\\] { perspective: 1000px; }
          .preserve-3d { transform-style: preserve-3d; }
          .rotate-x-45 { transform: rotateX(45deg); }
          .rotate-y-45 { transform: rotateY(45deg); }
          .-rotate-x-45 { transform: rotateX(-45deg); }
          .-rotate-y-45 { transform: rotateY(-45deg); }
          .rotate-x-90 { transform: rotateX(90deg); }
          .rotate-y-90 { transform: rotateY(90deg); }
          @keyframes spin-slow {
            0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
            100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
          }
          @keyframes spin-slow-reverse {
            0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
            100% { transform: rotateX(-360deg) rotateY(-360deg) rotateZ(-360deg); }
          }
        `}
      </style>
    </div>
  );
}
