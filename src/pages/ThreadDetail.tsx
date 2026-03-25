import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Edit2, Share2, Plus, ExternalLink, X, Trash2, Link2, ChevronDown } from 'lucide-react';
import { useThreadsStore, type ThreadMood } from '../store/useThreadsStore';
import { useItemsStore } from '../store/useItemsStore';
import { useRoomsStore } from '../store/useRoomsStore';
import EditThreadModal from '../components/modals/EditThreadModal';

const moodColors: Record<ThreadMood, string> = {
  contemplative: '#8b5cf6',
  curious: '#06b6d4',
  dark: '#475569',
  hopeful: '#10b981',
  urgent: '#f43f5e',
  serene: '#f59e0b',
};
const moodLabels: Record<ThreadMood, string> = {
  contemplative: 'Contemplative', curious: 'Curious', dark: 'Dark',
  hopeful: 'Hopeful', urgent: 'Urgent', serene: 'Serene',
};

export default function ThreadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const thread = useThreadsStore(state => state.threads.find(t => t.id === id));
  const updateThread = useThreadsStore(state => state.updateThread);
  const addItemToThread = useThreadsStore(state => state.addItemToThread);
  const removeItemFromThread = useThreadsStore(state => state.removeItemFromThread);

  const allItems = useItemsStore(state => state.items);
  const addNewItem = useItemsStore(state => state.addItem);
  const rooms = useRoomsStore(state => state.rooms);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [synthesisText, setSynthesisText] = useState(thread?.thesis || '');
  const [isEditingThesis, setIsEditingThesis] = useState(false);

  // Add new link panel
  const [showAddLink, setShowAddLink] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newNote, setNewNote] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [addError, setAddError] = useState('');

  // Link existing item
  const [showLinkExisting, setShowLinkExisting] = useState(false);

  if (!thread) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-2xl font-bold text-white">Thread not found.</p>
      <button onClick={() => navigate('/threads')} className="text-gray-400 hover:text-white text-sm cursor-pointer underline">Back to Threads</button>
    </div>
  );

  const color = moodColors[thread.mood];
  const threadItems = allItems.filter(i => thread.itemIds.includes(i.id));
  const unlinkedItems = allItems.filter(i => !thread.itemIds.includes(i.id));

  const getHostname = (url: string) => {
    try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
  };

  const getRoomName = (roomId: string) => rooms.find(r => r.id === roomId)?.name || 'Unknown Room';

  const handleSaveThesis = () => {
    updateThread(thread.id, { thesis: synthesisText });
    setIsEditingThesis(false);
  };

  const handleAddNewLink = () => {
    if (!newTitle.trim()) { setAddError('Title required.'); return; }
    if (!newUrl.trim()) { setAddError('URL required.'); return; }
    let sourceUrl = newUrl.trim();
    if (!/^https?:\/\//.test(sourceUrl)) sourceUrl = 'https://' + sourceUrl;
    const roomId = selectedRoomId || (rooms[0]?.id ?? 'general');
    addNewItem({ roomId, title: newTitle.trim(), sourceUrl, note: newNote.trim() || undefined });
    // We need to get the newly created item's id — it'll be Date.now().toString()
    // We add a brief step: find the item that was just added
    const newId = Date.now().toString();
    setTimeout(() => addItemToThread(thread.id, newId), 50);
    setNewTitle(''); setNewUrl(''); setNewNote(''); setAddError('');
    setShowAddLink(false);
  };

  return (
    <>
      {isEditOpen && (
        <EditThreadModal thread={thread} onClose={() => setIsEditOpen(false)} onDeleted={() => navigate('/threads')} />
      )}

      <div className="min-h-screen bg-[#0a0a0a] pb-24 md:pb-10 relative">
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none opacity-10 transition-colors duration-1000" style={{ background: `radial-gradient(ellipse at top right, ${color}60, transparent 60%)` }} />

        {/* HERO */}
        <header className="relative w-full h-[48vh] min-h-[380px] overflow-hidden group">
          {thread.coverImage ? (
            <img src={thread.coverImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
          ) : (
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at top right, ${color}30, #0a0a0a 70%)` }} />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10 max-w-7xl mx-auto w-full z-10">
            {/* Top row */}
            <div className="flex justify-between items-center">
              <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all shadow-lg cursor-pointer">
                <ArrowLeft size={18} />
              </button>
              <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md"
                style={{ backgroundColor: color + '22', borderColor: color + '55', color }}>
                {moodLabels[thread.mood]}
              </span>
            </div>

            {/* Glass info plate */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute inset-0 blur-2xl opacity-20 mix-blend-overlay pointer-events-none" style={{ backgroundColor: color }} />
              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 drop-shadow-xl">{thread.title}</h1>
                  {thread.description && <p className="text-gray-300 text-sm mb-1">{thread.description}</p>}
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest">{threadItems.length} artifacts · updated {new Date(thread.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button onClick={() => setIsEditOpen(true)} className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-lg border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                    <Edit2 size={17} />
                  </button>
                  <button className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-full shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer">
                    <Share2 size={15} /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN WORKSPACE */}
        <main className="p-6 md:p-10 max-w-7xl mx-auto relative z-10">
          
          {/* SYNTHESIS / THESIS SECTION */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color }}>Synthesis Note</h2>
              <button onClick={() => isEditingThesis ? handleSaveThesis() : setIsEditingThesis(true)}
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors cursor-pointer">
                {isEditingThesis ? 'Save' : 'Edit'}
              </button>
            </div>
            {isEditingThesis ? (
              <textarea
                value={synthesisText}
                onChange={e => setSynthesisText(e.target.value)}
                rows={4}
                autoFocus
                placeholder="What is the deeper question or pattern this thread reveals? Write your synthesis here — this is where Threads differ from Journal. You're thinking about the connections between your collected artifacts, not about yourself."
                className="w-full bg-white/5 border rounded-3xl px-7 py-6 text-white placeholder-gray-600 focus:outline-none transition-all text-base font-serif italic leading-loose resize-none"
                style={{ borderColor: color + '55' }}
              />
            ) : (
              <div onClick={() => setIsEditingThesis(true)}
                className="w-full bg-white/[0.02] border rounded-3xl px-7 py-6 cursor-text hover:bg-white/5 transition-all min-h-[100px]"
                style={{ borderColor: color + '33' }}
              >
                {thread.thesis ? (
                  <p className="text-gray-200 text-base font-serif italic leading-loose">"{thread.thesis}"</p>
                ) : (
                  <p className="text-gray-600 text-sm font-serif italic">Click to write your synthesis…</p>
                )}
              </div>
            )}
          </section>

          {/* CONTROLS */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{threadItems.length} Connected Artifacts</span>
            <div className="flex items-center gap-3">
              <button onClick={() => { setShowLinkExisting(!showLinkExisting); setShowAddLink(false); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold uppercase tracking-widest transition-all cursor-pointer active:scale-95">
                <Link2 size={15} /> Link Existing
              </button>
              <button onClick={() => { setShowAddLink(!showAddLink); setShowLinkExisting(false); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold uppercase tracking-widest transition-all cursor-pointer active:scale-95"
                style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}55` }}>
                <Plus size={15} /> Add New
              </button>
            </div>
          </div>

          {/* LINK EXISTING panel */}
          {showLinkExisting && (
            <div className="mb-8 bg-[#111318] border border-white/10 rounded-3xl p-6 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-white">Link an existing artifact to this thread</p>
                <button onClick={() => setShowLinkExisting(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"><X size={15} /></button>
              </div>
              {unlinkedItems.length === 0 ? (
                <p className="text-gray-500 text-sm font-serif italic">All your artifacts are already in this thread.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {unlinkedItems.map(item => (
                    <button key={item.id} onClick={() => { addItemToThread(thread.id, item.id); }}
                      className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 text-left transition-all cursor-pointer group">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold line-clamp-1">{item.title}</p>
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest">{getRoomName(item.roomId)}</p>
                      </div>
                      <Plus size={14} className="text-gray-500 group-hover:text-white transition-colors shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADD NEW LINK panel */}
          {showAddLink && (
            <div className="mb-8 bg-[#111318] border border-white/10 rounded-3xl p-6 relative animate-in slide-in-from-top-4 duration-300">
              <div className="absolute inset-0 rounded-3xl pointer-events-none opacity-10" style={{ boxShadow: `inset 0 0 40px ${color}` }} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-white">Add New Artifact</h3>
                  <button onClick={() => { setShowAddLink(false); setAddError(''); }} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"><X size={15} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Title *</label>
                    <input value={newTitle} onChange={e => { setNewTitle(e.target.value); setAddError(''); }}
                      placeholder="Article, song, video…"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-white/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">URL *</label>
                    <input value={newUrl} onChange={e => { setNewUrl(e.target.value); setAddError(''); }}
                      placeholder="https://…"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-white/30 transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Save to Room</label>
                    <div className="relative">
                      <select value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)}
                        className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-all cursor-pointer">
                        {rooms.map(r => <option key={r.id} value={r.id} className="bg-[#111] text-white">{r.name}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Annotation Note</label>
                    <input value={newNote} onChange={e => setNewNote(e.target.value)}
                      placeholder="Why does this belong in this thread?"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm font-serif italic focus:outline-none focus:border-white/30 transition-all"
                    />
                  </div>
                </div>
                {addError && <p className="text-rose-400 text-xs mb-3 font-medium">{addError}</p>}
                <button onClick={handleAddNewLink}
                  className="px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm text-white transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95"
                  style={{ backgroundColor: color }}>
                  Add to Thread
                </button>
              </div>
            </div>
          )}

          {/* ARTIFACTS GRID */}
          {threadItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-[#111318]/50 rounded-3xl border border-white/5">
              <div className="w-20 h-20 rounded-3xl mb-6 flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
                <Link2 size={28} style={{ color }} />
              </div>
              <p className="text-white text-xl font-bold tracking-tight mb-2">No artifacts yet.</p>
              <p className="text-gray-400 font-serif italic text-sm mb-6 text-center max-w-sm">Link existing artifacts from your Rooms, or add new links directly to this thread.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {threadItems.map(item => (
                <div key={item.id} className="bg-[#111318] rounded-3xl border border-white/5 overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-xl">
                  {/* Color header */}
                  <div className="h-28 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${color}20, transparent)` }}>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-white/5 to-transparent" />
                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-gray-300 hover:text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      onClick={e => e.stopPropagation()}>
                      <ExternalLink size={13} />
                    </a>
                    <div className="absolute bottom-3 left-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{getRoomName(item.roomId)}</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h4 className="font-bold text-base text-white/90 group-hover:text-white mb-2 line-clamp-2 leading-snug">{item.title}</h4>
                    {item.note && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3 font-serif italic border-l-2 border-white/10 pl-3">"{item.note}"</p>
                    )}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] uppercase font-bold tracking-widest truncate max-w-[65%] hover:underline cursor-pointer"
                        style={{ color }}>
                        {getHostname(item.sourceUrl)}
                      </a>
                      <button onClick={() => removeItemFromThread(thread.id, item.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
