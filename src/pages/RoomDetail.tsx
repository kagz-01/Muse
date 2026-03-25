import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useRoomsStore, type RoomTheme } from '../store/useRoomsStore';
import { useItemsStore } from '../store/useItemsStore';
import {
  ArrowLeft, Globe, Lock, Palette, Check, Camera,
  Edit2, Share2, Plus, ExternalLink, Trash2, X
} from 'lucide-react';
import EditRoomModal from '../components/modals/EditRoomModal';

const themeMapping: Record<RoomTheme, {
  border: string; shadow: string; text: string; bg: string; fill: string;
}> = {
  indigo: { border: 'border-indigo-500/50', shadow: 'shadow-indigo-500/20', text: 'text-indigo-400', bg: 'bg-indigo-500/10', fill: 'bg-indigo-500' },
  emerald: { border: 'border-emerald-500/50', shadow: 'shadow-emerald-500/20', text: 'text-emerald-400', bg: 'bg-emerald-500/10', fill: 'bg-emerald-500' },
  rose: { border: 'border-rose-500/50', shadow: 'shadow-rose-500/20', text: 'text-rose-400', bg: 'bg-rose-500/10', fill: 'bg-rose-500' },
  amber: { border: 'border-amber-500/50', shadow: 'shadow-amber-500/20', text: 'text-amber-400', bg: 'bg-amber-500/10', fill: 'bg-amber-500' },
  cyan: { border: 'border-cyan-500/50', shadow: 'shadow-cyan-500/20', text: 'text-cyan-400', bg: 'bg-cyan-500/10', fill: 'bg-cyan-500' },
  slate: { border: 'border-slate-500/50', shadow: 'shadow-slate-500/20', text: 'text-slate-400', bg: 'bg-slate-500/10', fill: 'bg-slate-500' },
};

