import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  dismissSetupBanner,
  getSetupSteps,
  isProfileComplete,
  setupBannerDismissedSignal,
  type SetupStep,
  userSignal,
} from "../../signals/user.ts";
import { getContextualPrompt, type UserContext } from "../../utils/contextualPrompts.ts";

export default function SetupBanner() {
  const user = userSignal.value;
  const isDismissed = setupBannerDismissedSignal.value;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const steps = getSetupSteps(user);
  const done = steps.filter((s) => s.done).length;
  const total = steps.length;
  const pct = Math.round((done / total) * 100);
  const complete = isProfileComplete(user);

  // Only hide when explicitly dismissed.
  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsAnimatingOut(true);
    setTimeout(() => dismissSetupBanner(), 400);
  };

  const nextStep = steps.find((s) => !s.done);
  
  // Get personality-driven messaging
  const hour = new Date().getHours();
  const period = hour >= 5 && hour < 12 ? "morning" : hour >= 12 && hour < 18 ? "afternoon" : "evening";
  const userContext: Partial<UserContext> = {
    currentStreak: user?.cognitiveStreak ?? 0,
    resonanceScore: user?.resonance?.resonanceScore ?? 0,
    journalEntryCount: 0,
    roomsJoined: 0,
    threadsActive: 0,
    hasUsername: Boolean(user?.username?.trim()),
  };
  
  const setupMsg = complete
    ? "Your foundation is solid."
    : pct >= 66
    ? "Almost there. One more push."
    : pct >= 33
    ? "Halfway through. Keep going."
    : "Let's build your sanctuary first.";

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[70] transition-all duration-400 ease-in-out ${
        isAnimatingOut
          ? "-translate-y-full opacity-0"
          : "translate-y-0 opacity-100"
      }`}
    >
      {/* Main banner bar */}
      <div className="bg-[var(--muse-surface)]/95 backdrop-blur-2xl border-b border-[var(--muse-border)] px-4 py-2.5 flex items-center gap-3 shadow-lg">
        {/* Progress ring icon */}
        <div className="relative flex-shrink-0">
          <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-white/10"
            />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              strokeWidth="3"
              strokeDasharray={`${pct * 0.942} 100`}
              strokeLinecap="round"
              className="text-[var(--muse-accent)] transition-all duration-700"
              stroke="currentColor"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-[var(--muse-text)] rotate-90">
            {pct}%
          </span>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--muse-text)] leading-tight">
            {setupMsg}
          </p>
          <p className="text-[11px] text-[var(--muse-muted)] truncate">
            {complete
              ? "All profile steps are finished. Dismiss when you're ready."
              : `${done} of ${total} steps done${nextStep ? ` · Next: ${nextStep.label}` : ""}`}
          </p>
        </div>

        {/* Expand / Go button */}
        <button
          type="button"
          onClick={() => setIsExpanded((e) => !e)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--muse-accent)]/15 text-[var(--muse-accent)] text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--muse-accent)]/25 transition-colors flex-shrink-0"
        >
          Setup
          <Icons.ChevronDown
            size={12}
            className={`transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dismiss */}
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1.5 text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
          title="Skip for now"
        >
          <Icons.X size={14} />
        </button>
      </div>

      {/* Expanded dropdown panel */}
      {isExpanded && (
        <div className="bg-[var(--muse-bg)]/98 backdrop-blur-2xl border-b border-[var(--muse-border)] px-4 py-4 shadow-xl animate-in slide-in-from-top-2 duration-300">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)] mb-3">
            Your Setup Checklist
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {steps.map((step: SetupStep) => (
              <a
                key={step.id}
                href={step.href}
                onClick={() => setIsExpanded(false)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                  step.done
                    ? "border-emerald-500/20 bg-emerald-500/5 opacity-60 pointer-events-none"
                    : "border-[var(--muse-border)] bg-[var(--muse-surface)] hover:border-[var(--muse-accent)]/50 hover:bg-[var(--muse-accent)]/5"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.done
                      ? "bg-emerald-500 text-black"
                      : "bg-white/10 text-[var(--muse-muted)]"
                  }`}
                >
                  {step.done
                    ? <Icons.Check size={12} />
                    : <Icons.Circle size={12} />}
                </div>
                <span
                  className={`text-sm font-medium ${
                    step.done
                      ? "line-through text-[var(--muse-muted)]"
                      : "text-[var(--muse-text)]"
                  }`}
                >
                  {step.label}
                </span>
                {!step.done && (
                  <Icons.ArrowRight
                    size={14}
                    className="ml-auto text-[var(--muse-muted)]"
                  />
                )}
              </a>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-[10px] text-[var(--muse-muted)]">
              You can always complete this later in Settings
            </p>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-[10px] font-medium text-[var(--muse-muted)] hover:text-[var(--muse-text)] underline transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
