import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit2, 
  Share2, 
  Plus, 
  ExternalLink, 
  X, 
  Trash2, 
  Link2,
  Globe,
  Lock,
  Zap,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useThreadsStore } from '../store/useThreadsStore';
import { useConnectionsStore, type ActiveCircle } from '../store/useConnectionsStore';
import { useItemsStore } from '../store/useItemsStore';
import { useRoomsStore } from '../store/useRoomsStore';
import EditThreadModal from '../components/modals/EditThreadModal';
import ThoughtfulComposer from '../components/connections/ThoughtfulComposer';

export default function ThreadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCircle = searchParams.get('type') === 'circle';

  // Personal Thread Data
  const personalThread = useThreadsStore(state => state.threads.find(t => t.id === id));
  const updateThread = useThreadsStore(state => state.updateThread);
  const addItemToThread = useThreadsStore(state => state.addItemToThread);
  const removeItemFromThread = useThreadsStore(state => state.removeItemFromThread);

  // Community Circle Data
  const circle = useConnectionsStore(state => state.circles.find(c => c.id === id));
  const addContribution = useConnectionsStore(state => state.addContribution);

  const allItems = useItemsStore(state => state.items);
  const addNewItem = useItemsStore(state => state.addItem);
  const rooms = useRoomsStore(state => state.rooms);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [synthesisText, setSynthesisText] = useState(personalThread?.thesis || '');
  const [isEditingThesis, setIsEditingThesis] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [showLinkExisting, setShowLinkExisting] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [circle?.contributions]);

  if (isCircle && !circle) return <NotFound navigate={navigate} />;
  if (!isCircle && !personalThread) return <NotFound navigate={navigate} />;



  return (
    <div className="min-h-screen bg-canvas-bg-dark text-white flex flex-col">
      {isEditOpen && personalThread && (
        <EditThreadModal thread={personalThread} onClose={() => setIsEditOpen(false)} onDeleted={() => navigate('/threads')} />
      )}

      {/* FIXED TOP NAV */}
      <header className="sticky top-0 z-50 bg-canvas-bg-dark/80 backdrop-blur-2xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/threads')} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCircle ? 'bg-canvas-primary/20 text-canvas-primary' : 'bg-violet-500/20 text-violet-400'}`}>
                {isCircle ? <Globe size={16} /> : <Lock size={16} />}
             </div>
             <div>
                <h1 className="text-sm font-bold tracking-tight">{isCircle ? circle?.name : personalThread?.title}</h1>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isCircle ? 'Community Circle' : 'Private Weave'}</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all">
              <Share2 size={18} />
           </button>
           {!isCircle && (
             <button onClick={() => setIsEditOpen(true)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all">
                <Edit2 size={18} />
             </button>
           )}
        </div>
      </header>

      {isCircle ? (
        <CircleView circle={circle!} addContribution={addContribution} scrollRef={scrollRef} />
      ) : (
        <PrivateView 
          thread={personalThread!} 
          threadItems={allItems.filter(i => personalThread!.itemIds.includes(i.id))}
          unlinkedItems={allItems.filter(i => !personalThread!.itemIds.includes(i.id))}
          rooms={rooms}
          isEditingThesis={isEditingThesis}
          setIsEditingThesis={setIsEditingThesis}
          synthesisText={synthesisText}
          setSynthesisText={setSynthesisText}
          handleSaveThesis={() => { updateThread(personalThread!.id, { thesis: synthesisText }); setIsEditingThesis(false); }}
          setShowAddLink={setShowAddLink}
          showAddLink={showAddLink}
          setShowLinkExisting={setShowLinkExisting}
          showLinkExisting={showLinkExisting}
          addItemToThread={addItemToThread}
          removeItemFromThread={removeItemFromThread}
          addNewItem={addNewItem}
        />
      )}
    </div>
  );
}

