import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { Collaborator } from "../../signals/connections.ts";

interface Props {
  collaborator: Collaborator;
  onClose: () => void;
  onEstablishLink: () => void;
}

export default function ParallelPreviewModal({ collaborator, onClose, onEstablishLink }: Props) {
  const [isSynthesizing, setIsSynthesizing] = useState(true);
  const [blueprint, setBlueprint] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    async function performPreview() {
      try {
        const res = await fetch("/api/threads/parallel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partnerId: collaborator.id })
        });
        
        if (res.ok) {
          const data = await res.json();
          setBlueprint(data.thread.ai_blueprint);
        }
      } catch (err) {
        console.error("Preview failed:", err);
      } finally {
        setIsSynthesizing(false);
      }
    }

    performPreview();
  }, [collaborator.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div
          className="absolute top-0 left-0 h-full w-1/2 opacity-20 blur-[80px] pointer-events-none transition-all duration-1000"
          style={{ backgroundColor: collaborator.aura }}
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors z-10"
        >
          <Icons.X size={24} />
        </button>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex -space-x-4">
               <div className="w-16 h-16 rounded-2xl bg-canvas-primary/20 border-2 border-white/10 flex items-center justify-center text-white font-bold">You</div>
               <img
                 src={collaborator.avatar}
                 alt={collaborator.name}
                 className="w-16 h-16 rounded-2xl border-2 border-white/10 object-cover"
               />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Parallel Preview
                <Icons.Sparkles size={20} style={{ color: collaborator.aura }} />
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mt-1">
                Cognitive Resonance: {collaborator.matchPercentage}%
              </p>
            </div>
          </div>

          {isSynthesizing ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Icons.Loader size={32} className="animate-spin mb-4" style={{ color: collaborator.aura }} />
              <p className="text-gray-400 font-serif italic text-lg">Synthesizing intersections...</p>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-4 font-bold">Analyzing overlapping sparks</p>
            </div>
          ) : blueprint ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Shared Theme</h3>
                <p className="text-white text-xl font-bold font-serif italic" style={{ color: collaborator.aura }}>
                  {typeof blueprint === 'string' ? JSON.parse(blueprint).theme : (blueprint as any).theme}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Synthesis Summary</h3>
                <p className="text-gray-300 font-serif text-lg leading-relaxed">
                  {typeof blueprint === 'string' ? JSON.parse(blueprint).summary : (blueprint as any).summary}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Socratic Intersection Questions</h3>
                <ul className="space-y-4">
                  {(typeof blueprint === 'string' ? JSON.parse(blueprint).socratic_questions : (blueprint as any).socratic_questions).map((q: string, i: number) => (
                    <li key={i} className="text-gray-400 font-serif italic text-sm border-l-2 pl-4" style={{ borderColor: `${collaborator.aura}50` }}>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEstablishLink();
                  }}
                  className="px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2 cursor-pointer"
                >
                  <Icons.UserPlus size={14} /> Link Minds
                </button>
              </div>
            </div>
          ) : (
             <div className="py-20 text-center">
               <Icons.AlertCircle size={32} className="mx-auto text-red-400 mb-4" />
               <p className="text-gray-400">Not enough public data from both users to synthesize.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
