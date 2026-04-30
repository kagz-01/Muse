import { useState } from "preact/hooks";
import { 
  Sparkles, MessageSquare, GitCommit, 
  Plus, X, Zap, Cpu, Activity
} from "lucide-preact";
import { intelligenceSignal, systemPulse } from "../../signals/intelligence.ts";

type Phase = 'collect' | 'contemplate' | 'synthesize' | 'create';

const phases: { id: Phase; icon: typeof Plus; label: string; color: string; desc: string }[] = [
  { id: 'collect', icon: Plus, label: 'Collect', color: 'text-indigo-400', desc: 'Capture social signals' },
  { id: 'contemplate', icon: MessageSquare, label: 'Contemplate', color: 'text-emerald-400', desc: 'Dialogue with patterns' },
  { id: 'synthesize', icon: GitCommit, label: 'Synthesize', color: 'text-cyan-400', desc: 'Weave diverse rooms' },
  { id: 'create', icon: Zap, label: 'Create', color: 'text-amber-400', desc: 'Publish to collective' },
];

export default function SynthesisEngine() {
  const [isOpen, setIsOpen] = useState(false);
  const [_activePhase, setActivePhase] = useState<Phase | null>(null);
  const system = intelligenceSignal.value;
  const pulseClass = systemPulse.value;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200]">
      
      {/* BACKDROP OVERLAY */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-500 z-[-1]" 
        />
      )}

      <div className="relative">
         {/* TRIGGER BUTTON */}
         <button 
           type="button"
           onClick={() => setIsOpen(!isOpen)}
           className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_0_50px_rgba(255,255,255,0.15)] hover:shadow-[0_0_70px_rgba(255,255,255,0.25)] ${isOpen ? 'bg-white text-black rotate-45 scale-90' : 'bg-[#111] border border-white/10 text-white'}`}
         >
            {isOpen ? <X size={28} /> : <Sparkles size={28} className="animate-pulse" />}
         </button>

         {/* PHASE NODES */}
         {isOpen && (
           <div className="absolute bottom-full mb-10 left-1/2 -translate-x-1/2 w-[420px]">
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
                 {phases.map((phase, i) => (
                   <button 
                     type="button"
                     key={phase.id}
                     onClick={() => {
                        setActivePhase(phase.id);
                        setIsOpen(false);
                     }}
                     className="bg-[#151515] border border-white/10 rounded-[2.5rem] p-6 text-left group hover:bg-white/[0.03] hover:border-white/20 transition-all active:scale-95"
                   >
                      <div className="flex items-center justify-between mb-4">
                         <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${phase.color} group-hover:scale-110 transition-transform`}>
                            <phase.icon size={24} />
                         </div>
                         <div className="px-2 py-1 bg-white/5 rounded-lg text-[7px] font-bold uppercase tracking-widest text-gray-600">Phase 0{i + 1}</div>
                      </div>
                      <h4 className="text-white font-bold uppercase tracking-widest text-[11px] mb-1">{phase.label}</h4>
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-relaxed">{phase.desc}</p>
                   </button>
                 ))}
              </div>

              {/* SYSTEM STATUS */}
              <div className="mt-6 p-6 bg-canvas-primary/5 border border-canvas-primary/20 rounded-[2rem] flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 delay-300">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-canvas-primary/20 flex items-center justify-center text-canvas-primary">
                       <Cpu size={20} className={system.status !== 'Idle' ? 'animate-spin' : 'animate-spin-slow'} />
                    </div>
                    <div>
                       <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Synthesis Engine</p>
                       <p className="text-xs font-bold text-white uppercase tracking-widest">{system.status} · Calibrated</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${pulseClass}`} />
                    <span className="text-[10px] font-mono text-gray-400">{system.nodeCount} Nodes</span>
                 </div>
              </div>
           </div>
         )}
      </div>

    </div>
  );
}
