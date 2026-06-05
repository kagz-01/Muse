import { ComponentChildren } from "preact";
import { soloModeSignal } from "../../signals/user.ts";
import { resonanceModeSignal, ambientGlowColorSignal } from "../../signals/resonance.ts";
import { CaptureModal } from "../modals/index.ts";
import ProfileOverlay from "../profile/ProfileOverlay.tsx";
import SynthesisEngine from "../navigation/SynthesisEngine.tsx";

export default function AppLayoutWrapper(
  { children }: { children: ComponentChildren },
) {
  const soloMode = soloModeSignal.value;
  const resonanceMode = resonanceModeSignal.value;
  const ambientGlow = ambientGlowColorSignal.value;

  return (
    <div
      className={`flex flex-col min-h-screen w-full bg-[var(--muse-bg)] text-[var(--muse-text)] overflow-hidden pb-safe transition-all duration-300 ${
        soloMode
          ? "border-[6px] border-canvas-primary/20 shadow-[inset_0_0_50px_rgba(99,102,241,0.1)]"
          : "border-0"
      }`}
    >
      {/* Solo Mode Shimmer Overlay */}
      {soloMode && (
        <div className="fixed inset-0 pointer-events-none z-[100] border border-canvas-primary/10 shadow-[inset_0_0_100px_rgba(99,102,241,0.05)] transition-opacity duration-500 opacity-100" />
      )}

      {/* Ambient Resonance Glow */}
      {ambientGlow && (
        <div 
          className={`fixed inset-0 pointer-events-none z-0 transition-all duration-1000 ease-in-out ${resonanceMode === "cinematic" ? "opacity-40" : "opacity-15"}`}
          style={{ background: `radial-gradient(circle at 50% 30%, ${ambientGlow}, transparent 70%)` }}
        />
      )}

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        {children}
      </div>
      <CaptureModal />
      <ProfileOverlay />
      <SynthesisEngine />
    </div>
  );
}
