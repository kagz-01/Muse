import { useState } from "preact/hooks";
import { Layers, Plus, Share2, Globe, Lock } from "lucide-preact";
import { threadsSignal, type ThreadMood } from "../signals/threads.ts";
import CreateThreadModal from "./CreateThreadModal.tsx";

const moodGradients: Record<ThreadMood, string> = {
  contemplative: 'from-violet-600/40',
  curious: 'from-cyan-600/40',
  dark: 'from-slate-800/60',
  hopeful: 'from-emerald-600/40',
  urgent: 'from-rose-600/40',
  serene: 'from-amber-600/40',
};

const moodColors: Record<ThreadMood, string> = {
  contemplative: '#8b5cf6',
  curious: '#06b6d4',
  dark: '#475569',
  hopeful: '#10b981',
  urgent: '#f43f5e',
  serene: '#f59e0b',
};

export default function ThreadsGallery() {
  const threads = threadsSignal.value;
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      {showCreate && <CreateThreadModal onClose={() => setShowCreate(false)} />}
      
      <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24 md:pb-10">
        <header className="mb-12 flex items-end justify-between border-b border-white/5 pb-8 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">Thematic Threads</h1>
            <p className="text-gray-400 font-serif italic text-lg decoration-indigo-500/30 underline decoration-2 underline-offset-4">Synthesize your collection into cohesive intellectual structures.</p>
          </div>
          <button 
            onClick={() => setShowCreate(true)}
            type="button"
            className="group px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-full shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> New Thread
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {threads.map((thread) => (
            <a
              key={thread.id}
              href={`/threads/${thread.id}`}
              className="group relative h-[420px] rounded-4xl border border-white/5 overflow-hidden transition-all duration-500 hover:border-white/20 hover:-translate-y-1 block"
            >
              {thread.coverImage ? (
                <img src={thread.coverImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
              ) : (
                <div className="absolute inset-0 bg-[#111]" />
              )}
              
              <div className={`absolute inset-0 bg-linear-to-t ${moodGradients[thread.mood]} via-[#0a0a0a]/80 to-[#0a0a0a]/20 opacity-90 transition-opacity duration-500`} />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white`}>
                    <Layers size={20} style={{ color: moodColors[thread.mood] }} />
                  </div>
                  {thread.isPublic ? (
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold text-white border border-white/10 flex items-center gap-2">
                       <Globe size={11} /> Community
                    </div>
                  ) : (
                    <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold text-gray-500 border border-white/5 flex items-center gap-2">
                       <Lock size={11} /> Solo
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors duration-500">
                      {thread.mood}
                    </span>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight text-white mb-3 group-hover:tracking-normal transition-all duration-500">{thread.title}</h3>
                  <p className="text-gray-300 text-sm font-serif italic mb-6 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                    {thread.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="flex -space-x-2">
                          {[1,2,3].map(i => (
                             <div key={i} className="w-7 h-7 rounded-full border border-[#0a0a0a] bg-white/5 flex items-center justify-center overflow-hidden">
                                <div className="w-full h-full bg-white/5" />
                             </div>
                          ))}
                       </div>
                       <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{thread.itemIds.length} Synthesized Artifacts</span>
                    </div>
                    <Share2 size={14} className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
                  </div>
                </div>
              </div>
            </a>
          ))}

          <button
            onClick={() => setShowCreate(true)}
            type="button"
            className="h-[420px] rounded-4xl border-2 border-dashed border-white/10 hover:border-white/25 hover:bg-white/5 flex flex-col items-center justify-center gap-4 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 group-hover:border-white flex items-center justify-center transition-colors">
              <Plus size={24} className="text-gray-500 group-hover:text-white" />
            </div>
            <div className="text-center">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-white block mb-1">Synthesize New Thread</span>
              <span className="text-[10px] font-medium text-gray-600 font-serif italic">Connect the dots in your collection.</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
