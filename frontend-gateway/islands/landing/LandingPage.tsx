import { useState } from "preact/hooks";
import AuthModal from "../modals/AuthModal.tsx";
import SpectralHero from "./SpectralHero.tsx";
import SystemBento from "./SystemBento.tsx";
import { login } from "../../signals/user.ts";

export default function LandingPage() {
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);

  const handleWatchDemo = () => {
    login("demo@muse.app");
    globalThis.location.href = "/dashboard?demo=1";
  };

  return (
    <div className="bg-[#0a0a0a] text-white font-sans overflow-x-hidden selection:bg-canvas-primary selection:text-white">
      {authMode && (
        <AuthModal initialMode={authMode} onClose={() => setAuthMode(null)} />
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 w-full px-6 md:px-12 py-8 flex justify-between items-center z-[100] backdrop-blur-3xl bg-black/20 border-b border-white/5">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => globalThis.location.href = '/'}>
          <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-black font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tighter text-white leading-none">MUSE</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-gray-500 mt-1 leading-none">Intelligence</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-10">
          {['Ecosystem', 'Vision', 'Network', 'Ledger'].map(link => (
            <a key={link} href={`#${link.toLowerCase()}`} className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors">
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setAuthMode("login")}
            className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors hidden sm:block"
          >
            Terminal Access
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("signup")}
            className="group relative px-6 py-3 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-canvas-primary/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            <span className="relative z-10">Initialize Flow</span>
          </button>
        </div>
      </header>

      <main className="relative pt-20">
        {/* Grain Overlay */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-50" />
        
        <SpectralHero onOpenAuth={setAuthMode} onWatchDemo={handleWatchDemo} />
        
        <div id="ecosystem">
          <SystemBento />
        </div>

        {/* FOOTER CTA */}
        <section className="max-w-[1800px] mx-auto px-6 py-32 text-center">
          <div className="bg-linear-to-b from-white/[0.03] to-transparent border border-white/5 rounded-[4rem] p-20 md:p-32 space-y-12">
            <h2 className="text-5xl md:text-8xl font-bold tracking-tight text-white leading-[0.9]">
              Ready to <span className="text-gray-700 italic font-serif">Awaken?</span>
            </h2>
            <p className="max-w-2xl mx-auto text-gray-500 text-xl font-serif italic">
              Stop consuming. Start synthesizing. Your private creative loop is one click away.
            </p>
            <button 
              onClick={() => setAuthMode('signup')}
              className="px-12 py-6 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full shadow-3xl hover:-translate-y-1 active:scale-95 transition-all cursor-pointer"
            >
              Begin Initialization
            </button>
          </div>
        </section>

        {/* FINAL FOOTER */}
        <footer className="max-w-[1800px] mx-auto px-10 py-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4 opacity-40">
            <div className="h-6 w-6 bg-white rounded flex items-center justify-center text-black font-bold text-[10px]">M</div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Muse Intelligence © 2026</span>
          </div>
          <div className="flex gap-10">
            {['Privacy', 'Legal', 'Source', 'Status'].map(link => (
              <a key={link} href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-700 hover:text-white transition-colors">
                {link}
              </a>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
}
