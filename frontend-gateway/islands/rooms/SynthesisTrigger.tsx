import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";

interface SynthesisTriggerProps {
  roomId: string;
  themeColor: string;
}

export default function SynthesisTrigger({ roomId, themeColor }: SynthesisTriggerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSynthesize = async () => {
    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/threads/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Refresh to show new threads
      globalThis.location.reload();
    } catch (err: any) {
      setError(err.message || "Synthesis failed.");
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button
        onClick={handleSynthesize}
        disabled={isProcessing}
        className="w-full relative group overflow-hidden rounded-2xl p-[1px] transition-transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
      >
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--theme-color)] to-transparent opacity-50 group-hover:opacity-100 transition-opacity animate-[spin_3s_linear_infinite]"
          style={{ '--theme-color': themeColor } as any}
        />
        <div className="relative flex items-center justify-center gap-3 px-6 py-4 bg-[var(--muse-surface)] rounded-[15px] border border-[var(--muse-border)]/50 backdrop-blur-xl">
          <Icons.BrainCircuit size={20} style={{ color: themeColor }} />
          <span className="font-bold uppercase tracking-[0.2em] text-xs text-[var(--muse-text)]">
            Synthesize Artifacts
          </span>
        </div>
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-lg">
          [ERROR]: {error}
        </div>
      )}

      {/* Cinematic Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-500">
          <div className="relative mb-12">
            <div 
              className="absolute inset-0 blur-[100px] rounded-full animate-pulse opacity-50"
              style={{ backgroundColor: themeColor }}
            />
            <div className="relative flex items-center justify-center w-32 h-32 rounded-full border border-white/10 bg-black/50 shadow-2xl">
              <Icons.BrainCircuit size={48} className="animate-pulse" style={{ color: themeColor }} />
            </div>
            
            {/* Orbiting particles */}
            <div className="absolute inset-0 animate-[spin_4s_linear_infinite]">
              <div className="absolute top-0 left-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-white shadow-[0_0_10px_white]" />
            </div>
            <div className="absolute inset-0 animate-[spin_3s_linear_infinite_reverse]">
              <div className="absolute bottom-0 right-1/4 w-1.5 h-1.5 rounded-full bg-white/50 shadow-[0_0_10px_white]" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold tracking-widest uppercase text-white mb-4 animate-pulse">
            Synthesizing Neural Patterns
          </h2>
          <p className="text-zinc-400 font-mono text-xs max-w-md text-center">
            The AI engine is reading artifacts, finding connections, and generating structural blueprints. This may take a moment.
          </p>
        </div>
      )}
    </>
  );
}
