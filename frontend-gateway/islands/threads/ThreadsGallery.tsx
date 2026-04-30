import { useState } from "preact/hooks";
import { 
  GitCommit, Plus, Search, Filter, 
  ExternalLink, Sparkles, MessageSquare, Clock, Globe, Lock
} from "lucide-preact";
import { threadsSignal, type ThreadMood } from "../../signals/threads.ts";
import BlueprintReview from "../../components/threads/BlueprintReview.tsx";

const moodMapping: Record<ThreadMood, {
  color: string; bg: string; text: string;
}> = {
  contemplative: { color: 'indigo', bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
  curious: { color: 'cyan', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  dark: { color: 'slate', bg: 'bg-slate-500/10', text: 'text-slate-400' },
  hopeful: { color: 'emerald', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  urgent: { color: 'rose', bg: 'bg-rose-500/10', text: 'text-rose-400' },
  serene: { color: 'amber', bg: 'bg-amber-500/10', text: 'text-amber-400' },
};

export default function ThreadsGallery() {
  const threads = threadsSignal.value;
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThreads = threads.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-24 md:pb-10 min-h-screen bg-[#0a0a0a]">
      <header className="p-6 md:p-10 max-w-[1800px] mx-auto w-full">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
               <div className="flex items-center gap-3 mb-4">
                  <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest text-gray-500">
                     Synthesis Layer
                  </div>
                  <div className="h-px w-8 bg-white/10" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-canvas-primary flex items-center gap-2">
                     <Clock size={10} /> Real-time Patterns
                  </span>
               </div>
               <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">Thread Engine</h1>
               <p className="text-gray-400 font-serif italic text-lg md:text-xl max-w-2xl">
                 "Where diverse signals from your rooms converge into living documents of collective intelligence."
               </p>
            </div>

            <button className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:-translate-y-1 transition-all flex items-center gap-3">
               <Plus size={18} /> New Synthesis
            </button>
         </div>

         <div className="relative mb-16">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700" size={20} />
            <input 
              type="text" 
              placeholder="Search patterns, themes, or room cross-sections..."
              value={searchQuery}
              onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-16 py-6 text-lg text-white placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 focus:bg-white/[0.05] transition-all font-serif italic outline-none"
            />
         </div>

         {/* AUTONOMOUS BLUEPRINTS SECTION */}
         <section className="mb-20">
            <BlueprintReview />
         </section>

         <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
               <GitCommit size={24} className="text-gray-800" /> Active Patterns
            </h2>
            <div className="flex gap-2">
               {['all', 'public', 'private'].map(filter => (
                 <button key={filter} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all capitalize">
                    {filter}
                 </button>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredThreads.map(thread => {
               const mood = moodMapping[thread.mood];
               return (
                  <div key={thread.id} className="group bg-[#111] border border-white/5 rounded-[3rem] overflow-hidden hover:border-white/20 transition-all duration-500 shadow-2xl relative">
                     <div className="absolute top-0 right-0 p-6 z-10">
                        {thread.isPublic ? <Globe size={16} className="text-white/20" /> : <Lock size={16} className="text-white/20" />}
                     </div>
                     
                     <div className="h-56 relative overflow-hidden">
                        {thread.coverImage ? (
                          <img src={thread.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                        ) : (
                          <div className={`w-full h-full ${mood.bg}`} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                        
                        <div className="absolute bottom-6 left-8 flex items-center gap-3">
                           <div className={`px-3 py-1 rounded-lg ${mood.bg} border border-${mood.color}-500/30 text-[8px] font-bold uppercase tracking-[0.2em] ${mood.text}`}>
                              {thread.mood}
                           </div>
                           <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[8px] font-bold uppercase tracking-[0.2em] text-white">
                              {thread.itemIds.length} Signals
                           </div>
                        </div>
                     </div>

                     <div className="p-8 pb-10">
                        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-canvas-primary transition-colors">{thread.title}</h3>
                        <p className="text-gray-400 font-serif italic leading-relaxed line-clamp-2 mb-8">"{thread.description}"</p>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                           <div className="flex items-center gap-3">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">Cross-Section</span>
                              <div className="flex -space-x-2">
                                 {thread.sourceRoomIds.map(roomId => (
                                    <div key={roomId} className="w-6 h-6 rounded-full bg-white/10 border border-[#111] flex items-center justify-center text-[7px] font-bold uppercase text-white">
                                       {roomId.toUpperCase()}
                                    </div>
                                 ))}
                              </div>
                           </div>
                           <a href={`/threads/${thread.id}`} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:text-black transition-all">
                              <ExternalLink size={14} />
                           </a>
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>

      </header>
    </div>
  );
}
