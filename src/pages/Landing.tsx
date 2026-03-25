import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, X, Sparkles, BookOpen, Layers, PenTool, Globe, ChevronDown } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import museLogo from '../assets/muse-logo.png';

// ─── Floating noise words (the "consumption" chaos) ───────────────────────────
const NOISE_WORDS = [
  'trending', 'viral', 'breaking', 'hot takes', 'controversy', 'sponsored',
  'you won\'t believe', 'follow', 'like', 'share', 'subscribe', 'algorithm',
  '#blessed', 'thread 🧵', 'ICYMI', 'new drop', 'ad', 'in case you missed',
  'RT', 'ratio', 'engage', 'clickbait', 'FOMO', 'dopamine', 'scroll',
  'recommended', 'pushed', 'analytics', 'growth', 'metrics', 'reach',
];

// ─── Feature cards ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: BookOpen,
    color: 'text-canvas-primary',
    glow: 'bg-canvas-primary/10',
    title: 'Rooms',
    desc: 'Thematic collection spaces. Music, architecture, philosophy — each content type finds its home.',
  },
  {
    icon: Layers,
    color: 'text-violet-400',
    glow: 'bg-violet-500/10',
    title: 'Threads',
    desc: 'Weave artifacts into meaningful patterns. Find the hidden connections in your curiosity.',
  },
  {
    icon: PenTool,
    color: 'text-emerald-400',
    glow: 'bg-emerald-500/10',
    title: 'Journal',
    desc: 'Private introspection space. Slow down. Reflect. Understand what you truly think.',
  },
  {
    icon: Sparkles,
    color: 'text-amber-400',
    glow: 'bg-amber-500/10',
    title: 'Weekly Mirror',
    desc: 'AI-curated reflection on your week. Patterns you didn\'t see. Insights that surprise you.',
  },
];

const PILLARS = [
  { label: 'Consume', color: 'text-rose-400', desc: 'Slow the scroll.' },
  { label: 'Collect', color: 'text-amber-400', desc: 'Curate with intention.' },
  { label: 'Contemplate', color: 'text-canvas-primary', desc: 'Find your patterns.' },
  { label: 'Create', color: 'text-emerald-400', desc: 'Turn insight into output.' },
];

