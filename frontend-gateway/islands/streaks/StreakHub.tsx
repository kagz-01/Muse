import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  globalStreakSignal,
  loadGlobalStreak,
  setSparkMode,
  shareSpark,
  streaksSignal,
} from "../../signals/streaks.ts";
import { userSignal } from "../../signals/user.ts";

export default function StreakHub() {
  const [sharing, setSharing] = useState(false);
  const [justShared, setJustShared] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const streak = globalStreakSignal.value;
  const user = userSignal.value;
  const partnerStreaks = streaksSignal.value;

  useEffect(() => {
    loadGlobalStreak().then(() => setIsInitializing(false));
  }, []);

  if (!user || isInitializing) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--muse-accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleSetMode = async (mode: "ghost" | "aura" | "clear") => {
    setSharing(true);
    await setSparkMode(mode);
    setSharing(false);
    setShowSettings(false);
  };

  const handleShare = async () => {
    setSharing(true);
    const success = await shareSpark();
    setSharing(false);
    if (success) {
      setJustShared(true);
      setTimeout(() => setJustShared(false), 3000);
    }
  };

  const needsOnboarding = streak && !streak.defaultSparkMode;

  if (needsOnboarding || showSettings) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--muse-bg)] animate-in fade-in duration-500">
        <div className="max-w-3xl w-full text-center">
          {showSettings && (
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="absolute top-8 left-8 flex items-center gap-2 text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-colors"
            >
              {/* @ts-ignore dynamic import */}
              <Icons.ArrowLeft size={20} />
              <span className="text-sm font-bold uppercase tracking-widest">Back to Hub</span>
            </button>
          )}

          <h3 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--muse-accent)] mb-4">
            {showSettings ? "Settings" : "Onboarding"}
          </h3>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--muse-text)] italic font-serif mb-6">
            Choose Your Footprint
          </h2>
          <p className="text-lg text-[var(--muse-muted)] mb-12 max-w-xl mx-auto">
            How do you want to show your cognitive momentum? Your Spark is the proof of your reflection.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              type="button"
              onClick={() => handleSetMode("ghost")}
              disabled={sharing}
              className={`flex flex-col gap-4 p-8 rounded-[2rem] border transition-all text-left group ${
                streak?.defaultSparkMode === "ghost"
                  ? "bg-[var(--muse-surface-soft)] border-gray-400/50 shadow-[0_0_30px_rgba(156,163,175,0.2)]"
                  : "bg-[var(--muse-surface)] border-[var(--muse-border)] hover:border-gray-500/30"
              }`}
            >
              {/* @ts-ignore dynamic import */}
              <Icons.Ghost size={32} className="text-gray-400 group-hover:text-gray-300 transition-colors" />
              <div>
                <p className="text-xl font-bold text-[var(--muse-text)] mb-2">Anonymous</p>
                <p className="text-sm text-[var(--muse-muted)] leading-relaxed">
                  Just show that you were active today. Content remains completely hidden.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSetMode("aura")}
              disabled={sharing}
              className={`flex flex-col gap-4 p-8 rounded-[2rem] border transition-all text-left group ${
                streak?.defaultSparkMode === "aura"
                  ? "bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                  : "bg-[var(--muse-surface)] border-[var(--muse-border)] hover:border-indigo-500/30"
              }`}
            >
              {/* @ts-ignore dynamic import */}
              <Icons.Sparkles size={32} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              <div>
                <p className="text-xl font-bold text-[var(--muse-text)] mb-2">Mood Only</p>
                <p className="text-sm text-[var(--muse-muted)] leading-relaxed">
                  Share a colorful aura representing the general emotion of your thought.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSetMode("clear")}
              disabled={sharing}
              className={`flex flex-col gap-4 p-8 rounded-[2rem] border transition-all text-left group ${
                streak?.defaultSparkMode === "clear"
                  ? "bg-canvas-primary/10 border-canvas-primary/50 shadow-[0_0_30px_rgba(var(--muse-accent-rgb),0.3)]"
                  : "bg-[var(--muse-surface)] border-[var(--muse-border)] hover:border-canvas-primary/30"
              }`}
            >
              {/* @ts-ignore dynamic import */}
              <Icons.Eye size={32} className="text-canvas-primary group-hover:text-canvas-primary/80 transition-colors" />
              <div>
                <p className="text-xl font-bold text-[var(--muse-text)] mb-2">Public</p>
                <p className="text-sm text-[var(--muse-muted)] leading-relaxed">
                  Show everyone a blurred preview of your actual synthesis.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN HUB ---
  let flameColor = "text-orange-500";
  let flameBg = "bg-orange-500/10";
  let flameShadow = "shadow-[0_0_100px_rgba(249,115,22,0.15)]";

  if (streak && streak.currentStreak >= 7) {
    flameColor = "text-rose-500";
    flameBg = "bg-rose-500/10";
    flameShadow = "shadow-[0_0_120px_rgba(244,63,94,0.2)]";
  }
  if (streak && streak.currentStreak >= 30) {
    flameColor = "text-purple-500";
    flameBg = "bg-purple-500/10";
    flameShadow = "shadow-[0_0_150px_rgba(168,85,247,0.3)]";
  }

  return (
    <div className="w-full min-h-screen flex flex-col pb-24 relative overflow-hidden bg-[var(--muse-bg)]">
      {/* Settings Button */}
      <div className="absolute top-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="w-12 h-12 rounded-full bg-[var(--muse-surface)] border border-[var(--muse-border)] flex items-center justify-center text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:bg-[var(--muse-surface-soft)] transition-all shadow-md cursor-pointer"
        >
          {/* @ts-ignore dynamic import */}
          <Icons.Settings2 size={20} />
        </button>
      </div>

      {/* Decorative background glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full pointer-events-none opacity-50 ${flameShadow} transition-all duration-1000`} />

      {/* Main Flame Section */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 pt-10 pb-8">
        <h3 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--muse-muted)] mb-4">
          Cognitive Momentum
        </h3>
        
        <div className="relative flex flex-col items-center justify-center mb-8">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center ${flameBg} border border-[var(--muse-border)] mb-4 transition-all duration-700`}>
            {/* @ts-ignore dynamic import */}
            <Icons.Flame size={64} className={`${flameColor} ${streak && streak.currentStreak > 0 ? "animate-pulse" : "opacity-50"} transition-colors duration-700`} />
          </div>
          <div className="text-6xl font-black text-[var(--muse-text)] tracking-tighter">
            {streak ? streak.currentStreak : 0}
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--muse-muted)] mt-1">
            Day Streak
          </p>
        </div>

        {justShared ? (
          <div className="w-full max-w-sm text-center py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* @ts-ignore dynamic import */}
            <Icons.CheckCircle size={32} className="text-emerald-500 mx-auto mb-4" />
            <p className="text-xl font-bold text-[var(--muse-text)]">Spark Shared</p>
            <p className="text-sm text-[var(--muse-muted)]">Momentum captured.</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--muse-accent)] to-[var(--muse-accent-dark)] text-white font-bold text-lg shadow-[0_0_30px_rgba(var(--muse-accent-rgb),0.4)] hover:shadow-[0_0_50px_rgba(var(--muse-accent-rgb),0.6)] hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 flex items-center gap-3 cursor-pointer"
          >
            {/* @ts-ignore dynamic import */}
            <Icons.Zap size={20} />
            Share Spark
          </button>
        )}
      </div>

      {/* Social / Entanglements Section */}
      <div className="w-full max-w-5xl mx-auto px-6 py-12 relative z-10 border-t border-[var(--muse-border)]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[var(--muse-text)] font-serif italic">Entanglements</h2>
          <button className="text-sm font-bold uppercase tracking-widest text-[var(--muse-accent)] hover:text-[var(--muse-accent-dark)] transition-colors">
            Manage Network
          </button>
        </div>

        {partnerStreaks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerStreaks.map((pStreak) => (
              <div key={pStreak.id} className="p-6 rounded-3xl bg-[var(--muse-surface)] border border-[var(--muse-border)] flex items-center gap-4 hover:border-[var(--muse-accent)] transition-colors cursor-pointer group">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
                  <span className="text-xl font-bold text-indigo-400">{pStreak.partnerName.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-[var(--muse-text)]">{pStreak.partnerName}</p>
                  <p className="text-sm text-[var(--muse-muted)] line-clamp-1">{pStreak.history[0]?.action || "No history yet"}</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  {/* @ts-ignore dynamic import */}
                  <Icons.Flame size={20} className="text-orange-500 mb-1" />
                  <span className="text-lg font-black text-[var(--muse-text)]">{pStreak.count}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full py-12 text-center rounded-3xl bg-[var(--muse-surface-soft)] border border-[var(--muse-border)] border-dashed">
            {/* @ts-ignore dynamic import */}
            <Icons.Users size={48} className="mx-auto text-[var(--muse-muted)] mb-4" />
            <p className="text-lg font-bold text-[var(--muse-text)]">No Entanglements Yet</p>
            <p className="text-sm text-[var(--muse-muted)] mb-6 max-w-sm mx-auto">
              Streaks are more powerful when shared. Invite a resonance partner to lock in your momentum together.
            </p>
            <button className="px-6 py-3 rounded-full bg-[var(--muse-surface)] border border-[var(--muse-border)] text-[var(--muse-text)] hover:bg-[var(--muse-surface-soft)] transition-colors font-medium">
              Find Partners
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
