import { useEffect, useState } from "preact/hooks";
import AuthModal from "../modals/AuthModal.tsx";
import SpectralHero from "./SpectralHero.tsx";
import SystemBento from "./SystemBento.tsx";
import AboutSection from "./AboutSection.tsx";
import LedgerSection from "./LedgerSection.tsx";
import LandingFooter from "./LandingFooter.tsx";
import DemoVideo from "./DemoVideo.tsx";
import BrandModal from "./BrandModal.tsx";
import { login } from "../../signals/user.ts";
import {
  appThemeSignal,
  initializeTheme,
  toggleTheme,
} from "../../signals/ui.ts";
import * as Icons from "lucide-preact";

export default function LandingPage() {
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);

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
        <AuthModal
          initialMode={authMode}
          onClose={() => setAuthMode(null)}
        />
      )}

      {isDemoOpen && (
        <DemoVideo
          isOpen={isDemoOpen}
          onClose={() => setIsDemoOpen(false)}
        />
      )}

      {isBrandOpen && (
        <BrandModal
          onClose={() => setIsBrandOpen(false)}
          onOpenAuth={setAuthMode}
        />
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
        <div
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => setIsBrandOpen(true)}
        >
          <div className="h-10 w-10 bg-[var(--muse-text)] rounded-2xl flex items-center justify-center text-[var(--muse-bg)] font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-all duration-300">
            <Icons.Infinity size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tighter text-[var(--muse-text)] leading-none transition-colors duration-300">
              MUSE
            </span>
            <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-canvas-primary mt-1 leading-none">
              Intelligence
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-10">
          {[
            { label: "About", href: "#about" },
            { label: "Ecosystem", href: "#ecosystem" },
            { label: "Ledger", href: "#ledger" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(link.href.slice(1));
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-colors duration-300"
            >
              {link.label}
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
            {currentTheme === "dark" && <Icons.Moon size={16} />}
            {currentTheme === "dim" && <Icons.Circle size={14} fill="currentColor" />}
            {currentTheme === "tint" && <Icons.CloudSun size={16} />}
            {currentTheme === "light" && <Icons.Sun size={16} fill="currentColor" />}
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

        <div id="ledger">
          <LedgerSection onCTA={() => setAuthMode("signup")} onGuestEntry={handleGuestEntry} />
        </div>



        <LandingFooter />
      </main>

      <style>
        {`
        @keyframes slow-pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        .animate-slow-pulse {
          animation: slow-pulse 15s infinite ease-in-out;
        }
        html { scroll-behavior: smooth; }
      `}
      </style>
    </div>
  );
}
