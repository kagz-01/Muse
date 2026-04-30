import { ComponentChildren } from "preact";
import { soloModeSignal } from "../../signals/user.ts";
import { CaptureModal } from "../modals/index.ts";
import ProfileOverlay from "../profile/ProfileOverlay.tsx";
import SynthesisEngine from "../navigation/SynthesisEngine.tsx";

export default function AppLayoutWrapper({ children }: { children: ComponentChildren }) {
  const soloMode = soloModeSignal.value;

  return (
    <div 
      className={`flex flex-col min-h-screen w-full bg-canvas-bg-dark text-white overflow-hidden pb-safe transition-all duration-1000 ${
        soloMode ? 'border-[6px] border-canvas-primary/20 shadow-[inset_0_0_50px_rgba(99,102,241,0.1)]' : 'border-0'
      }`}
    >
      {/* Solo Mode Shimmer Overlay */}
      {soloMode && (
        <div 
          className="fixed inset-0 pointer-events-none z-[100] border border-canvas-primary/10 shadow-[inset_0_0_100px_rgba(99,102,241,0.05)] transition-opacity duration-500 opacity-100"
        />
      )}
      
      {children}
      <CaptureModal />
      <ProfileOverlay />
      <SynthesisEngine />
    </div>
  );
}
