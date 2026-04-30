import { useState } from "preact/hooks";
import { Layers, Plus, Globe, Lock } from "lucide-preact";
import { threadsSignal, type ThreadMood } from "../../signals/threads.ts";
import CreateThreadModal from "../modals/CreateThreadModal.tsx";

const moodGlowClasses: Record<ThreadMood, string> = {
  contemplative: 'glow-indigo',
  curious: 'glow-cyan',
  dark: 'glow-slate',
  hopeful: 'glow-emerald',
  urgent: 'glow-rose',
  serene: 'glow-amber',
};

const moodGradients: Record<ThreadMood, string> = {
  contemplative: 'from-indigo-600/40',
  curious: 'from-cyan-600/40',
  dark: 'from-slate-600/40',
  hopeful: 'from-emerald-600/40',
  urgent: 'from-rose-600/40',
  serene: 'from-amber-600/40',
};

const moodColors: Record<ThreadMood, string> = {
  contemplative: '#818cf8',
  curious: '#22d3ee',
  dark: '#94a3b8',
  hopeful: '#34d399',
  urgent: '#fb7185',
  serene: '#fbbf24',
};


export default function ThreadsGallery() {
  const threads = threadsSignal.value;
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      {showCreate && <CreateThreadModal onClose={() => setShowCreate(false)} />}
      
      <div className="p-6 md:p-10 w-full max-w-[1800px] mx-auto pb-24 md:pb-10 space-y-12">
        <section className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d0d0d] p-10 md:p-16 shadow-2xl">
          <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Synthesis Engine
              </div>
              <h1 className="mt-8 text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-white">
                Synthesize Your 
                <span className="inline-block italic font-serif text-indigo-400 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent pr-12 pb-6 -mr-12 -mb-6">Consciousness.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-gray-400 text-lg md:text-xl leading-relaxed font-serif italic border-l-2 border-white/10 pl-6">
                Threads are where patterns emerge. Connect the disparate artifacts of your collection into cohesive, high-fidelity intellectual structures.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowCreate(true); }}
                type="button"
                className="w-full lg:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-5 text-[12px] font-bold uppercase tracking-[0.2em] text-black shadow-[0_20px_50px_rgba(255,255,255,0.15)] transition-all hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(255,255,255,0.25)] active:scale-95 cursor-pointer relative z-[30]"
              >
                + Initialize Thread
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {threads.map((thread) => (
            <a
              key={thread.id}
              href={`/threads/${thread.id}`}
              className={`group relative h-[460px] rounded-[2.5rem] border border-white/5 bg-[#111] overflow-hidden transition-all duration-500 cursor-pointer card-glow ${moodGlowClasses[thread.mood]}`}
            >
              {/* Background Image - Always Visible but Subtle */}
              <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
                {thread.coverImage ? (
                  <img src={thread.coverImage} className="h-full w-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" alt="" />
                ) : (
                  <div className={`h-full w-full bg-linear-to-br ${moodGradients[thread.mood]} to-transparent opacity-20`} />
                )}
                <div className="absolute inset-0 room-image-overlay" />
              </div>
              
              <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-xl`}>
                    <Layers size={20} style={{ color: moodColors[thread.mood] }} />
                  </div>
                  {thread.isPublic ? (
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-[9px] uppercase tracking-widest font-bold text-white border border-white/10 flex items-center gap-2 shadow-lg">
                       <Globe size={11} /> Community
                    </div>
                  ) : (
                    <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-[9px] uppercase tracking-widest font-bold text-gray-500 border border-white/5 flex items-center gap-2 shadow-lg">
                       <Lock size={11} /> Vault
                    </div>
                  )}
                </div>

                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`inline-block w-2 h-2 rounded-full animate-pulse`} style={{ backgroundColor: moodColors[thread.mood] }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                      {thread.mood} Flow
                    </span>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight text-white mb-4 group-hover:text-indigo-400 transition-colors duration-500">{thread.title}</h3>
                  <p className="text-gray-300 text-base font-serif italic mb-8 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                    {thread.description || "A deep synthesis of curated artifacts and emerging patterns."}
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-white/10 pt-6">
                    <div className="flex items-center gap-4">
                       <div className="flex -space-x-3">
                          {[1,2,3].map(i => (
                             <div key={i} className="w-8 h-8 rounded-full border-2 border-[#111] bg-white/5 flex items-center justify-center overflow-hidden shadow-lg">
                                <div className="w-full h-full bg-white/5" />
                             </div>
                          ))}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">Synthesis</span>
                          <span className="text-xs font-bold text-white">{thread.itemIds.length} Artifacts</span>
                       </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-500">
                       {thread.isPublic ? <Globe size={14} /> : <Lock size={14} />}
                    </div>
                </div>
              </div>
            </a>
          ))}

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowCreate(true); }}
            type="button"
            className="h-[460px] rounded-[2.5rem] border-2 border-dashed border-white/5 bg-[#0d0d0d] hover:border-indigo-500/20 hover:bg-indigo-500/[0.02] flex flex-col items-center justify-center gap-6 transition-all duration-500 group cursor-pointer card-glow glow-indigo relative z-[30]"
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-700 group-hover:border-indigo-400 flex items-center justify-center transition-all duration-500">
              <Plus size={24} className="text-gray-600 group-hover:text-indigo-400" />
            </div>
            <div className="text-center">
              <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-white block mb-2 transition-colors">Initialize New Thread</span>
              <span className="text-[10px] text-gray-700 font-serif italic px-6 block">Connect the dots in your collective consciousness.</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}

