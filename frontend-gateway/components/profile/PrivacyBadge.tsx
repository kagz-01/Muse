import { Lock, Globe, ShieldCheck } from "lucide-preact";
import { soloModeSignal, toggleSoloMode } from "../../signals/user.ts";

export default function PrivacyBadge() {
  const soloMode = soloModeSignal.value;

  return (
    <button 
      onClick={toggleSoloMode}
      className={`relative group flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all duration-500 overflow-hidden ${
        soloMode
          ? "bg-canvas-primary/20 border-canvas-primary/45 text-canvas-primary"
          : "bg-canvas-primary/10 border-canvas-primary/25 text-canvas-primary hover:bg-canvas-primary/15"
      }`}
    >
      {/* Background Shimmer (CSS-only replacement for framer-motion) */}
      {soloMode && (
        <div 
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none"
          style={{ animation: 'shimmer 3s infinite linear' }}
        />
      )}

      <div className="relative z-10 flex items-center gap-2">
        {soloMode ? (
          <>
            <Lock size={14} className="animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Solo Mode</span>
          </>
        ) : (
          <>
            <Globe size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Community</span>
          </>
        )}
      </div>

      <div className="relative z-10 w-px h-3 bg-current opacity-20 mx-0.5" />
      
      <ShieldCheck size={14} className="relative z-10 opacity-70 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
