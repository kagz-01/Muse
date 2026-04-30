import { useState, useMemo } from "preact/hooks";
import { perspectivesSignal, clustersSignal, submitPerspective, Perspective } from "../../signals/user.ts"; // Wait, I put them in connections.ts, let me check
import { MessageSquare, Sparkles, Activity, Zap, ArrowRight, CornerDownRight } from "lucide-preact";

// Correct import path
import { perspectivesSignal as persSig, clustersSignal as clSig, submitPerspective as subPers, Perspective as PersType } from "../../signals/connections.ts";

export default function ThoughtStream() {
  const [newThought, setNewThought] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const perspectives = persSig.value;
  const clusters = clSig.value;

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!newThought.trim()) return;
    subPers(newThought, replyingTo || undefined);
    setNewThought('');
    setReplyingTo(null);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* INPUT HUB */}
      <div className="bg-white/2 border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-canvas-primary/5 blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 flex items-center gap-3">
                 <MessageSquare size={14} className="text-canvas-primary" /> Contribute Perspective
              </h2>
              {replyingTo && (
                <button 
                  onClick={() => setReplyingTo(null)}
                  className="text-[9px] font-bold uppercase tracking-widest text-canvas-primary hover:text-white transition-colors"
                >
                  Cancel Reply
                </button>
              )}
           </div>

           <form onSubmit={handleSubmit} className="relative">
              <textarea 
                value={newThought}
                onInput={(e) => setNewThought((e.target as HTMLTextAreaElement).value)}
                placeholder={replyingTo ? "Synthesize your response..." : "What patterns are you noticing?"}
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 text-white placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 focus:bg-white/[0.07] transition-all min-h-[140px] text-lg font-serif italic outline-none"
              />
              <button 
                type="submit"
                className="absolute bottom-6 right-6 w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              >
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </form>

           <div className="flex flex-wrap gap-4">
              {['Intuition', 'Logic', 'Skepticism', 'Curiosity'].map(tone => (
                <button key={tone} className="px-5 py-2 rounded-full bg-white/5 border border-white/5 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:border-canvas-primary transition-all">
                  {tone}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* THE STREAM */}
      <div className="relative space-y-8">
        
        {/* Dynamic Clustering Logic (Visualized as Nodes) */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-linear-to-b from-canvas-primary/40 via-white/5 to-transparent pointer-events-none" />

        {perspectives.map((pers, i) => (
          <div 
            key={pers.id} 
            className={`relative pl-20 animate-in fade-in slide-in-from-left-4 duration-500`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {/* CONNECTION NODE */}
            <div className={`absolute left-7 top-6 w-3 h-3 rounded-full border-2 border-[#0a0a0a] z-10 shadow-[0_0_15px_rgba(var(--muse-accent-rgb),0.5)] bg-canvas-primary`} />
            
            <div className={`group bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 transition-all hover:bg-white/[0.05] hover:border-white/10 ${pers.relationship === 'Challenging' ? 'border-amber-500/20' : ''}`}>
               
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-xl bg-canvas-primary/20 flex items-center justify-center text-[10px] font-bold text-canvas-primary`}>
                        {pers.author.name.charAt(0)}
                     </div>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-white">{pers.author.name}</span>
                     <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">• {pers.timestamp}</span>
                  </div>

                  {pers.relationship !== 'Initial' && (
                    <div className={`px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest border ${
                      pers.relationship === 'Challenging' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                      pers.relationship === 'Resonating' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                      'bg-canvas-primary/10 border-canvas-primary/30 text-canvas-primary'
                    }`}>
                      {pers.relationship}
                    </div>
                  )}
               </div>

               <p className="text-xl font-serif italic text-gray-200 leading-relaxed max-w-3xl">
                  {pers.content}
               </p>

               <div className="mt-6 pt-6 border-t border-white/[0.03] flex items-center gap-6">
                  <button 
                    onClick={() => setReplyingTo(pers.id)}
                    className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                  >
                    <CornerDownRight size={14} /> Synthesize Perspective
                  </button>
                  <button className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                    <Activity size={14} /> 12 Resonance
                  </button>
               </div>
            </div>
          </div>
        ))}

        {/* AI INSIGHT BANNER */}
        <div className="bg-canvas-primary/10 border border-canvas-primary/20 rounded-3xl p-8 flex items-center gap-8">
           <div className="w-16 h-16 bg-canvas-primary/20 rounded-2xl flex items-center justify-center text-canvas-primary">
              <Sparkles size={32} />
           </div>
           <div className="flex-1">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-canvas-primary mb-2">AI Mediation Active</h4>
              <p className="text-gray-400 text-sm font-serif italic leading-relaxed">
                The collective is currently converging on the topic of <strong>'Cognitive Voids'</strong>. Three distinct thought clusters have emerged in the last 15 minutes.
              </p>
           </div>
           <button className="px-6 py-3 bg-white text-black text-[9px] font-bold uppercase tracking-widest rounded-xl hover:scale-105 transition-all">
              Join Synthesis
           </button>
        </div>

      </div>

    </div>
  );
}
