import { roomsSignal } from "../../signals/rooms.ts";
import { AlertCircle, Merge, GitBranch, X } from "lucide-preact";

export default function SemanticConflictResolver({ newRoomName, onResolve }: { newRoomName: string, onResolve: (action: 'merge' | 'separate' | 'cluster') => void }) {
  const existingRooms = roomsSignal.value;
  
  // Mock semantic match (in real world, this would be an AI call)
  const isMatch = (newRoomName.toLowerCase() === 'michezo' && existingRooms.some(r => r.name.toLowerCase() === 'sports')) ||
                  (newRoomName.toLowerCase() === 'sports' && existingRooms.some(r => r.name.toLowerCase() === 'michezo'));

  if (!isMatch) return null;

  const conflictingRoom = existingRooms.find(r => r.name.toLowerCase() === 'sports' || r.name.toLowerCase() === 'michezo');

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-[2rem] p-8 animate-in zoom-in-95 duration-500">
      <div className="flex items-start gap-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
          <AlertCircle size={28} />
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Semantic Conflict Detected</h3>
            <p className="text-sm text-gray-400 font-serif italic mt-1 leading-relaxed">
              The room name <span className="text-amber-500 font-bold">"{newRoomName}"</span> is semantically identical to your existing room <span className="text-amber-500 font-bold">"{conflictingRoom?.name}"</span>. 
              How would you like to handle this cognitive resonance?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <button 
               onClick={() => onResolve('merge')}
               className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left group"
             >
                <Merge size={20} className="text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-white">Merge Streams</p>
                <p className="text-[9px] text-gray-600 mt-1 uppercase tracking-widest">Combine all artifacts</p>
             </button>
             <button 
               onClick={() => onResolve('separate')}
               className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left group"
             >
                <X size={20} className="text-gray-500 mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-white">Keep Separate</p>
                <p className="text-[9px] text-gray-600 mt-1 uppercase tracking-widest">Maintain distinction</p>
             </button>
             <button 
               onClick={() => onResolve('cluster')}
               className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left group"
             >
                <GitBranch size={20} className="text-canvas-primary mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-white">Cluster Nodes</p>
                <p className="text-[9px] text-gray-600 mt-1 uppercase tracking-widest">Link via Thread</p>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