function CircleView({ circle, addContribution, scrollRef }: { 
  circle: ActiveCircle; 
  addContribution: any;
  scrollRef: any;
}) {
  return (
    <div className="flex-1 flex overflow-hidden">
       {/* MAIN DIALOGUE AREA */}
       <div className="flex-1 flex flex-col relative">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-12 space-y-12">
             <div className="max-w-3xl mx-auto space-y-12">
                {/* Intro/Context */}
                <div className="text-center mb-20">
                   <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                      <Sparkles size={14} className="text-canvas-primary" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dialogue Seeding</span>
                   </div>
                   <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">{circle.name}</h2>
                   <p className="text-gray-400 font-serif italic max-w-lg mx-auto leading-relaxed">
                     "{circle.description}"
                   </p>
                </div>

                {/* Perspective Bubbles */}
                {circle.contributions.map((con) => (
                  <motion.div
                    key={con.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${con.authorId === 'me' ? 'items-end' : 'items-start'} gap-3`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{con.authorName}</span>
                       <div className="w-1 h-1 rounded-full bg-gray-700" />
                       <span className={`text-[9px] font-bold uppercase tracking-widest ${con.tone === 'Reflect' ? 'text-indigo-400' : con.tone === 'Build' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {con.tone}
                       </span>
                    </div>

                    <div className={`max-w-xl group relative`}>
                       <div className={`p-6 rounded-[2rem] border bg-white/[0.03] backdrop-blur-xl ${con.authorId === 'me' ? 'rounded-tr-lg border-canvas-primary/20' : 'rounded-tl-lg border-white/5'}`}>
                          <p className="text-base text-gray-200 leading-relaxed font-serif italic">"{con.text}"</p>
                       </div>
                       
                       {/* Contextual Glow */}
                       <div className={`absolute -inset-1 blur-2xl opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none ${con.tone === 'Reflect' ? 'bg-indigo-500' : con.tone === 'Build' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>

          {/* COMPOSER AREA */}
          <div className="p-6 md:p-10 bg-canvas-bg-dark/80 backdrop-blur-xl border-t border-white/5">
             <div className="max-w-3xl mx-auto">
                <ThoughtfulComposer 
                  onSubmit={(text, tone) => addContribution(circle.id, text, tone)} 
                />
             </div>
          </div>
       </div>

       {/* RIGHT RAIL: Collective Intelligence */}
       <aside className="w-80 border-l border-white/5 hidden xl:flex flex-col p-8 space-y-12 overflow-y-auto">
          <div>
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <TrendingUp size={14} className="text-canvas-primary" /> Intelligence Strip
             </h3>
             <div className="space-y-6">
                <div className="p-5 bg-white/5 border border-white/5 rounded-3xl">
                   <p className="text-[11px] font-bold text-white mb-2 uppercase tracking-widest">Circle Resonance</p>
                   <div className="flex justify-between items-end mb-2">
                      <span className="text-2xl font-mono text-emerald-400">94%</span>
                      <span className="text-[10px] text-gray-500">Very High</span>
                   </div>
                   <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 w-[94%]" />
                   </div>
                </div>

                <div className="p-5 bg-white/2 border border-white/5 rounded-3xl">
                   <p className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-widest">Active Members</p>
                   <div className="flex -space-x-2 mb-4">
                      {circle.members.map((m, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-canvas-bg-dark bg-gray-800 overflow-hidden flex items-center justify-center font-bold text-[10px]">
                           <img src={`https://i.pravatar.cc/100?u=${circle.id}${i}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                   </div>
                   <button className="text-[10px] font-bold text-canvas-primary uppercase tracking-widest hover:underline">Invite Thinker</button>
                </div>
             </div>
          </div>

          <div>
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Zap size={14} className="text-amber-400" /> Key Syntheses
             </h3>
             <div className="space-y-4">
                {['Silence is structural in digital architecture.', 'Flow state vs Void state.'].map((s, i) => (
                  <div key={i} className="flex gap-3 group">
                     <div className="mt-1.5 w-1 h-1 rounded-full bg-canvas-primary shrink-0 group-hover:scale-150 transition-transform" />
                     <p className="text-xs text-gray-400 leading-relaxed font-serif italic group-hover:text-gray-200 transition-colors">"{s}"</p>
                  </div>
                ))}
             </div>
          </div>
       </aside>
    </div>
  );
}

function PrivateView({ 
  thread, threadItems, unlinkedItems, rooms, isEditingThesis, setIsEditingThesis, 
  synthesisText, setSynthesisText, handleSaveThesis, setShowAddLink, showAddLink, 
  setShowLinkExisting, showLinkExisting, addItemToThread, removeItemFromThread, addNewItem 
}: any) {
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newNote, setNewNote] = useState('');
  const [addError, setAddError] = useState('');
  // Find the first room as default for new items in a thread
  const firstRoomId = rooms?.[0]?.id || '';

  const handleAddNew = () => {
    if (!newTitle.trim()) { setAddError('Title is required.'); return; }
    if (!newUrl.trim()) { setAddError('URL is required.'); return; }
    let url = newUrl.trim();
    if (!/^https?:\/\//.test(url)) url = 'https://' + url;
    // Create item in the first room, then link it to this thread
    const newItem = addNewItem({ roomId: firstRoomId, title: newTitle.trim(), sourceUrl: url, note: newNote.trim() || undefined, isPublic: false });
    if (newItem?.id) addItemToThread(thread.id, newItem.id);
    setNewTitle(''); setNewUrl(''); setNewNote(''); setAddError('');
    setShowAddLink(false);
  };

  return (
    <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full z-10 flex flex-col gap-12 overflow-y-auto">
      {/* SYNTHESIS / THESIS SECTION */}
      <section className="mb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center">
                <Zap size={16} />
             </div>
             <h2 className="text-xs font-bold uppercase tracking-widest text-violet-400">Personal Synthesis</h2>
          </div>
          <button onClick={() => isEditingThesis ? handleSaveThesis() : setIsEditingThesis(true)}
            className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors cursor-pointer">
            {isEditingThesis ? 'Save Weave' : 'Edit Synthesis'}
          </button>
        </div>
        {isEditingThesis ? (
          <textarea
            value={synthesisText}
            onChange={e => setSynthesisText(e.target.value)}
            rows={4}
            autoFocus
            placeholder="What is the deeper question or pattern this weave reveals?"
            className="w-full bg-white/5 border border-violet-500/30 rounded-3xl px-7 py-6 text-white placeholder-gray-600 focus:outline-none transition-all text-base font-serif italic leading-loose resize-none h-40"
          />
        ) : (
          <div onClick={() => setIsEditingThesis(true)}
            className="w-full bg-white/2 border border-white/5 rounded-3xl px-7 py-6 cursor-text hover:bg-white/5 transition-all min-h-[120px]"
          >
            {thread.thesis ? (
              <p className="text-gray-200 text-lg font-serif italic leading-loose">"{thread.thesis}"</p>
            ) : (
              <p className="text-gray-600 text-sm font-serif italic">Click to write your synthesis…</p>
            )}
          </div>
        )}
      </section>

      {/* ARTIFACTS SECTION */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">{threadItems.length} Private Artifacts</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => { setShowLinkExisting(!showLinkExisting); setShowAddLink(false); }}
              className={`px-5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${showLinkExisting ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
              Link Existing
            </button>
            <button onClick={() => { setShowAddLink(!showAddLink); setShowLinkExisting(false); setAddError(''); }}
              className={`px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg cursor-pointer ${showAddLink ? 'bg-violet-400 text-black' : 'bg-violet-600 hover:bg-violet-500 shadow-violet-500/20'}`}>
              Add New
            </button>
          </div>
        </div>

        {/* PANEL: Add New Artifact */}
        {showAddLink && (
          <div className="mb-6 p-6 bg-white/[0.03] border border-violet-500/20 rounded-3xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white tracking-tight flex items-center gap-2">
                <Plus size={16} className="text-violet-400" /> New Artifact
              </h3>
              <button onClick={() => { setShowAddLink(false); setAddError(''); }} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-all">
                <X size={15} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Title *</label>
                <input value={newTitle} onChange={e => { setNewTitle(e.target.value); setAddError(''); }}
                  placeholder="Article name, song title…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500/40 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">URL *</label>
                <input value={newUrl} onChange={e => { setNewUrl(e.target.value); setAddError(''); }}
                  placeholder="https://…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500/40 transition-all" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Note (optional)</label>
              <textarea value={newNote} onChange={e => setNewNote(e.target.value)}
                placeholder="Why does this matter to this weave?"
                rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm font-serif italic focus:outline-none focus:border-violet-500/40 transition-all resize-none" />
            </div>
            {addError && <p className="text-rose-400 text-xs mb-3 font-medium">{addError}</p>}
            <button onClick={handleAddNew}
              className="px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm bg-violet-600 hover:bg-violet-500 text-white transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95">
              Weave into Thread
            </button>
          </div>
        )}

        {/* PANEL: Link Existing Artifacts */}
        {showLinkExisting && (
          <div className="mb-6 p-6 bg-white/[0.03] border border-violet-500/20 rounded-3xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white tracking-tight flex items-center gap-2">
                <Link2 size={16} className="text-violet-400" /> Link from Your Rooms
              </h3>
              <button onClick={() => setShowLinkExisting(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-all">
                <X size={15} />
              </button>
            </div>
            {unlinkedItems.length === 0 ? (
              <p className="text-gray-500 font-serif italic text-sm text-center py-8">All your room artifacts are already in this thread.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                {unlinkedItems.map((item: any) => (
                  <button key={item.id} onClick={() => { addItemToThread(thread.id, item.id); }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-violet-500/30 transition-all text-left group cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{item.title}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">
                        {rooms.find((r: any) => r.id === item.roomId)?.name || 'Room'}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-3">
                      <Plus size={14} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Artifacts Grid */}
        {threadItems.length === 0 && !showAddLink && !showLinkExisting ? (
          <div className="py-24 bg-white/2 border border-white/5 border-dashed rounded-4xl flex flex-col items-center justify-center text-center">
             <Link2 size={32} className="text-gray-700 mb-4" />
             <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">No Artifacts Linked</p>
             <p className="text-xs text-gray-600 font-serif italic">Start weaving items from your rooms to find patterns.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
             {threadItems.map((item: any) => (
               <div key={item.id} className="bg-white/2 border border-white/5 rounded-3xl p-6 group hover:border-violet-500/30 transition-all">
                  <div className="flex items-center justify-between mb-4">
                     <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                       {rooms.find((r: any) => r.id === item.roomId)?.name || 'General'}
                     </span>
                     <button onClick={() => removeItemFromThread(thread.id, item.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-rose-400 transition-all cursor-pointer">
                        <Trash2 size={14} />
                     </button>
                  </div>
                  <h4 className="font-bold text-white mb-2 line-clamp-1">{item.title}</h4>
                  {item.note && <p className="text-xs text-gray-500 font-serif italic border-l border-white/10 pl-3 mb-4">"{item.note}"</p>}
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-violet-400 hover:underline">
                    View Source <ExternalLink size={12} />
                  </a>
               </div>
             ))}
          </div>
        )}
      </section>
    </main>
  );
}

function NotFound({ navigate }: { navigate: any }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-canvas-bg-dark">
      <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-gray-500">
         <X size={32} />
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-white mb-2 tracking-tight">Dialogue Lost.</p>
        <p className="text-gray-500 font-serif italic">This space does not seem to exist yet.</p>
      </div>
      <button onClick={() => navigate('/threads')} className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-full hover:scale-105 transition-transform">
        Back to Portal
      </button>
    </div>
  );
}
