import { blueprintsSignal, acceptBlueprint, discardBlueprint, updateBlueprintThesis } from "../../signals/blueprints.ts";
import { Sparkles, Check, X, Edit2, Layers, GitCommit, ArrowRight, MessageSquare } from "lucide-preact";
import { useState } from "preact/hooks";

export default function BlueprintReview() {
  const blueprints = blueprintsSignal.value.filter(bp => bp.status === 'pending' || bp.status === 'refining');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedThesis, setEditedThesis] = useState('');

  if (blueprints.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 flex items-center gap-3">
            <Sparkles size={14} className="text-canvas-primary" /> Autonomous Blueprints
         </h3>
         <span className="px-3 py-1 bg-canvas-primary/10 border border-canvas-primary/30 rounded-lg text-[9px] font-bold uppercase tracking-widest text-canvas-primary">
            {blueprints.length} Synthesis Suggested
         </span>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {blueprints.map(bp => (
          <div key={bp.id} className="bg-[#111318] border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden shadow-3xl group">
             <div className="absolute top-0 right-0 h-full w-1/3 bg-canvas-primary/5 blur-[100px] pointer-events-none" />
             
             <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                   <div>
                      <h4 className="text-2xl font-bold text-white tracking-tight mb-2">{bp.suggestedTitle}</h4>
                      <p className="text-sm text-gray-400 font-serif italic">{bp.suggestedDescription}</p>
                   </div>
                   <div className="text-right">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mb-1">AI Confidence</div>
                      <div className="text-2xl font-bold text-canvas-primary">{bp.confidenceScore}%</div>
                   </div>
                </div>

                <div className="p-8 bg-white/2 border border-white/5 rounded-[2rem] relative overflow-hidden">
                   <h5 className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                      <GitCommit size={14} /> Synthesized Thesis
                   </h5>
                   {editingId === bp.id ? (
                      <textarea 
                        value={editedThesis}
                        onInput={(e) => setEditedThesis((e.target as HTMLTextAreaElement).value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-6 text-white text-lg font-serif italic focus:outline-none focus:border-canvas-primary/40 min-h-[120px]"
                      />
                   ) : (
                      <p className="text-xl md:text-2xl font-serif italic text-white leading-relaxed">
                        "{bp.thesis}"
                      </p>
                   )}
                   <button 
                     onClick={() => {
                        if (editingId === bp.id) {
                           updateBlueprintThesis(bp.id, editedThesis);
                           setEditingId(null);
                        } else {
                           setEditingId(bp.id);
                           setEditedThesis(bp.thesis);
                        }
                     }}
                     className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all"
                   >
                      <Edit2 size={16} />
                   </button>
                </div>

                <div className="flex items-center gap-8">
                   <div className="flex -space-x-3">
                      {bp.sourceRoomIds.map(roomId => (
                        <div key={roomId} className="w-10 h-10 rounded-full bg-white/10 border-2 border-[#111318] flex items-center justify-center text-[10px] font-bold uppercase text-white shadow-xl">
                           {roomId.toUpperCase()}
                        </div>
                      ))}
                   </div>
                   <div className="h-px flex-1 bg-white/5" />
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                         {bp.itemIds.length} Signals Woven
                      </span>
                   </div>
                </div>

                <div className="flex gap-4">
                   <button 
                     onClick={() => acceptBlueprint(bp.id)}
                     className="flex-1 py-4 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-2xl hover:scale-[1.02] transition-all shadow-xl flex items-center justify-center gap-3"
                   >
                      <Check size={16} /> Accept Blueprint
                   </button>
                   <button 
                     onClick={() => discardBlueprint(bp.id)}
                     className="px-8 py-4 bg-white/5 border border-white/10 text-gray-500 font-bold uppercase tracking-widest text-[11px] rounded-2xl hover:text-white hover:bg-white/10 transition-all"
                   >
                      <X size={16} />
                   </button>
                </div>
             </div>

          </div>
        ))}
      </div>
    </div>
  );
}
