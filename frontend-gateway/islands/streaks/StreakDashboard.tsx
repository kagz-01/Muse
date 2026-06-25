import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { globalStreakSignal, loadGlobalStreak, shareSpark } from "../../signals/streaks.ts";
import { userSignal } from "../../signals/user.ts";

export default function StreakDashboard({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [sharing, setSharing] = useState(false);
  const [justShared, setJustShared] = useState(false);
  const streak = globalStreakSignal.value;
  const user = userSignal.value;

  useEffect(() => {
    if (isOpen) {
      loadGlobalStreak();
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleShare = async (mode: "ghost" | "aura" | "clear") => {
    setSharing(true);
    const success = await shareSpark(mode);
    setSharing(false);
    if (success) {
      setJustShared(true);
      setTimeout(() => setJustShared(false), 3000);
    }
  };

  // Determine streak flame color based on streak count
  let flameColor = "text-orange-500";
  let flameBg = "bg-orange-500/10";
  let flameShadow = "shadow-[0_0_50px_rgba(249,115,22,0.2)]";

  if (streak && streak.currentStreak >= 7) {
    flameColor = "text-rose-500";
    flameBg = "bg-rose-500/10";
    flameShadow = "shadow-[0_0_60px_rgba(244,63,94,0.3)]";
  }
  if (streak && streak.currentStreak >= 30) {
    flameColor = "text-purple-500";
    flameBg = "bg-purple-500/10";
    flameShadow = "shadow-[0_0_80px_rgba(168,85,247,0.4)]";
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      {/* Backdrop blur */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-canvas-bg-dark/80 backdrop-blur-[40px] cursor-pointer"
      />

      <div className="relative w-full max-w-2xl bg-[var(--muse-surface)] border border-[var(--muse-border)] rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-500 overflow-hidden">
        
        {/* Decorative background glow */}
        <div className={`absolute inset-0 pointer-events-none opacity-50 ${flameShadow}`} />

        <button 
          type="button"
          onClick={onClose} 
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[var(--muse-surface-soft)] flex items-center justify-center text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-colors z-10"
        >
          {/* @ts-ignore dynamic import */}
          <Icons.X size={20} />
        </button>

        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--muse-muted)] mb-2 relative z-10">
          Cognitive Momentum
        </h3>
        <h2 className="text-3xl font-bold tracking-tight text-[var(--muse-text)] italic font-serif relative z-10 mb-8">
          Resonance Streaks
        </h2>

        {/* The Flame Display */}
        <div className="relative flex flex-col items-center justify-center mb-10 z-10">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center ${flameBg} border border-[var(--muse-border)] mb-4`}>
            {/* @ts-ignore dynamic import */}
            <Icons.Flame size={64} className={`${flameColor} ${streak && streak.currentStreak > 0 ? "animate-pulse" : "opacity-50"}`} />
          </div>
          <div className="text-5xl font-black text-[var(--muse-text)] tracking-tighter">
            {streak ? streak.currentStreak : 0}
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--muse-muted)] mt-2">
            Day Streak
          </p>
        </div>

        {justShared ? (
          <div className="w-full text-center py-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
            {/* @ts-ignore dynamic import */}
            <Icons.CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
            <p className="text-xl font-bold text-[var(--muse-text)] mb-2">Spark Shared</p>
            <p className="text-sm text-[var(--muse-muted)]">Your momentum grows stronger.</p>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4 relative z-10">
            <h4 className="text-center text-sm font-bold text-[var(--muse-text)] mb-2">Share a Spark to maintain your streak</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ghost Mode */}
              <button 
                type="button"
                onClick={() => handleShare("ghost")}
                disabled={sharing}
                className="flex flex-col gap-3 p-5 rounded-3xl bg-[var(--muse-surface-soft)] border border-[var(--muse-border)] hover:border-gray-500/30 transition-all text-left group"
              >
                {/* @ts-ignore dynamic import */}
                <Icons.Ghost size={24} className="text-gray-400 group-hover:text-gray-300" />
                <div>
                  <p className="text-sm font-bold text-[var(--muse-text)]">Ghost Mode</p>
                  <p className="text-[10px] text-[var(--muse-muted)] leading-relaxed mt-1">
                    Share a cryptographic hash. Private, but proven.
                  </p>
                </div>
              </button>

              {/* Aura Mode */}
              <button 
                type="button"
                onClick={() => handleShare("aura")}
                disabled={sharing}
                className="flex flex-col gap-3 p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 hover:border-indigo-500/30 transition-all text-left group"
              >
                {/* @ts-ignore dynamic import */}
                <Icons.Sparkles size={24} className="text-indigo-400 group-hover:text-indigo-300" />
                <div>
                  <p className="text-sm font-bold text-[var(--muse-text)]">Aura Mode</p>
                  <p className="text-[10px] text-[var(--muse-muted)] leading-relaxed mt-1">
                    Share an AI-generated emotional color gradient.
                  </p>
                </div>
              </button>

              {/* Clear Mode */}
              <button 
                type="button"
                onClick={() => handleShare("clear")}
                disabled={sharing}
                className="flex flex-col gap-3 p-5 rounded-3xl bg-canvas-primary/5 border border-canvas-primary/10 hover:border-canvas-primary/30 transition-all text-left group"
              >
                {/* @ts-ignore dynamic import */}
                <Icons.Eye size={24} className="text-canvas-primary group-hover:text-canvas-primary/80" />
                <div>
                  <p className="text-sm font-bold text-[var(--muse-text)]">Clear Mode</p>
                  <p className="text-[10px] text-[var(--muse-muted)] leading-relaxed mt-1">
                    Share a blurred preview of your actual synthesis.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
