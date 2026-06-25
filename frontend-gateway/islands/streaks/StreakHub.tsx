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
      <div className="w-full min-h-screen flex flex-col p-6 lg:p-12 bg-[#0a0a0a] animate-in fade-in duration-500">
        <div className="max-w-4xl w-full mx-auto relative mt-8 lg:mt-16">
          {!needsOnboarding && (
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="absolute -top-16 left-0 flex items-center gap-2 text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-colors"
            >
              {/* @ts-ignore dynamic import */}
              <Icons.ArrowLeft size={20} />
              <span className="text-sm font-bold uppercase tracking-widest">Back to Hub</span>
            </button>
          )}

          <h3 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--muse-muted)] mb-8">
            {needsOnboarding ? "Onboarding" : "Settings"}
          </h3>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--muse-text)] italic font-serif mb-12">
            {needsOnboarding ? "Configure Your Space" : "Manage Momentum"}
          </h2>

          <div className="flex flex-col gap-10">
            {/* FOOTPRINT / PRIVACY MODE SECTION */}
            <section>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--muse-muted)] mb-4">
                Footprint (Privacy Mode)
              </h4>
              <div className="flex flex-col rounded-2xl bg-[#111111] border border-gray-800/50 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* @ts-ignore dynamic import */}
                    <Icons.Ghost size={20} className="text-gray-400" />
                    <div>
                      <p className="text-base font-bold text-white">Anonymous</p>
                      <p className="text-xs text-gray-400">Just show activity. Content remains hidden.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSetMode("ghost")}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${streak?.defaultSparkMode === "ghost" ? "bg-[var(--muse-accent)]" : "bg-gray-800"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${streak?.defaultSparkMode === "ghost" ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-5 border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* @ts-ignore dynamic import */}
                    <Icons.Sparkles size={20} className="text-indigo-400" />
                    <div>
                      <p className="text-base font-bold text-white">Mood Only</p>
                      <p className="text-xs text-gray-400">Share a colorful aura representing emotion.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSetMode("aura")}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${streak?.defaultSparkMode === "aura" ? "bg-indigo-500" : "bg-gray-800"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${streak?.defaultSparkMode === "aura" ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* @ts-ignore dynamic import */}
                    <Icons.Eye size={20} className="text-canvas-primary" />
                    <div>
                      <p className="text-base font-bold text-white">Public</p>
                      <p className="text-xs text-gray-400">Show a blurred preview of your synthesis.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSetMode("clear")}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${streak?.defaultSparkMode === "clear" ? "bg-canvas-primary" : "bg-gray-800"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${streak?.defaultSparkMode === "clear" ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>
            </section>

            {/* PREFERENCES SECTION */}
            <section>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--muse-muted)] mb-4">
                Preferences
              </h4>
              <div className="flex flex-col rounded-2xl bg-[#111111] border border-gray-800/50 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-800/50 hover:bg-white/5 transition-colors opacity-60">
                  <div className="flex items-center gap-4">
                    {/* @ts-ignore dynamic import */}
                    <Icons.Repeat size={20} className="text-gray-400" />
                    <div>
                      <p className="text-base font-bold text-white flex items-center gap-2">Auto-share Sparks <span className="text-[9px] px-1.5 py-0.5 rounded border border-gray-700 bg-gray-800 uppercase tracking-wider">Soon</span></p>
                      <p className="text-xs text-gray-400">Automatically share when you complete a synthesis.</p>
                    </div>
                  </div>
                  <button className="w-12 h-6 rounded-full p-1 bg-gray-800 cursor-not-allowed">
                    <div className="w-4 h-4 bg-gray-500 rounded-full" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-5 border-b border-gray-800/50 hover:bg-white/5 transition-colors opacity-60">
                  <div className="flex items-center gap-4">
                    {/* @ts-ignore dynamic import */}
                    <Icons.UserPlus size={20} className="text-gray-400" />
                    <div>
                      <p className="text-base font-bold text-white flex items-center gap-2">Allow Streak Invites <span className="text-[9px] px-1.5 py-0.5 rounded border border-gray-700 bg-gray-800 uppercase tracking-wider">Soon</span></p>
                      <p className="text-xs text-gray-400">Let community members invite you to shared streaks.</p>
                    </div>
                  </div>
                  <button className="w-12 h-6 rounded-full p-1 bg-gray-800 cursor-not-allowed">
                    <div className="w-4 h-4 bg-gray-500 rounded-full" />
                  </button>
                </div>
              </div>
            </section>
          </div>

          {needsOnboarding && streak?.defaultSparkMode && (
            <div className="mt-12 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-8 py-3 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-transform"
              >
                Continue to Hub
              </button>
            </div>
          )}
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
          <div className="flex overflow-x-auto pb-6 -mx-6 px-6 gap-6 snap-x hide-scrollbar">
            {partnerStreaks.map((pStreak) => (
              <div key={pStreak.id} className="min-w-[300px] max-w-[350px] p-6 rounded-3xl bg-[var(--muse-surface)] border border-[var(--muse-border)] flex items-center gap-4 hover:border-[var(--muse-accent)] transition-colors cursor-pointer group snap-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30 flex-shrink-0">
                  <span className="text-xl font-bold text-indigo-400">{pStreak.partnerName.charAt(0)}</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-lg font-bold text-[var(--muse-text)]">{pStreak.partnerName}</p>
                  <p className="text-sm text-[var(--muse-muted)] truncate">{pStreak.history[0]?.action || "No history yet"}</p>
                </div>
                <div className="flex flex-col items-center justify-center flex-shrink-0">
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
