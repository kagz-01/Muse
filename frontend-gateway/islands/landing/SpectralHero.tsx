import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";

export default function SpectralHero(
  { onOpenAuth, onWatchDemo, onGuestEntry }: {
    onOpenAuth: (mode: "login" | "signup") => void;
    onWatchDemo: () => void;
    onGuestEntry: () => void;
  },
) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / globalThis.innerWidth) * 2 - 1;
      const y = (e.clientY / globalThis.innerHeight) * 2 - 1;
      setMousePos({ x: x * 50, y: y * 50 });
    };
    globalThis.addEventListener("mousemove", handleMouseMove);
    return () => globalThis.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative h-[75vh] min-h-[480px] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      {/* INTERACTIVE BUBBLES */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(16)].map((_, i) => (
          <div
            key={`bubble-${i}`}
            className="absolute rounded-full border border-[var(--muse-text)]/10 backdrop-blur-md transition-transform duration-1000 ease-out"
            style={{
              width: `${(i % 5) * 12 + 16}px`,
              height: `${(i % 5) * 12 + 16}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `translate(${mousePos.x * (i % 3 + 1)}px, ${
                mousePos.y * (i % 4 + 1)
              }px)`,
              background:
                `radial-gradient(circle at top left, var(--muse-text) 0%, transparent 80%)`,
              opacity: 0.04 + (i % 3) * 0.03,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-8">
        {/* THE 3D ORBITAL LOGO / GYROSCOPE */}
        <div className="relative w-40 h-40 flex items-center justify-center [perspective:1000px]">
          {/* Inner Glow */}
          <div className="absolute w-24 h-24 rounded-full shadow-[0_0_50px_var(--muse-text)] opacity-20 animate-[pulse_4s_ease-in-out_infinite]">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-[var(--muse-text)] to-pink-500 blur-xl rounded-full" />
          </div>

          {/* 3D Rings */}
          <div className="absolute inset-0 [transform-style:preserve-3d] animate-[spin-slow_15s_linear_infinite]">
            <div className="absolute inset-0 border-[1.5px] border-[var(--muse-text)]/20 rounded-full [transform:rotateX(60deg)_rotateY(0deg)] animate-[spin-reverse_10s_linear_infinite]" />
            <div className="absolute inset-0 border border-cyan-500/30 rounded-full [transform:rotateX(60deg)_rotateY(60deg)] animate-[spin-slow_12s_linear_infinite]" />
            <div className="absolute inset-0 border border-purple-500/30 rounded-full [transform:rotateX(60deg)_rotateY(120deg)] animate-[spin-reverse_14s_linear_infinite]" />
          </div>

          {/* Central Hub */}
          <div className="absolute w-14 h-14 rounded-full border border-[var(--muse-border)] bg-[var(--muse-surface)]/80 backdrop-blur-xl flex items-center justify-center shadow-2xl z-20">
            <Icons.Infinity
              size={24}
              className="text-[var(--muse-text)] drop-shadow-[0_0_10px_currentColor]"
              strokeWidth={2}
            />
          </div>
        </div>

        {/* HEADLINE - Bold normal text */}
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.15] text-[var(--muse-text)]">
            Turn Raw Consumption{" "}
            <span className="bg-gradient-to-r from-[var(--muse-text)] via-[var(--muse-muted)] to-canvas-primary bg-clip-text text-transparent">
              into Immutable Insight.
            </span>
          </h1>
          <p className="text-sm md:text-base text-[var(--muse-muted)] font-serif italic max-w-lg mx-auto leading-relaxed">
            A sovereign intelligence loop — where scattered signals are
            captured, contemplated, and synthesized into a cryptographic ledger
            of collective wisdom.
          </p>
        </div>
      </div>
    </section>
  );
}

// Ensure the tailwind config handles these custom animations or inject them globally.
// We can use a quick style tag here to guarantee the 3D spins work.
const globalStyles = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes spin-reverse {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = globalStyles;
  document.head.appendChild(style);
}