// ─── Auth Modal ────────────────────────────────────────────────────────────────
function AuthModal({ mode, onClose }: { mode: 'signup' | 'login'; onClose: () => void }) {
  const navigate = useNavigate();
  const login = useUserStore(s => s.login);
  const [name, setName] = useState('');
  const [localMode, setLocalMode] = useState(mode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(); // Demo: bypass auth with any input
    navigate('/dashboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md z-10"
      >
        {/* Glow */}
        <div className="absolute -inset-4 bg-canvas-primary/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative bg-[#0f0f12] border border-white/10 rounded-[2.5rem] p-10 overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-canvas-primary/15 blur-3xl rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-violet-600/10 blur-3xl rounded-full" />

          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <img src={museLogo} alt="Muse" className="h-10 w-10 object-contain rounded-xl" />
              <div>
                <p className="text-[10px] font-bold text-canvas-primary uppercase tracking-[0.3em]">Muse</p>
                <p className="text-xs text-gray-500 font-serif italic">Turn consumption into creation</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold tracking-tight mb-2">
              {localMode === 'signup' ? 'Begin your Muse.' : 'Welcome back.'}
            </h2>
            <p className="text-sm text-gray-500 mb-8 font-serif italic">
              {localMode === 'signup'
                ? 'Your private creative loop starts here.'
                : 'Your rooms are waiting.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {localMode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="What shall we call you?"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 transition-all text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-canvas-primary text-white font-bold uppercase tracking-widest text-[11px] shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all cursor-pointer mt-2"
              >
                {localMode === 'signup' ? 'Enter Muse →' : 'Continue →'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-600 mt-6">
              {localMode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
              <button
                onClick={() => setLocalMode(localMode === 'signup' ? 'login' : 'signup')}
                className="text-white hover:text-canvas-primary transition-colors font-semibold cursor-pointer"
              >
                {localMode === 'signup' ? 'Log in' : 'Sign up'}
              </button>
            </p>

            <p className="text-center text-[10px] text-gray-700 mt-4 font-serif italic">
              Demo mode — any input (or none) will work
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Landing Page ──────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'signup' | 'login' | null>(null);
  const [noiseVisible, setNoiseVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ container: containerRef });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Scroll-based opacity/transform for each act
  const consumeOpacity = useTransform(smoothProgress, [0, 0.15, 0.22], [1, 1, 0]);
  const consumeY = useTransform(smoothProgress, [0, 0.22], [0, -80]);
  const consumeScale = useTransform(smoothProgress, [0, 0.2], [1, 0.95]);

  const collectOpacity = useTransform(smoothProgress, [0.2, 0.32, 0.42, 0.5], [0, 1, 1, 0]);
  const collectY = useTransform(smoothProgress, [0.2, 0.32, 0.5], [60, 0, -80]);

  const contemplateOpacity = useTransform(smoothProgress, [0.48, 0.6, 0.72, 0.8], [0, 1, 1, 0]);
  const contemplateY = useTransform(smoothProgress, [0.48, 0.6, 0.8], [60, 0, -80]);

  const createOpacity = useTransform(smoothProgress, [0.78, 0.9], [0, 1]);
  const createY = useTransform(smoothProgress, [0.78, 0.9], [60, 0]);

  // Noise word positions (randomized once)
  const noiseWords = NOISE_WORDS.map((w, i) => ({
    word: w,
    x: 5 + (i * 37.3) % 90,
    y: 2 + (i * 19.7) % 90,
    size: 9 + (i % 5) * 1.5,
    opacity: 0.08 + (i % 4) * 0.06,
    delay: i * 0.1,
  }));

  return (
    <div className="bg-[#07070a] text-white font-sans overflow-hidden">
      {/* AUTH MODAL */}
      <AnimatePresence>
        {authMode && (
          <AuthModal mode={authMode} onClose={() => setAuthMode(null)} />
        )}
      </AnimatePresence>

      {/* FIXED AMBIENT GLOWS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.07, 0.04] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-15%] left-[-15%] w-[70%] h-[70%] bg-canvas-primary blur-[150px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.06, 0.04] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] bg-violet-600 blur-[150px] rounded-full"
        />
      </div>

      {/* FIXED HEADER */}
      <header className="fixed top-0 left-0 w-full px-6 md:px-12 py-5 flex justify-between items-center z-[100]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <img src={museLogo} alt="Muse" className="h-9 w-9 object-contain rounded-xl" />
          <span className="text-lg font-bold tracking-tight">Muse</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => setAuthMode('login')}
            className="text-sm font-bold text-gray-400 hover:text-white transition-colors tracking-wide cursor-pointer px-4 py-2"
          >
            Log in
          </button>
          <button
            onClick={() => setAuthMode('signup')}
            className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-full hover:bg-canvas-primary hover:text-white transition-all cursor-pointer tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]"
          >
            Get Started
          </button>
        </motion.div>
      </header>

      {/* ─── SCROLL CONTAINER ──────────────────────────────────────────────────── */}
      <div ref={containerRef} className="h-screen overflow-y-scroll overflow-x-hidden scroll-smooth" style={{ scrollbarWidth: 'none' }}>

        {/* ── ACT 0 HERO ─────────────────────────────────────────────────────── */}
        <section className="min-h-screen flex flex-col items-center justify-center relative text-center px-6 py-32 z-10">
          {/* Noise words behind */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {noiseWords.map((n, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: n.opacity }}
                transition={{ delay: n.delay, duration: 1 }}
                className="absolute font-mono text-gray-600"
                style={{ left: `${n.x}%`, top: `${n.y}%`, fontSize: `${n.size}px` }}
              >
                {n.word}
              </motion.span>
            ))}
          </div>

          {/* Logo pulsing */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 relative"
          >
            <div className="absolute inset-0 bg-canvas-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
            <img
              src={museLogo}
              alt="Muse"
              className="relative w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_0_60px_rgba(99,102,241,0.5)]"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-none mb-6"
          >
            Turn consumption
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-canvas-primary via-violet-400 to-indigo-300">
              into creation.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-12 font-serif italic leading-relaxed"
          >
            "The app for people who don't just consume — they think, curate, and create."
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <button
              onClick={() => setAuthMode('signup')}
              className="group px-10 py-5 bg-canvas-primary text-white font-bold uppercase tracking-widest text-[11px] rounded-full flex items-center gap-3 shadow-[0_0_40px_rgba(99,102,241,0.35)] hover:-translate-y-1 hover:shadow-[0_0_60px_rgba(99,102,241,0.5)] transition-all cursor-pointer active:scale-95"
            >
              Start Your Muse
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setAuthMode('login')}
              className="px-10 py-5 bg-white/5 border border-white/10 text-gray-300 font-bold uppercase tracking-widest text-[11px] rounded-full hover:bg-white/10 hover:border-white/20 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              Log In
            </button>
          </motion.div>

          {/* Pillar loop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-16 flex items-center gap-2 flex-wrap justify-center"
          >
            {PILLARS.map((p, i) => (
              <React.Fragment key={p.label}>
                <span className={`text-[11px] font-bold uppercase tracking-widest ${p.color} px-3 py-1.5 rounded-full bg-white/5 border border-white/8`}>
                  {p.label}
                </span>
                {i < PILLARS.length - 1 && (
                  <span className="text-gray-700 text-xs">→</span>
                )}
              </React.Fragment>
            ))}
            <span className="text-gray-700 text-xs">↩</span>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">Scroll to explore</span>
            <ChevronDown size={18} />
          </motion.div>
        </section>

        {/* ── THE 4-PILLAR STORY ─────────────────────────────────────────────── */}
        <section className="min-h-[200vh] relative z-10">
          <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
            {/* Horizontal rule divider */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/5 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full h-full">
              {PILLARS.map((p, i) => (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.7 }}
                  className={`flex flex-col items-center justify-center text-center p-10 border-white/5 ${i % 2 === 0 ? 'border-r' : ''} ${i < 2 ? 'border-b' : ''} relative group hover:bg-white/[0.02] transition-all`}
                >
                  <div className={`text-5xl md:text-6xl font-bold ${p.color} mb-3 group-hover:scale-110 transition-transform duration-500`}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{p.label}</h3>
                  <p className="text-gray-500 font-serif italic text-base max-w-xs leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES GRID ─────────────────────────────────────────────────── */}
        <section className="py-32 px-6 md:px-16 max-w-6xl mx-auto z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-canvas-primary block mb-4">Everything you need</span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-5">
              One sanctuary.
              <br />
              <span className="text-gray-500">Four dimensions.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-lg mx-auto font-serif italic">
              Each feature is a station in your creative loop.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-8 rounded-4xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all overflow-hidden cursor-default"
              >
                <div className={`absolute -top-10 -right-10 w-32 h-32 ${f.glow} blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                <div className={`w-12 h-12 ${f.glow} rounded-2xl flex items-center justify-center mb-6`}>
                  <f.icon size={22} className={f.color} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{f.title}</h3>
                <p className="text-gray-400 font-serif italic leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── COMMUNITY STRIP ───────────────────────────────────────────────── */}
        <section className="py-24 px-6 md:px-16 max-w-6xl mx-auto z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-4xl bg-linear-to-br from-canvas-primary/20 via-violet-600/10 to-transparent border border-canvas-primary/20 p-12 md:p-16 text-center"
          >
            <div className="absolute inset-0 bg-canvas-primary/5 blur-3xl" />
            <div className="relative z-10">
              <Globe size={32} className="text-canvas-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
                You're not browsing alone.
              </h2>
              <p className="text-gray-400 text-lg max-w-lg mx-auto leading-relaxed font-serif italic mb-10">
                "Circles" of thinkers explore the same themes — architecture, silence, identity, sound. Join a live dialogue or curate in private. Your call.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                {['Silence', 'Brutalism', 'Identity', 'Ambience', 'Flow State', 'Minimalism'].map(t => (
                  <span key={t} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-widest text-gray-300">
                    {t}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setAuthMode('signup')}
                className="px-10 py-4 bg-canvas-primary text-white font-bold uppercase tracking-widest text-[11px] rounded-full shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Join the Community
              </button>
            </div>
          </motion.div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-32 z-10 relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-canvas-primary/8 blur-[120px] rounded-full" />
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10 relative"
          >
            <div className="absolute inset-0 bg-canvas-primary/20 blur-3xl scale-150 animate-pulse" />
            <img
              src={museLogo}
              alt="Muse"
              className="relative w-40 h-40 object-contain drop-shadow-[0_0_80px_rgba(99,102,241,0.6)]"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-none"
          >
            Ready to find your
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-canvas-primary to-violet-400">
              creative loop?
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="text-xl text-gray-400 max-w-lg mx-auto mb-12 font-serif italic leading-relaxed"
          >
            "Not another app. A method. A mirror. A muse."
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            onClick={() => setAuthMode('signup')}
            className="group px-12 py-6 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-full flex items-center gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(99,102,241,0.3)] hover:bg-canvas-primary hover:text-white transition-all cursor-pointer active:scale-95 mx-auto"
          >
            Start for Free
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="text-[11px] text-gray-600 mt-6 font-serif italic"
          >
            Demo mode — sign up or log in with anything
          </motion.p>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-10 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-600 text-[11px] font-bold uppercase tracking-widest z-10 relative">
          <div className="flex items-center gap-2">
            <img src={museLogo} alt="Muse" className="h-6 w-6 object-contain rounded-lg opacity-60" />
            <span>Muse © 2025</span>
          </div>
          <span className="font-serif italic normal-case text-gray-700 text-xs">Turn consumption into creation.</span>
          <div className="flex gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
