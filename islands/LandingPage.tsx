import { useState } from "preact/hooks";
import AuthModal from "./AuthModal.tsx";
import LandingHero from "./LandingHero.tsx";
import LandingFeatures from "./LandingFeatures.tsx";

export default function LandingPage() {
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);

  const handleWatchDemo = () => {
    document.getElementById("demo-preview")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="bg-[#050508] text-white font-sans overflow-hidden">
      {authMode && (
        <AuthModal initialMode={authMode} onClose={() => setAuthMode(null)} />
      )}

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050508] via-[#1a1a2e] to-[#050508]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full px-6 md:px-12 py-5 flex justify-between items-center z-[100] backdrop-blur-xl bg-[#050508]/40 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-gradient-to-br from-white/80 to-white/80 rounded-lg flex items-center justify-center text-black font-bold text-xs">
            M
          </div>
          <span className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Muse</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setAuthMode("login")}
            className="text-xs font-semibold text-gray-400 hover:text-white transition-colors hidden sm:block"
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("signup")}
            className="text-xs font-bold bg-gradient-to-r from-white/80 to-white/80 text-white px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all cursor-pointer"
          >
            Get Started →
          </button>
        </div>
      </header>

      <div className="pt-20">
        <LandingHero onOpenAuth={setAuthMode} onWatchDemo={handleWatchDemo} />
        <LandingFeatures />
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
}
