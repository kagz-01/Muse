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
      setMousePos({
        x: (e.clientX / globalThis.innerWidth - 0.5) * 20,
        y: (e.clientY / globalThis.innerHeight - 0.5) * 20,
      });
    };
    globalThis.addEventListener("mousemove", handleMouseMove);
    return () => globalThis.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      {/* CINEMATIC BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-canvas-primary/5 blur-[120px] rounded-full animate-pulse"
          style={{
            transform: `translate(${mousePos.x * -1.5}px, ${
              mousePos.y * -1.5
            }px)`,
          }}
        />
          className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-[var(--muse-text)]/5 blur-[100px] rounded-full"
          style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
        />

        {/* Floating Artifacts (Simulated) */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-[var(--muse-surface)]/20 border border-[var(--muse-border)] backdrop-blur-md rounded-2xl animate-[float_10s_ease-in-out_infinite]"
            style={{
              width: `${Math.random() * 60 + 20}px`,
              height: `${Math.random() * 60 + 20}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.8}s`,
              transform: `translate(${mousePos.x * (i % 3 - 1)}px, ${
                mousePos.y * (i % 2 - 1)
              }px)`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* MAIN HEADLINE */}
        <h1 className="text-6xl md:text-9xl font-bold tracking-tight leading-[0.85] text-[var(--muse-text)] transition-colors duration-300">
          Collect.{" "}
          <span className="text-[var(--muse-muted)] italic font-serif transition-colors duration-300">
            Synthesize.
          </span>
          <span className="block mt-4 bg-gradient-to-r from-[var(--muse-text)] via-[var(--muse-text)]/80 to-[var(--muse-muted)] bg-clip-text text-transparent transition-all duration-300">
            Ascend.
          </span>
        </h1>

        {/* SUB-CAPTION */}
        <p className="mx-auto max-w-2xl text-[var(--muse-muted)] text-xl md:text-2xl font-serif italic leading-relaxed opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-forwards transition-colors">
          "Your sovereign cognitive environment. Stop consuming passively. Start building your collective intelligence."
        </p>

        {/* CTA SEQUENCE */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-10 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700 fill-mode-forwards">
          <button
            type="button"
            onClick={() => onOpenAuth("signup")}
            className="group relative px-10 py-5 bg-[var(--muse-text)] text-[var(--muse-bg)] font-bold uppercase tracking-[0.2em] text-[11px] rounded-full shadow-2xl hover:-translate-y-1 hover:shadow-[var(--muse-text)]/10 active:scale-95 transition-all cursor-pointer overflow-hidden duration-300"
          >
            <div className="absolute inset-0 bg-canvas-primary/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              <span className="relative z-10 flex items-center gap-3">
              Get Started <Icons.ArrowRight size={16} />
            </span>
          </button>

          <button
            type="button"
            onClick={onGuestEntry}
            className="group px-10 py-5 rounded-full border border-[var(--muse-border)] bg-[var(--muse-surface)] text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muse-text)] hover:bg-[var(--muse-surface-soft)] transition-all flex items-center gap-3 cursor-pointer duration-300"
          >
            <Icons.Activity
              size={16}
              className="text-canvas-primary group-hover:scale-125 transition-transform"
            />
            Continue as Guest
          </button>

          <button
            type="button"
            onClick={onWatchDemo}
            className="group px-10 py-5 rounded-full border border-[var(--muse-border)] bg-[var(--muse-surface)] text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-all flex items-center gap-3 cursor-pointer duration-300"
          >
            <Icons.Play
              size={16}
              className="text-canvas-primary group-hover:fill-canvas-primary transition-all"
            />
            Watch System Demo
          </button>
        </div>

        {/* SCROLL INDICATOR */}
        <div className="pt-20 opacity-40 animate-bounce">
          <div className="w-px h-12 bg-linear-to-b from-[var(--muse-text)] to-transparent mx-auto" />
        </div>
      </div>

      <style>
        {`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(10px, -15px) rotate(5deg); }
          66% { transform: translate(-15px, 10px) rotate(-5deg); }
        }
      `}
      </style>
    </section>
  );
}