const paletteColors: { name: RoomTheme; hex: string }[] = [
  { name: 'indigo', hex: '#6366f1' }, { name: 'emerald', hex: '#10b981' },
  { name: 'rose', hex: '#f43f5e' }, { name: 'amber', hex: '#f59e0b' },
  { name: 'cyan', hex: '#06b6d4' }, { name: 'slate', hex: '#64748b' },
];

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const room = useRoomsStore(state => state.rooms.find(r => r.id === id));
  const updateRoomTheme = useRoomsStore(state => state.updateRoomTheme);
  const updateRoomCover = useRoomsStore(state => state.updateRoomCover);
  const toggleRoomPrivacy = useRoomsStore(state => state.toggleRoomPrivacy);

  const items = useItemsStore(state => state.items.filter(i => i.roomId === id));
  const addItem = useItemsStore(state => state.addItem);
  const deleteItem = useItemsStore(state => state.deleteItem);

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newNote, setNewNote] = useState('');
  const [addError, setAddError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!room) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-2xl font-bold text-white tracking-tight">Room not found.</p>
      <button onClick={() => navigate('/rooms')} className="text-gray-400 hover:text-white text-sm cursor-pointer underline">
        Back to Rooms
      </button>
    </div>
  );

  const theme = themeMapping[room.themeColor] || themeMapping['indigo'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateRoomCover(room.id, reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    if (!newTitle.trim()) { setAddError('Title is required.'); return; }
    if (!newUrl.trim()) { setAddError('URL / link is required.'); return; }
    let sourceUrl = newUrl.trim();
    if (!/^https?:\/\//.test(sourceUrl)) sourceUrl = 'https://' + sourceUrl;
    addItem({ roomId: room.id, title: newTitle.trim(), sourceUrl, note: newNote.trim() || undefined });
    setNewTitle(''); setNewUrl(''); setNewNote(''); setAddError('');
    setShowAddItem(false);
  };

  const getHostname = (url: string) => {
    try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
  };

  return (
    <>
      {isEditOpen && (
        <EditRoomModal
          room={room}
          onClose={() => setIsEditOpen(false)}
          onDeleted={() => navigate('/rooms')}
        />
      )}

      <div className="pb-24 md:pb-10 min-h-screen bg-[#0a0a0a] relative">
        {/* Ambient glow */}
        <div className={`fixed inset-0 pointer-events-none ${theme.bg} blur-3xl opacity-20 transition-colors duration-1000`} />

        {/* HERO HEADER */}
        <header className="relative w-full h-[52vh] min-h-[400px] overflow-hidden group">
          {room.coverImage ? (
            <img src={room.coverImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
          ) : (
            <div className={`absolute inset-0 ${theme.bg}`} />
          )}

          <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

          {/* Hidden file input for cover upload */}
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

          {/* Camera upload btn (appears on hover) */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute top-5 right-5 z-20 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl cursor-pointer opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
          >
            <Camera size={18} />
          </button>

          <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10 max-w-7xl mx-auto w-full z-10">
            {/* Top row */}
            <div className="flex justify-between items-center">
              <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all shadow-lg cursor-pointer">
                <ArrowLeft size={18} />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleRoomPrivacy(room.id)}
                  className={`px-3.5 py-2 rounded-full backdrop-blur-md border shadow-lg flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer ${room.isPublic ? 'bg-white/10 border-white/20 text-white' : 'bg-black/50 border-black/40 text-gray-400'}`}
                >
                  {room.isPublic ? <><Globe size={12} className={theme.text} /> Public</> : <><Lock size={12} /> Private</>}
                </button>
              </div>
            </div>

            {/* Bottom info glass plate */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
              <div className={`absolute inset-0 ${theme.bg} blur-2xl opacity-30 mix-blend-overlay pointer-events-none`} />

              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3 drop-shadow-xl">{room.name}</h1>
                  {room.description && (
                    <p className="text-gray-300 font-serif italic text-base md:text-lg max-w-2xl leading-relaxed line-clamp-2">{room.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Palette */}
                  <div className="relative">
                    <button onClick={() => setIsPaletteOpen(!isPaletteOpen)} className={`w-11 h-11 rounded-full backdrop-blur-lg border border-white/10 flex items-center justify-center transition-all shadow-xl cursor-pointer ${isPaletteOpen ? 'bg-white/20' : 'bg-black/50 hover:bg-white/10'}`}>
                      <Palette size={18} className={theme.text} />
                    </button>
                    {isPaletteOpen && (
                      <div className="absolute bottom-full right-0 mb-3 bg-[#151515] border border-white/10 rounded-2xl p-3 shadow-2xl flex gap-2 z-20">
                        {paletteColors.map(c => (
                          <button key={c.name} onClick={() => { updateRoomTheme(room.id, c.name); setIsPaletteOpen(false); }}
                            style={{ backgroundColor: c.hex }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 cursor-pointer ${room.themeColor === c.name ? 'ring-2 ring-white ring-offset-2 ring-offset-[#151515]' : ''}`}
                          >
                            {room.themeColor === c.name && <Check size={13} strokeWidth={3} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Edit */}
                  <button onClick={() => setIsEditOpen(true)} className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-lg border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all shadow-xl cursor-pointer">
                    <Edit2 size={17} />
                  </button>

                  {/* Share */}
                  <button className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-full shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer">
                    <Share2 size={15} /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT WORKSPACE */}
        <main className="p-6 md:p-10 max-w-7xl mx-auto relative z-10 -mt-4">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <span className={`inline-block px-4 py-1.5 rounded-full bg-[#1c1c1c] border border-white/5 text-sm font-bold uppercase tracking-widest ${theme.text}`}>
              {items.length} {items.length === 1 ? 'Artifact' : 'Artifacts'}
            </span>
            <button
              onClick={() => setShowAddItem(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold uppercase tracking-widest transition-all cursor-pointer active:scale-95"
            >
              <Plus size={16} /> Add to Room
            </button>
          </div>

          {/* Add Item Form */}
          {showAddItem && (
            <div className="mb-8 bg-[#111318] border border-white/10 rounded-3xl p-6 relative animate-in slide-in-from-top-4 duration-300">
              <div className={`absolute -top-10 -right-10 w-32 h-32 ${theme.bg} blur-3xl opacity-30 pointer-events-none`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-white tracking-tight">Add to Room</h3>
                  <button onClick={() => { setShowAddItem(false); setAddError(''); }} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer">
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Title *</label>
                    <input value={newTitle} onChange={e => { setNewTitle(e.target.value); setAddError(''); }}
                      placeholder="Article title, song name…"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-white/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">URL / Link *</label>
                    <input value={newUrl} onChange={e => { setNewUrl(e.target.value); setAddError(''); }}
                      placeholder="https://…"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-white/30 transition-all"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Your Note</label>
                  <textarea value={newNote} onChange={e => setNewNote(e.target.value)}
                    placeholder="Why does this matter to you?"
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm font-serif italic focus:outline-none focus:border-white/30 transition-all resize-none"
                  />
                </div>
                {addError && <p className="text-rose-400 text-xs mb-3 font-medium">{addError}</p>}
                <button onClick={handleAddItem}
                  className="px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm text-black transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95"
                  style={{ backgroundColor: paletteColors.find(c => c.name === room.themeColor)?.hex || '#6366f1' }}
                >
                  Save to Room
                </button>
              </div>
            </div>
          )}

          {/* Items Grid */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-[#111318]/50 backdrop-blur-md rounded-3xl border border-white/5">
              <div className={`w-20 h-20 ${theme.bg} rounded-3xl mb-6 flex items-center justify-center`}>
                <Plus size={28} className={theme.text} />
              </div>
              <p className="text-white text-xl font-bold tracking-tight mb-2">This room is empty.</p>
              <p className="text-gray-400 font-serif italic text-sm mb-6">Start adding links, articles, music — anything you want to keep.</p>
              <button onClick={() => setShowAddItem(true)}
                className="px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm text-black cursor-pointer hover:-translate-y-0.5 active:scale-95 transition-all"
                style={{ backgroundColor: paletteColors.find(c => c.name === room.themeColor)?.hex || '#6366f1' }}
              >
                Add First Artifact
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map(item => (
                <div key={item.id}
                  className={`bg-[#111318] rounded-3xl border border-white/5 overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:${theme.border} hover:shadow-xl hover:${theme.shadow}`}
                >
                  {/* Visual header */}
                  <div className={`h-32 ${theme.bg} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-white/5 to-transparent" />
                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-gray-300 hover:text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>

                  <div className="p-5">
                    <h4 className="font-bold text-base leading-tight mb-2 text-white/90 group-hover:text-white transition-colors line-clamp-2">{item.title}</h4>
                    {item.note && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3 font-serif italic border-l-2 border-white/10 pl-3">"{item.note}"</p>
                    )}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                        className={`text-[10px] uppercase font-bold tracking-widest truncate max-w-[65%] ${theme.text} hover:underline cursor-pointer`}
                      >
                        {getHostname(item.sourceUrl)}
                      </a>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Quick Add Card */}
              <div
                onClick={() => setShowAddItem(true)}
                className="h-full min-h-[220px] border-2 border-dashed border-white/10 rounded-3xl hover:border-white/25 hover:bg-white/[0.02] transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
              >
                <div className={`w-12 h-12 rounded-full border-2 border-dashed border-gray-600 group-hover:${theme.border} flex items-center justify-center transition-colors`}>
                  <Plus size={20} className={`text-gray-500 group-hover:${theme.text} transition-colors`} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:${theme.text} transition-colors`}>Add Artifact</span>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
