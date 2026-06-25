import { useState } from "preact/hooks";
import { Collaborator } from "../../signals/connections.ts";
import NeuralLinkModal from "./NeuralLinkModal.tsx";
import ParallelPreviewModal from "./ParallelPreviewModal.tsx";
import * as Icons from "lucide-preact";

export default function AuraCard(
  { collaborator }: { collaborator: Collaborator },
) {
  const [showNeuralLink, setShowNeuralLink] = useState(false);
  const [showParallelPreview, setShowParallelPreview] = useState(false);

  return (
    <>
      <div className="group relative bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 transition-all hover:bg-white/[0.05] hover:border-white/10 hover:shadow-2xl flex flex-col h-full">
        {/* COGNITIVE AURA GLOW */}
        <div
          className={`absolute -top-10 -right-10 w-40 h-40 opacity-0 group-hover:opacity-20 blur-[60px] rounded-full transition-opacity duration-700`}
          style={{ backgroundColor: collaborator.aura }}
        />

        <div className="relative z-10 flex flex-col h-full justify-between gap-10">
          <div className="flex justify-between items-start">
            <div className="relative">
              <img
                src={collaborator.avatar}
                className="w-20 h-20 rounded-[2rem] object-cover border-2 border-white/10 group-hover:border-white/20 transition-all"
                alt=""
              />
              <div
                className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-lg bg-black border border-white/10 flex items-center justify-center text-[10px] font-bold`}
                style={{ color: collaborator.aura }}
              >
                {collaborator.status === "Online"
                  ? <Icons.Activity size={12} />
                  : collaborator.status === "Deep Focus"
                  ? <Icons.Aperture size={12} />
                  : "•"}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                {collaborator.intelligenceProfile}
              </div>
              <span
                className={`text-[12px] font-bold uppercase tracking-[0.1em]`}
                style={{ color: collaborator.aura }}
              >
                {collaborator.matchPercentage}% Match
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-canvas-primary transition-colors">
              {collaborator.name}
            </h3>
            <p className="text-gray-500 font-serif italic text-sm leading-relaxed mb-6 line-clamp-2">
              "{collaborator.bio}"
            </p>

            <div className="flex flex-wrap gap-2">
              {collaborator.sharedThemes.map((theme) => (
                <span
                  key={theme}
                  className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-[9px] font-bold uppercase tracking-widest text-gray-600"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowParallelPreview(true)}
              className="flex-1 py-4 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all cursor-pointer"
            >
              <Icons.Sparkles size={14} style={{ color: collaborator.aura }} /> Parallel Preview
            </button>
            <button
              type="button"
              onClick={() => setShowNeuralLink(true)}
              className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Establish Link"
            >
              <Icons.UserPlus size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {showParallelPreview && (
        <ParallelPreviewModal
          collaborator={collaborator}
          onClose={() => setShowParallelPreview(false)}
          onEstablishLink={() => setShowNeuralLink(true)}
        />
      )}
      {showNeuralLink && (
        <NeuralLinkModal
          collaborator={collaborator}
          onClose={() => setShowNeuralLink(false)}
        />
      )}
    </>
  );
}
