import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";

export default function SpectralHero(
  {
    onOpenAuth: _onOpenAuth,
    onWatchDemo: _onWatchDemo,
    onGuestEntry: _onGuestEntry,
  }: {
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
        <div className="relative w-48 h-48 flex items-center justify-center [perspective:1200px]">
          <div
            className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d] transition-transform duration-200 ease-out"
            style={{
              transform: `rotateX(${-mousePos.y * 0.6}deg) rotateY(${
                mousePos.x * 0.6
              }deg)`,
            }}
          >
            {/* Inner Glow */}
            <div className="absolute w-32 h-32 rounded-full shadow-[0_0_60px_var(--muse-text)] opacity-20 animate-[pulse_4s_ease-in-out_infinite]">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-[var(--muse-text)] to-pink-500 blur-2xl rounded-full" />
            </div>

            {/* 3D Rings */}
            <div className="absolute inset-0 [transform-style:preserve-3d] animate-[spin-slow_20s_linear_infinite]">
              {/* Outer Dashed Ring */}
              <div className="absolute inset-0 border-2 border-dashed border-[var(--muse-text)]/10 rounded-full [transform:rotateX(75deg)_rotateY(10deg)_scale(1.2)] animate-[spin-reverse_15s_linear_infinite]" />
              {/* Middle Cyan Ring */}
              <div className="absolute inset-2 border-[1.5px] border-cyan-500/40 rounded-full [transform:rotateX(65deg)_rotateY(45deg)] animate-[spin-slow_12s_linear_infinite]" />
              {/* Inner Purple Ring */}
              <div className="absolute inset-4 border border-purple-500/50 rounded-full [transform:rotateX(55deg)_rotateY(135deg)] animate-[spin-reverse_18s_linear_infinite]" />
              {/* Core Text Ring */}
              <div className="absolute inset-6 border border-[var(--muse-text)]/20 rounded-full [transform:rotateX(80deg)_rotateY(90deg)] animate-[spin-slow_25s_linear_infinite]" />
            </div>

            {/* Central Hub */}
            <div className="absolute w-16 h-16 rounded-full border border-[var(--muse-border)] bg-[var(--muse-surface)]/90 backdrop-blur-2xl flex items-center justify-center shadow-2xl z-20 [transform:translateZ(20px)]">
              <Icons.Infinity
                size={28}
                className="text-[var(--muse-text)] drop-shadow-[0_0_15px_currentColor]"
                strokeWidth={2}
              />
            </div>
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
