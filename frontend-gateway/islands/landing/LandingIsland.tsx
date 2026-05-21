import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import AuthModal from "../modals/AuthModal.tsx";

const NOISE_WORDS = [
  "trending",
  "viral",
  "breaking",
  "hot takes",
  "controversy",
  "sponsored",
  "you won't believe",
  "follow",
  "like",
  "share",
  "subscribe",
  "algorithm",
  "#blessed",
  "thread 🧵",
  "ICYMI",
  "new drop",
  "ad",
  "in case you missed",
  "RT",
  "ratio",
  "engage",
  "clickbait",
  "FOMO",
  "dopamine",
  "scroll",
  "recommended",
  "pushed",
  "analytics",
  "growth",
  "metrics",
  "reach",
];

const PILLARS = [
  { label: "Consume", color: "text-rose-400", desc: "Slow the scroll." },
  { label: "Collect", color: "text-amber-400", desc: "Curate with intention." },
  {
    label: "Contemplate",
    color: "text-indigo-400",
    desc: "Find your patterns.",
  }, // Replaced text-canvas-primary to match Tailwind
  {
    label: "Create",
    color: "text-emerald-400",
    desc: "Turn insight into output.",
  },
];

const FEATURES = [
  {
    icon: Icons.BookOpen,
    color: "text-indigo-400",
    glow: "bg-indigo-500/10",
    title: "Rooms",
    desc:
      "Thematic collection spaces. Music, architecture, philosophy — each content type finds its home.",
  },
  {
    icon: Icons.Layers,
    color: "text-violet-400",
    glow: "bg-violet-500/10",
    title: "Threads",
    desc:
      "Weave artifacts into meaningful patterns. Find the hidden connections in your curiosity.",
  },
  {
    icon: Icons.PenTool,
    color: "text-emerald-400",
    glow: "bg-emerald-500/10",
    title: "Journal",
    desc:
      "Private introspection space. Slow down. Reflect. Understand what you truly think.",
  },
  {
    icon: Icons.Aperture,
    color: "text-amber-400",
    glow: "bg-amber-500/10",
    title: "Weekly Mirror",
    desc:
      "AI-curated reflection on your week. Patterns you didn't see. Insights that surprise you.",
  },
];

