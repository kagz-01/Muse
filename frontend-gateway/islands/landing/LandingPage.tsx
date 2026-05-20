import { useState, useEffect } from "preact/hooks";
import AuthModal from "../modals/AuthModal.tsx";
import SpectralHero from "./SpectralHero.tsx";
import SystemBento from "./SystemBento.tsx";
import AboutSection from "./AboutSection.tsx";
import LedgerSection from "./LedgerSection.tsx";
import LandingFooter from "./LandingFooter.tsx";
import DemoVideo from "./DemoVideo.tsx";
import { login } from "../../signals/user.ts";
import { toggleTheme, appThemeSignal, initializeTheme } from "../../signals/ui.ts";
import { Infinity as InfinityIcon, Sun, Moon, Circle, CloudSun } from "lucide-preact";

export default function LandingPage() {
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  useEffect(() => {
    initializeTheme();
  }, []);

  const handleWatchDemo = () => {
    setIsDemoOpen(true);
  };

  const handleGuestEntry = () => {
    login("demo@muse.app");
    globalThis.location.href = "/dashboard?demo=1";
  };

  const currentTheme = appThemeSignal.value;

  return (
    <div className="bg-[var(--muse-bg)] text-[var(--muse-text)] font-sans overflow-x-hidden selection:bg-canvas-primary selection:text-white transition-colors duration-300">
      {authMode && (
        <AuthModal initialMode={authMode} onClose={() => setAuthMode(null)} />
      )}

      {isDemoOpen && (
        <DemoVideo isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      )}

      {/* DYNAMIC BACKGROUND VIDEO (Observer Perspective) */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-[var(--muse-bg)] via-transparent to-[var(--muse-bg)] z-10 transition-colors duration-300" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 z-20" />
        
        {/* We would use a real loop video here. For now, we simulate with a pulse and movement */}
        <div className="absolute inset-0 bg-gradient-radial from-canvas-primary/20 to-transparent animate-slow-pulse blur-[150px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full px-6 md:px-12 py-8 flex justify-between items-center z-[100] backdrop-blur-3xl bg-[var(--muse-overlay)] border-b border-[var(--muse-border)] transition-colors duration-300">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => globalThis.location.href = '/'}>
          <div className="h-10 w-10 bg-[var(--muse-text)] rounded-2xl flex items-center justify-center text-[var(--muse-bg)] font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-all duration-300">
            <InfinityIcon size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tighter text-[var(--muse-text)] leading-none transition-colors duration-300">MUSE</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-canvas-primary mt-1 leading-none">Intelligence</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-10">
          {['About', 'Ecosystem', 'Ledger'].map(link => (
            <a key={link} href={`#${link.toLowerCase()}`} className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-colors duration-300">
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-[var(--muse-surface)] border border-[var(--muse-border)] hover:border-[var(--muse-text)]/20 flex items-center justify-center transition-all text-[var(--muse-muted)] hover:text-[var(--muse-text)] duration-300"
            title={`Switch to next theme (Current: ${currentTheme})`}
          >
            {currentTheme === 'dark' && <Moon size={16} />}
            {currentTheme === 'dim' && <Circle size={14} fill="currentColor" />}
            {currentTheme === 'tint' && <CloudSun size={16} />}
            {currentTheme === 'light' && <Sun size={16} fill="currentColor" />}
          </button>
          
          <button
            type="button"
            onClick={() => setAuthMode("login")}
            className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-colors hidden sm:block duration-300"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("signup")}
            className="group relative px-6 py-3 rounded-full bg-[var(--muse-text)] text-[var(--muse-bg)] text-[10px] font-bold uppercase tracking-widest shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer overflow-hidden duration-300"
          >
            <div className="absolute inset-0 bg-canvas-primary/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            <span className="relative z-10">Get Started</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 pt-20">
        
        <SpectralHero 
          onOpenAuth={setAuthMode} 
          onWatchDemo={handleWatchDemo} 
          onGuestEntry={handleGuestEntry}
        />
        
        <AboutSection />
        
        <div id="ecosystem">
          <SystemBento />
        </div>

        <LedgerSection />

        {/* FOOTER CTA */}
        <section className="max-w-[1800px] mx-auto px-6 py-32 text-center">
          <div className="bg-linear-to-b from-[var(--muse-surface)] to-transparent border border-[var(--muse-border)] rounded-[4rem] p-20 md:p-32 space-y-12 transition-all duration-300">
            <h2 className="text-5xl md:text-8xl font-bold tracking-tight text-[var(--muse-text)] leading-[0.9] transition-colors duration-300">
              Ready to <span className="text-[var(--muse-muted)] italic font-serif transition-colors duration-300">Awaken?</span>
            </h2>
            <p className="max-w-2xl mx-auto text-[var(--muse-muted)] text-xl font-serif italic transition-colors duration-300">
              Stop consuming. Start synthesizing. Your private creative loop is one click away.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
               <button 
                 type="button"
                 onClick={() => setAuthMode('signup')}
                 className="px-12 py-6 bg-[var(--muse-text)] text-[var(--muse-bg)] font-bold uppercase tracking-widest text-xs rounded-full shadow-3xl hover:-translate-y-1 active:scale-95 transition-all cursor-pointer duration-300"
               >
                 Get Started
               </button>
               <button 
                 type="button"
                 onClick={handleGuestEntry}
                 className="px-12 py-6 bg-[var(--muse-surface)] border border-[var(--muse-border)] text-[var(--muse-text)] font-bold uppercase tracking-widest text-xs rounded-full hover:bg-[var(--muse-surface-soft)] transition-all cursor-pointer duration-300"
               >
                 Continue as Guest
               </button>
            </div>
          </div>
        </section>

        <LandingFooter />
      </main>

      <style>{`
        @keyframes slow-pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        .animate-slow-pulse {
          animation: slow-pulse 15s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
