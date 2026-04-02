import { useState, useMemo } from "preact/hooks";
import { 
   ArrowLeft, Globe, Lock, Share2, Plus, 
   Layers, Lightbulb, Link2, ExternalLink, X, Trash2
} from "lucide-preact";
import { threadsSignal, type ThreadMood, removeItemFromThread, addItemToThread, toggleThreadPrivacy } from "../../signals/threads.ts";
import { itemsSignal } from "../../signals/items.ts";
import { roomsSignal } from "../../signals/rooms.ts";

const moodMapping: Record<ThreadMood, {
  border: string; shadow: string; text: string; bg: string; color: string;
}> = {
  contemplative: { border: 'border-violet-500/50', shadow: 'shadow-violet-500/20', text: 'text-violet-400', bg: 'bg-violet-500/10', color: '#8b5cf6' },
  curious: { border: 'border-cyan-500/50', shadow: 'shadow-cyan-500/20', text: 'text-cyan-400', bg: 'bg-cyan-500/10', color: '#06b6d4' },
  dark: { border: 'border-slate-500/50', shadow: 'shadow-slate-500/20', text: 'text-slate-400', bg: 'bg-slate-500/10', color: '#475569' },
  hopeful: { border: 'border-emerald-500/50', shadow: 'shadow-emerald-500/20', text: 'text-emerald-400', bg: 'bg-emerald-500/10', color: '#10b981' },
  urgent: { border: 'border-rose-500/50', shadow: 'shadow-rose-500/20', text: 'text-rose-400', bg: 'bg-rose-500/10', color: '#f43f5e' },
  serene: { border: 'border-amber-500/50', shadow: 'shadow-amber-500/20', text: 'text-amber-400', bg: 'bg-amber-500/10', color: '#f59e0b' },
};

