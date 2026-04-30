import { useEffect, useState } from "preact/hooks";
import { Sparkles, ArrowRight, Activity, Zap, Play } from "lucide-preact";

export default function SpectralHero({ onOpenAuth, onWatchDemo, onGuestEntry }: { 
  onOpenAuth: (mode: "login" | "signup") => void,
  onWatchDemo: () => void,
  onGuestEntry: () => void
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / globalThis.innerWidth - 0.5) * 20,
        y: (e.clientY / globalThis.innerHeight - 0.5) * 20
      });
    };
    globalThis.addEventListener('mousemove', handleMouseMove);
    return () => globalThis.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      
      {/* CINEMATIC BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-canvas-primary/5 blur-[120px] rounded-full animate-pulse"
          style={{ transform: `translate(${mousePos.x * -1.5}px, ${mousePos.y * -1.5}px)` }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-white/5 blur-[100px] rounded-full"
          style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
        />
        
        {/* Floating Artifacts (Simulated) */}
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white/[0.03] border border-white/5 backdrop-blur-md rounded-2xl animate-[float_10s_ease-in-out_infinite]"
            style={{
              width: `${Math.random() * 60 + 20}px`,
              height: `${Math.random() * 60 + 20}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.8}s`,
              transform: `translate(${mousePos.x * (i%3-1)}px, ${mousePos.y * (i%2-1)}px)`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* TOP SIGNAL */}
        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.4em] text-canvas-primary shadow-2xl">
          <Activity size={14} className="animate-pulse" />
          The Muse System 2.1 is Live
        </div>

        {/* MAIN HEADLINE */}
        <h1 className="text-6xl md:text-9xl font-bold tracking-tight leading-[0.85] text-white">
          Capture. <span className="text-gray-700 italic font-serif lowercase">contemplate.</span>
          <span className="block mt-4 bg-gradient-to-r from-white via-white/80 to-gray-500 bg-clip-text text-transparent">
            Synthesize.
          </span>
        </h1>

        {/* SUB-CAPTION */}
        <p className="mx-auto max-w-2xl text-gray-500 text-xl md:text-2xl font-serif italic leading-relaxed opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-forwards">
          "The unexamined collection is just digital noise. Muse is the bridge between consumption and consciousness."
        </p>

        {/* CTA SEQUENCE */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-10 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700 fill-mode-forwards">
          <button 
            type="button"
            onClick={() => onOpenAuth('signup')}
            className="group relative px-10 py-5 bg-white text-black font-bold uppercase tracking-[0.2em] text-[11px] rounded-full shadow-[0_20px_50px_rgba(255,255,255,0.15)] hover:-translate-y-1 hover:shadow-white/25 active:scale-95 transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-canvas-primary/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            <span className="relative z-10 flex items-center gap-3">
              Initialize Soul Link <ArrowRight size={16} />
            </span>
          </button>

          <button 
            type="button"
            onClick={onGuestEntry}
            className="group px-10 py-5 rounded-full border border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all flex items-center gap-3 cursor-pointer"
          >
            <Activity size={16} className="text-canvas-primary group-hover:scale-125 transition-transform" /> 
            Enter Observer Mode
          </button>

          <button 
            type="button"
            onClick={onWatchDemo}
            className="group px-10 py-5 rounded-full border border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-all flex items-center gap-3 cursor-pointer"
          >
            <Play size={16} className="text-canvas-primary group-hover:fill-canvas-primary transition-all" /> 
            Watch System Demo
          </button>
        </div>

        {/* SCROLL INDICATOR */}
        <div className="pt-20 opacity-40 animate-bounce">
          <div className="w-px h-12 bg-linear-to-b from-white to-transparent mx-auto" />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(10px, -15px) rotate(5deg); }
          66% { transform: translate(-15px, 10px) rotate(-5deg); }
        }
      `}</style>

    </section>
  );
}
