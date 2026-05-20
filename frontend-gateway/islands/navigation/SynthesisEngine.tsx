import { useState } from "preact/hooks";
import { 
  MessageSquare, GitCommit, 
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
    <div className="fixed bottom-24 right-6 z-[200]">
      
      {/* BACKDROP OVERLAY */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-500 z-[-1]" 
        />
      )}

      <div className="relative flex flex-col gap-3 items-end">
         {/* MIRROR FLOATING BUBBLE */}
         <a 
           href="/mirror"
           title="Mirror Insights"
           className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--muse-surface)] border border-[var(--muse-border)] text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:border-canvas-primary/40 hover:bg-[var(--muse-surface-soft)] transition-all duration-300 shadow-xl opacity-60 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
         >
            <Activity size={18} />
         </a>

         {/* SYNTHESIS ENGINE TRIGGER */}
         <button 
           type="button"
           onClick={() => setIsOpen(!isOpen)}
           title="Synthesis Engine"
           className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl opacity-60 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer ${isOpen ? 'bg-[var(--muse-text)] text-[var(--muse-bg)] rotate-45' : 'bg-[var(--muse-surface)] border border-[var(--muse-border)] text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:border-canvas-primary/40'}`}
         >
            {isOpen ? <X size={18} /> : <Plus size={18} />}
         </button>

         {/* PHASE NODES */}
         {isOpen && (
           <div className="absolute bottom-full mb-4 right-0 w-[320px] sm:w-[380px]">
              <div className="grid grid-cols-2 gap-3.5 animate-in slide-in-from-bottom-6 fade-in duration-500">
                 {phases.map((phase, i) => (
                   <button 
                     type="button"
                     key={phase.id}
                     onClick={() => {
                        setActivePhase(phase.id);
                        setIsOpen(false);
                     }}
                     className="bg-[var(--muse-surface)] border border-[var(--muse-border)] rounded-[2rem] p-5 text-left group hover:bg-[var(--muse-surface-soft)] hover:border-[var(--muse-text)]/20 transition-all active:scale-95 cursor-pointer"
                   >
                      <div className="flex items-center justify-between mb-3">
                         <div className={`w-10 h-10 rounded-xl bg-[var(--muse-surface-soft)] flex items-center justify-center ${phase.color} group-hover:scale-110 transition-transform`}>
                            <phase.icon size={20} />
                         </div>
                         <div className="px-2 py-0.5 bg-[var(--muse-surface-soft)] rounded-md text-[7px] font-bold uppercase tracking-widest text-[var(--muse-muted)]">Phase 0{i + 1}</div>
                      </div>
                      <h4 className="text-[var(--muse-text)] font-bold uppercase tracking-widest text-[10px] mb-1">{phase.label}</h4>
                      <p className="text-[8px] text-[var(--muse-muted)] uppercase tracking-widest leading-relaxed">{phase.desc}</p>
                   </button>
                 ))}
              </div>

              {/* SYSTEM STATUS */}
              <div className="mt-4 p-5 bg-[var(--muse-surface)] border border-[var(--muse-border)] rounded-[2rem] flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 delay-300">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--muse-surface-soft)] flex items-center justify-center text-canvas-primary">
                       <Cpu size={18} className={system.status !== 'Idle' ? 'animate-spin' : 'animate-spin-slow'} />
                    </div>
                    <div>
                       <p className="text-[8px] font-bold uppercase tracking-widest text-[var(--muse-muted)]">Synthesis Engine</p>
                       <p className="text-[11px] font-bold text-[var(--muse-text)] uppercase tracking-widest">{system.status} · Calibrated</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${pulseClass}`} />
                    <span className="text-[10px] font-mono text-[var(--muse-muted)]">{system.nodeCount} Nodes</span>
                 </div>
              </div>
           </div>
         )}
      </div>

    </div>
  );
}

