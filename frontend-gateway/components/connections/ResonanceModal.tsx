import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { synthesizePerspective } from "../../signals/connections.ts";

interface ResonanceModalProps {
  perspectiveId: string;
  onClose: () => void;
}

export default function ResonanceModal({
  perspectiveId,
  onClose,
}: ResonanceModalProps) {
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsAnalyzing(true);

    // Simulate Real-Time Analysis and Mapping to a Cluster
    setTimeout(() => {
      synthesizePerspective(content, perspectiveId);
      setIsAnalyzing(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
        >
          <Icons.X size={24} />
        </button>

        <div className="space-y-8">
          <div className="flex items-center justify-between text-canvas-primary">
            <div className="flex items-center gap-3">
              <Icons.Waves size={20} className="text-emerald-500" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-400">
                Resonate with Stream
              </h2>
            </div>
            
            {isAnalyzing && (
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg animate-pulse">
                <Icons.Cpu size={12} className="text-indigo-400" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-indigo-400">
                  Real-time mapping...
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={content}
              onInput={(e) =>
                setContent((e.target as HTMLTextAreaElement).value)}
              placeholder="Inject your thought into the resonance clusters..."
              className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-8 py-6 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.07] transition-all min-h-[160px] text-lg font-serif italic"
              disabled={isAnalyzing}
            />

            <div className="mt-8 flex items-center justify-between">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest max-w-[200px]">
                Your thought will be automatically analyzed and grouped by theme.
              </p>

              <button
                type="submit"
                disabled={isAnalyzing || !content.trim()}
                className="px-8 py-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 cursor-pointer shadow-xl"
              >
                {isAnalyzing ? (
                  <>
                    <Icons.RefreshCcw size={14} className="animate-spin" />
                    Analyzing Theme...
                  </>
                ) : (
                  <>
                    <Icons.Waves size={14} />
                    Inject Resonance
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
