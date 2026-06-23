import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { synthesizePerspective } from "../../signals/connections.ts";

interface SynthesisModalProps {
  perspectiveId: string;
  authorName: string;
  content: string;
  onClose: () => void;
}

export default function SynthesisModal({
  perspectiveId,
  authorName,
  content,
  onClose,
}: SynthesisModalProps) {
  const [synthesisText, setSynthesisText] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleSynthesize = (e: Event) => {
    e.preventDefault();
    if (!synthesisText.trim()) return;

    setIsSynthesizing(true);

    // Simulate cryptographic processing delay
    setTimeout(() => {
      synthesizePerspective(synthesisText, perspectiveId);
      setIsSynthesizing(false);
      onClose();
      // Normally we would redirect to Journal here
      // globalThis.location.href = "/journal";
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
        >
          <Icons.X size={24} />
        </button>

        <div className="space-y-8">
          <div className="flex items-center gap-3 text-canvas-primary">
            <Icons.GitBranch size={20} />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em]">
              Synthesize Perspective
            </h2>
          </div>

          {/* Target Perspective */}
          <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-3">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
              Root Node: {authorName}
            </p>
            <p className="text-sm font-serif italic text-gray-300">
              "{content}"
            </p>
          </div>

          {/* Connection Visualizer */}
          <div className="flex justify-center -my-2">
            <div className="w-px h-8 bg-gradient-to-b from-canvas-primary/50 to-transparent" />
          </div>

          <form onSubmit={handleSynthesize} className="relative">
            <textarea
              value={synthesisText}
              onInput={(e) =>
                setSynthesisText((e.target as HTMLTextAreaElement).value)}
              placeholder="Branch this thought into your Journal..."
              className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-8 py-6 text-white placeholder-gray-600 focus:outline-none focus:border-canvas-primary/40 focus:bg-white/[0.07] transition-all min-h-[160px] text-lg font-serif italic"
              disabled={isSynthesizing}
            />

            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                <Icons.ShieldCheck size={12} /> Cryptographic Link Ready
              </div>

              <button
                type="submit"
                disabled={isSynthesizing || !synthesisText.trim()}
                className="px-8 py-4 bg-canvas-primary text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 cursor-pointer shadow-xl"
              >
                {isSynthesizing
                  ? (
                    <>
                      <Icons.RefreshCcw size={14} className="animate-spin" />
                      Committing to Ledger...
                    </>
                  )
                  : (
                    <>
                      <Icons.GitBranch size={14} />
                      Branch into Journal
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