export default function ThreadInside({ threadId }: { threadId: string }) {
  const thread = threadsSignal.value.find(t => t.id === threadId);
  const allItems = itemsSignal.value;
  const rooms = roomsSignal.value;

  const [showAddItems, setShowAddItems] = useState(false);
  const [activeTab, setActiveTab] = useState<'artifacts' | 'synthesis'>('artifacts');

   const synthesizedItems = thread ? allItems.filter((item) => thread.itemIds.includes(item.id)) : [];
   const sourceRoomNames = useMemo(() => {
      const names = new Set<string>();
      synthesizedItems.forEach((item) => {
         const roomName = rooms.find((room) => room.id === item.roomId)?.name;
         if (roomName) names.add(roomName);
      });
      return Array.from(names);
   }, [rooms, synthesizedItems]);

  if (!thread) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
      <p className="text-2xl font-bold text-white tracking-tight">Thread not found.</p>
      <a href="/threads" className="text-gray-400 hover:text-white text-sm underline">
        Back to Threads
      </a>
    </div>
  );

  const moodTheme = moodMapping[thread.mood] || moodMapping['contemplative'];

  const handleToggleItem = (itemId: string) => {
    if (thread.itemIds.includes(itemId)) {
      removeItemFromThread(thread.id, itemId);
    } else {
      addItemToThread(thread.id, itemId);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 md:pb-10 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className={`fixed inset-0 pointer-events-none transition-colors duration-1000 opacity-20 blur-[150px] ${moodTheme.bg}`} />
      
      <header className="relative w-full h-[45vh] min-h-[350px] overflow-hidden group">
        {thread.coverImage ? (
           <img src={thread.coverImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
        ) : (
           <div className={`absolute inset-0 ${moodTheme.bg} opacity-20`} />
        )}
        
        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

        <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10 max-w-7xl mx-auto w-full z-10">
          <div className="flex justify-between items-center">
            <a href="/threads" className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl">
              <ArrowLeft size={18} />
            </a>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleThreadPrivacy(thread.id)}
                type="button"
                className={`px-4 py-2 rounded-full backdrop-blur-md border shadow-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${thread.isPublic ? 'bg-white/10 border-white/20 text-white' : 'bg-black/50 border-black/40 text-gray-400'}`}
              >
                {thread.isPublic ? <><Globe size={13} className={moodTheme.text} /> Public Thread</> : <><Lock size={13} /> Private Thread</>}
              </button>
            </div>
          </div>

          <div className="md:max-w-3xl">
            <div className={`inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border shadow-lg transition-colors ${moodTheme.border} ${moodTheme.text}`}>
               <Layers size={10} /> {thread.mood} Flow
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-2xl">{thread.title}</h1>
            <p className="text-gray-400 text-lg md:text-xl font-serif italic mb-6 leading-relaxed line-clamp-2 max-w-2xl">{thread.description}</p>
            
            <div className="flex items-center gap-4">
               <div className="flex -space-x-3">
                  {synthesizedItems.slice(0, 5).map(item => (
                     <div key={item.id} className={`w-9 h-9 rounded-full border-2 border-[#0a0a0a] ${moodTheme.bg} flex items-center justify-center overflow-hidden`}>
                        <div className="w-full h-full bg-white/5" />
                     </div>
                  ))}
               </div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{synthesizedItems.length} Core Artifacts</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 md:p-10 max-w-7xl mx-auto relative z-10">
            <section className="mb-8 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
               <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-6 md:p-7 backdrop-blur-sm">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
                     <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white">Contemplate</span>
                     <span>Pattern synthesis</span>
                  </div>
                  <h2 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight text-white">{thread.title}</h2>
                  <p className="mt-3 max-w-3xl text-gray-400 font-serif italic leading-relaxed">
                     {thread.description || "This thread is where room artifacts are joined into a single pattern, then tested for meaning."}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                     {sourceRoomNames.length > 0 ? (
                        sourceRoomNames.map((name) => (
                           <span key={name} className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-300">
                              {name}
                           </span>
                        ))
                     ) : (
                        <span className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                           No source rooms yet
                        </span>
                     )}
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-3 rounded-[2rem] border border-white/5 bg-black/25 p-4 md:p-5 backdrop-blur-sm">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center">
                     <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Artifacts</div>
                     <div className="mt-2 text-2xl font-bold text-white">{synthesizedItems.length}</div>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center">
                     <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Sources</div>
                     <div className="mt-2 text-2xl font-bold text-white">{sourceRoomNames.length}</div>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center">
                     <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Mood</div>
                     <div className={`mt-2 text-2xl font-bold ${moodTheme.text}`}>{thread.mood}</div>
                  </div>
               </div>
            </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: THE THESIS & SYNTHESIS */}
          <div className="lg:col-span-8 space-y-12">
            <section className="relative">
               <div className={`absolute -inset-4 md:-inset-8 ${moodTheme.bg} blur-3xl opacity-10 rounded-4xl pointer-events-none`} />
               <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-md shadow-2xl">
                  <div className="flex items-center gap-3 mb-8">
                     <Lightbulb size={20} className={moodTheme.text} />
                     <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-500">Core Thesis & Intention</h2>
                  </div>
                  <blockquote className="text-2xl md:text-3xl font-serif italic text-white leading-snug mb-10 decoration-indigo-500/20 underline decoration-4 underline-offset-8">
                     "{thread.thesis || "No thesis defined for this exploration yet. What is the core question that unifies these artifacts?"}"
                  </blockquote>
                  <div className="flex items-center gap-6 pt-8 border-t border-white/5">
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Last Synthesis</p>
                        <p className="text-sm font-medium text-gray-400">{new Date(thread.updatedAt).toLocaleDateString()}</p>
                     </div>
                     <div className="w-px h-8 bg-white/5" />
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Origin Rooms</p>
                        <p className="text-sm font-medium text-gray-400">{sourceRoomNames.length > 0 ? sourceRoomNames.join(' · ') : 'Cross-Room Collective'}</p>
                     </div>
                  </div>
               </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                           <button 
                              type="button"
                    onClick={() => setActiveTab('artifacts')}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'artifacts' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                  >
                    Artifacts
                  </button>
                           <button 
                              type="button"
                    onClick={() => setActiveTab('synthesis')}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'synthesis' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                  >
                    Synthesis
                  </button>
                </div>
                <button 
                           type="button"
                  onClick={() => setShowAddItems(!showAddItems)}
                  className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 hover:border-white/20 text-[10px] font-bold uppercase tracking-widest text-white transition-all cursor-pointer"
                >
                  <Plus size={14} className={moodTheme.text} /> Modify Thread
                </button>
              </div>

              {showAddItems && (
                <div className="mb-10 p-6 bg-[#111318] border border-white/10 rounded-3xl animate-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="font-bold text-white tracking-tight">Add / Remove Synthesized Items</h3>
                     <button type="button" onClick={() => setShowAddItems(false)} className="text-gray-500 hover:text-white transition-colors">
                        <X size={18} />
                     </button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {allItems.map(item => {
                           const isSelected = thread.itemIds.includes(item.id);
                           const roomName = rooms.find(r => r.id === item.roomId)?.name || 'Unknown Room';
                           return (
                              <button
                                key={item.id}
                                onClick={() => handleToggleItem(item.id)}
                                type="button"
                                className={`p-4 rounded-2xl border transition-all text-left flex items-start gap-3 group cursor-pointer ${isSelected ? `bg-white/5 ${moodTheme.border}` : 'bg-transparent border-white/5 hover:border-white/10'}`}
                              >
                                 <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isSelected ? `${moodTheme.bg} ${moodTheme.border}` : 'border-white/20'}`}>
                                    {isSelected && <span className="text-[10px] font-bold text-white">+</span>}
                                 </div>
                                 <div className="min-w-0">
                                    <p className={`text-sm font-bold truncate group-hover:text-white transition-colors ${isSelected ? 'text-white' : 'text-gray-400'}`}>{item.title}</p>
                                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest truncate">{roomName}</p>
                                 </div>
                              </button>
                           );
                        })}
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'artifacts' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {synthesizedItems.length === 0 ? (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[2.5rem]">
                       <Layers size={32} className="text-gray-800 mb-4" />
                       <p className="text-gray-500 font-serif italic mb-6">No artifacts have been synthesized into this thread yet.</p>
                       <button type="button" onClick={() => setShowAddItems(true)} className="px-8 py-3 rounded-full bg-white text-black font-bold uppercase tracking-widest text-[11px] shadow-xl hover:-translate-y-1 transition-all">
                          Synthesize Now
                       </button>
                    </div>
                  ) : (
                    synthesizedItems.map(item => (
                      <div key={item.id} className={`p-6 bg-[#111318] border border-white/5 rounded-3xl hover:border-white/10 transition-all group relative overflow-hidden`}>
                        <div className={`absolute top-0 right-0 w-24 h-24 ${moodTheme.bg} blur-3xl opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none`} />
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3">
                             <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:underline">
                                {new URL(item.sourceUrl).hostname.replace('www.', '')}
                             </a>
                             <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                                <ExternalLink size={14} />
                             </a>
                          </div>
                          <h4 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                          {item.note && (
                            <p className="text-gray-400 font-serif italic text-sm leading-relaxed mb-4 line-clamp-3">"{item.note}"</p>
                          )}
                          <div className="flex items-center justify-between pt-4 border-t border-white/5">
                             <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">Added {new Date(item.createdAt).toLocaleDateString()}</span>
                             <button 
                                onClick={() => handleToggleItem(item.id)}
                                type="button" 
                                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-700 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={13} />
                             </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="p-12 text-center bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                   <Share2 size={32} className="mx-auto mb-6 text-indigo-500 opacity-50" />
                   <h3 className="text-2xl font-bold text-white mb-4">Thread Synthesis Engine</h3>
                   <p className="text-gray-500 font-serif italic text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                      This module generates a high-fidelity visual and structural output of your thread for external export and sharing.
                      Coming soon as part of the Muse Pro Max update.
                   </p>
                   <div className="inline-block px-10 py-4 bg-indigo-500 text-white font-bold uppercase tracking-widest text-xs rounded-full opacity-50 cursor-not-allowed">
                      Waitlist Open
                   </div>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: CONTEXT & META */}
          <div className="lg:col-span-4 space-y-8">
             <div className="p-8 bg-[#151515] border border-white/5 rounded-4xl shadow-xl">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-6 flex items-center gap-2">
                   <Link2 size={12} /> Pattern Context
                </h3>
                <div className="space-y-6">
                   <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Primary Mood</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${moodTheme.border} ${moodTheme.bg} transition-all`}>
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: moodTheme.color }} />
                         <span className={`text-[11px] font-bold uppercase tracking-widest ${moodTheme.text}`}>{thread.mood}</span>
                      </div>
                   </div>

                   <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Community Status</p>
                      {thread.isPublic ? (
                        <div className="flex items-center gap-3 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                           <Globe size={18} className="text-indigo-400" />
                           <div className="min-w-0">
                              <p className="text-xs font-bold text-white uppercase tracking-widest">Publically Visible</p>
                              <p className="text-[10px] text-gray-500 font-medium">Synced with Community Pulse</p>
                           </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                           <Lock size={18} className="text-gray-400" />
                           <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Solo Protocol</p>
                              <p className="text-[10px] text-gray-600 font-medium">Encrypted & Private</p>
                           </div>
                        </div>
                      )}
                   </div>

                   <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Room Lineage</p>
                      <ul className="space-y-3">
                         {Array.from(new Set(synthesizedItems.map(i => i.roomId))).map(roomId => {
                            const originRoom = rooms.find(r => r.id === roomId);
                            if (!originRoom) return null;
                            return (
                               <li key={roomId} className="flex items-center gap-3 group">
                                  <div className={`w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 overflow-hidden`}>
                                     {originRoom.coverImage ? (
                                        <img src={originRoom.coverImage} className="w-full h-full object-cover" alt="" />
                                     ) : (
                                        <Layers size={14} />
                                     )}
                                  </div>
                                  <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{originRoom.name}</span>
                               </li>
                            );
                         })}
                      </ul>
                   </div>
                </div>
             </div>

             <div className="relative p-1 overflow-hidden rounded-4xl bg-linear-to-br from-indigo-500/20 via-transparent to-violet-600/20 group">
                <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-[#0a0a0a] to-transparent z-10" />
                <div className="relative bg-[#111318] p-8 rounded-[1.9rem] flex flex-col items-center text-center">
                   <h4 className="text-base font-bold text-white mb-2 tracking-tight">Sync this Thread</h4>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">Create a living document</p>
                   <button type="button" className="w-full py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all">
                      Export to PDF
                   </button>
                   <button type="button" className="w-full py-3 mt-3 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:bg-white/5 transition-all">
                      Share to community
                   </button>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