export default function LandingIsland() {
  const [authMode, setAuthMode] = useState<"signup" | "login" | null>(null);

  // Generating noise positions on mount
  type NoiseLayer = {
    word: string;
    x: number;
    y: number;
    size: number;
    opacity: number;
    delay: number;
  };
  const [noiseLayers, setNoiseLayers] = useState<NoiseLayer[]>([]);

  useEffect(() => {
    setNoiseLayers(NOISE_WORDS.map((w, i) => ({
      word: w,
      x: 5 + (i * 37.3) % 90,
      y: 2 + (i * 19.7) % 90,
      size: 9 + (i % 5) * 1.5,
      opacity: 0.08 + (i % 4) * 0.06,
      delay: i * 0.1,
    })));
  }, []);

  return (
    <div className="bg-[#07070a] text-white font-sans overflow-hidden">
      {authMode && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setAuthMode(null)}
        />
      )}

      {/* FIXED AMBIENT GLOWS - CSS animations */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-15%] w-[70%] h-[70%] bg-indigo-500 blur-[150px] rounded-full opacity-5" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] bg-violet-600 blur-[150px] rounded-full opacity-5" />
      </div>

      {/* FIXED HEADER */}
      <header className="fixed top-0 left-0 w-full px-6 md:px-12 py-5 flex justify-between items-center z-[100] animate-in slide-in-from-top duration-500">
        <div className="flex items-center gap-3">
          <img
            src="/assets/muse-logo.png"
            alt="Muse"
            className="h-9 w-9 object-contain rounded-xl"
          />
          <span className="text-lg font-bold tracking-tight">Muse</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAuthMode("login")}
            className="text-sm font-bold text-gray-400 hover:text-white transition-colors tracking-wide cursor-pointer px-4 py-2"
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("signup")}
            className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-full hover:bg-canvas-primary hover:text-white transition-all cursor-pointer tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* SCROLL CONTAINER */}
      <div
        className="h-screen overflow-y-scroll overflow-x-hidden scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {/* ── ACT 0 HERO ─────────────────────────────────────────────────────── */}
        <section className="min-h-screen flex flex-col items-center justify-center relative text-center px-6 py-32 z-10 animate-in fade-in duration-1000">
          {/* Noise words behind */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {noiseLayers.map((n, i) => (
              <span
                key={i}
                className="absolute font-mono text-gray-600 animate-in fade-in"
                style={{
                  left: `${n.x}%`,
                  top: `${n.y}%`,
                  fontSize: `${n.size}px`,
                  opacity: n.opacity,
                  animationDelay: `${n.delay}s`,
                  animationFillMode: "both",
                }}
              >
                {n.word}
              </span>
            ))}
          </div>

          <div className="mb-8 relative animate-in slide-in-from-bottom-5 duration-700">
            <div className="absolute inset-0 bg-canvas-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
            <img
              src="/assets/muse-logo.png"
              alt="Muse"
              className="relative w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_0_60px_rgba(99,102,241,0.5)]"
            />
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-none mb-6 animate-in slide-in-from-bottom-5 duration-700 delay-150">
            Turn consumption
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-canvas-primary via-violet-400 to-indigo-300">
              into creation.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-12 font-serif italic leading-relaxed animate-in slide-in-from-bottom-5 duration-700 delay-300">
            "The app for people who don't just consume — they think, curate, and
            create."
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-bottom-5 duration-700 delay-500">
            <button
              type="button"
              onClick={() => setAuthMode("signup")}
              className="group px-10 py-5 bg-canvas-primary text-white font-bold uppercase tracking-widest text-[11px] rounded-full flex items-center gap-3 shadow-[0_0_40px_rgba(99,102,241,0.35)] hover:-translate-y-1 hover:shadow-[0_0_60px_rgba(99,102,241,0.5)] transition-all cursor-pointer active:scale-95"
            >
              Start Your Muse
              <Icons.ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className="px-10 py-5 bg-white/5 border border-white/10 text-gray-300 font-bold uppercase tracking-widest text-[11px] rounded-full hover:bg-white/10 hover:border-white/20 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              Log In
            </button>
          </div>

          <div className="mt-16 flex items-center gap-2 flex-wrap justify-center animate-in fade-in duration-1000 delay-700">
            {PILLARS.map((p, i) => (
              <div key={p.label} className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold uppercase tracking-widest ${p.color} px-3 py-1.5 rounded-full bg-white/5 border border-white/8`}
                >
                  {p.label}
                </span>
                {i < PILLARS.length - 1 && (
                  <span className="text-gray-700 text-xs">→</span>
                )}
              </div>
            ))}
            <span className="text-gray-700 text-xs">↩</span>
          </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 animate-bounce">
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Scroll to explore
            </span>
            <Icons.ChevronDown size={18} />
          </div>
        </section>

        {/* ── THE 4-PILLAR STORY ─────────────────────────────────────────────── */}
        <section className="min-h-screen relative z-10 py-32 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full h-full max-w-5xl mx-auto border border-white/5 rounded-[3rem] overflow-hidden">
            {PILLARS.map((p, i) => (
              <div
                key={p.label}
                className={`flex flex-col items-center justify-center text-center p-16 border-white/5 ${
                  i % 2 === 0 ? "md:border-r" : ""
                } ${
                  i < 2 ? "border-b md:border-b" : ""
                } relative group hover:bg-white/[0.02] transition-colors`}
              >
                <div
                  className={`text-5xl md:text-6xl font-bold ${p.color} mb-3 group-hover:scale-110 transition-transform duration-500`}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                  {p.label}
                </h3>
                <p className="text-gray-500 font-serif italic text-base max-w-xs leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES GRID ─────────────────────────────────────────────────── */}
        <section className="py-32 px-6 md:px-16 max-w-6xl mx-auto z-10 relative">
          <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-canvas-primary block mb-4">
              Everything you need
            </span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-5">
              One sanctuary.
              <br />
              <span className="text-gray-500">Four dimensions.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-lg mx-auto font-serif italic">
              Each feature is a station in your creative loop.
            </p>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="min-w-[320px] flex-shrink-0 snap-start group relative p-8 rounded-4xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all overflow-hidden cursor-default"
              >
                <div
                  className={`absolute -top-10 -right-10 w-32 h-32 ${f.glow} blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                />
                <div
                  className={`w-12 h-12 ${f.glow} rounded-2xl flex items-center justify-center mb-6`}
                >
                  {(() => {
                    const IconComp = f.icon as any;
                    return <IconComp size={22} className={f.color} />;
                  })()}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-gray-400 font-serif italic leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── COMMUNITY STRIP ───────────────────────────────────────────────── */}
        <section className="py-24 px-6 md:px-16 max-w-6xl mx-auto z-10 relative">
          <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-indigo-500/20 via-violet-600/10 to-transparent border border-indigo-500/20 p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-indigo-500/5 blur-3xl" />
            <div className="relative z-10">
              <Icons.Globe size={32} className="text-indigo-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
                You're not browsing alone.
              </h2>
              <p className="text-gray-400 text-lg max-w-lg mx-auto leading-relaxed font-serif italic mb-10">
                "Circles" of thinkers explore the same themes — architecture,
                silence, identity, sound. Join a live dialogue or curate in
                private. Your call.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                {[
                  "Silence",
                  "Brutalism",
                  "Identity",
                  "Ambience",
                  "Flow State",
                  "Minimalism",
                ].map((t) => (
                  <span
                    key={t}
                    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-widest text-gray-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className="px-10 py-4 bg-canvas-primary text-white font-bold uppercase tracking-widest text-[11px] rounded-full shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Join the Community
              </button>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 py-32 z-10 relative">
          <div className="mb-10 relative">
            <div className="absolute inset-0 bg-canvas-primary/20 blur-3xl scale-150 animate-pulse" />
            <img
              src="/assets/muse-logo.png"
              alt="Muse"
              className="relative w-40 h-40 object-contain drop-shadow-[0_0_80px_rgba(99,102,241,0.6)]"
            />
          </div>

          <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-none">
            Ready to find your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-canvas-primary to-violet-400">
              creative loop?
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-lg mx-auto mb-12 font-serif italic leading-relaxed">
            "Not another app. A method. A mirror. A muse."
          </p>

          <button
            type="button"
            onClick={() => setAuthMode("signup")}
            className="group px-12 py-6 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-full flex items-center gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(99,102,241,0.3)] hover:bg-canvas-primary hover:text-white transition-all cursor-pointer mx-auto"
          >
            Start for Free
            <Icons.ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>

          <p className="text-[11px] text-gray-600 mt-6 font-serif italic">
            Demo mode — sign up or log in with anything
          </p>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-10 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-600 text-[11px] font-bold uppercase tracking-widest z-10 relative">
          <div className="flex items-center gap-2">
            <img
              src="/assets/muse-logo.png"
              alt="Muse"
              className="h-6 w-6 object-contain rounded-lg opacity-60"
            />
            <span>Muse © 2025</span>
          </div>
          <span className="font-serif italic normal-case text-gray-700 text-xs">
            Turn consumption into creation.
          </span>
          <div className="flex gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">
              Privacy
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Terms
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
