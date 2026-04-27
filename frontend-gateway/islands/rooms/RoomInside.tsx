import { useState, useRef, useMemo } from "preact/hooks";
import { 
  ArrowLeft, Globe, Lock, Palette, Check, Camera,
  Edit2, Share2, Plus, ExternalLink, Trash2, X 
} from "lucide-preact";
import { type RoomTheme, roomsSignal, updateRoomTheme, updateRoomCover, toggleRoomPrivacy } from "../../signals/rooms.ts";
import { itemsSignal, addItem, deleteItem } from "../../signals/items.ts";
import EditRoomModal from "../modals/EditRoomModal.tsx";

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

export default function RoomInside({ roomId }: { roomId: string }) {
  const room = roomsSignal.value.find(r => r.id === roomId);
  const allItems = itemsSignal.value;
  const items = useMemo(() => allItems.filter(i => i.roomId === roomId), [allItems, roomId]);
  const latestItems = useMemo(() => items.slice(0, 3), [items]);

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
      <a href="/rooms" className="text-gray-400 hover:text-white text-sm underline">
        Back to Rooms
      </a>
    </div>
  );

  const theme = themeMapping[room.themeColor] || themeMapping['indigo'];

  const handleImageUpload = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
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
    addItem({ roomId: room.id, title: newTitle.trim(), sourceUrl, note: newNote.trim() || undefined, isPublic: false });
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
          onDeleted={() => globalThis.location.href = '/rooms'}
        />
      )}

      <div className="pb-24 md:pb-10 min-h-screen bg-[#0a0a0a] relative">
        <div className={`fixed inset-0 pointer-events-none ${theme.bg} blur-3xl opacity-20 transition-colors duration-1000`} />

        <header className="relative w-full h-[52vh] min-h-[400px] overflow-hidden group">
          {room.coverImage ? (
            <img src={room.coverImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" alt="" />
          ) : (
            <div className={`absolute inset-0 ${theme.bg}`} />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

          <button
            onClick={() => fileInputRef.current?.click()}
            type="button"
            className="absolute top-5 right-5 z-20 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl cursor-pointer opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
          >
            <Camera size={18} />
          </button>

          <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10 max-w-7xl mx-auto w-full z-10">
            <div className="flex justify-between items-center">
              <a href="/rooms" className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all shadow-lg">
                <ArrowLeft size={18} />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleRoomPrivacy(room.id)}
                  type="button"
                  className={`px-3.5 py-2 rounded-full backdrop-blur-md border shadow-lg flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer ${room.isPublic ? 'bg-white/10 border-white/20 text-white' : 'bg-black/50 border-black/40 text-gray-400'}`}
                >
                  {room.isPublic ? <><Globe size={12} className={theme.text} /> Public</> : <><Lock size={12} /> Private</>}
                </button>
              </div>
            </div>

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
                  <div className="relative">
                    <button onClick={() => setIsPaletteOpen(!isPaletteOpen)} type="button" className={`w-11 h-11 rounded-full backdrop-blur-lg border border-white/10 flex items-center justify-center transition-all shadow-xl cursor-pointer ${isPaletteOpen ? 'bg-white/20' : 'bg-black/50 hover:bg-white/10'}`}>
                      <Palette size={18} className={theme.text} />
                    </button>
                    {isPaletteOpen && (
                      <div className="absolute bottom-full right-0 mb-3 bg-[#151515] border border-white/10 rounded-2xl p-3 shadow-2xl flex gap-2 z-[20]">
                        {paletteColors.map(c => (
                          <button key={c.name} type="button" onClick={() => { updateRoomTheme(room.id, c.name); setIsPaletteOpen(false); }}
                            style={{ backgroundColor: c.hex }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 cursor-pointer ${room.themeColor === c.name ? 'ring-2 ring-white ring-offset-2 ring-offset-[#151515]' : ''}`}
                          >
                            {room.themeColor === c.name && <Check size={13} strokeWidth={3} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button onClick={() => setIsEditOpen(true)} type="button" className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-lg border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all shadow-xl cursor-pointer">
                    <Edit2 size={17} />
                  </button>

                  <button type="button" className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-full shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer">
                    <Share2 size={15} /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-10 max-w-7xl mx-auto relative z-10 -mt-4">
          <section className="mb-8 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-6 md:p-7 backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white">Collect</span>
                <span>Room detail</span>
              </div>
              <h2 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight text-white">{room.name}</h2>
              <p className="mt-3 max-w-3xl text-gray-400 font-serif italic leading-relaxed">
                {room.description || "This room is where consumed content gets collected, refined, and held until it is ready to become a pattern."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-[2rem] border border-white/5 bg-black/25 p-4 md:p-5 backdrop-blur-sm">
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Artifacts</div>
                <div className="mt-2 text-2xl font-bold text-white">{items.length}</div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Access</div>
                <div className="mt-2 text-2xl font-bold text-white">{room.isPublic ? "Pub" : "Vault"}</div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Theme</div>
                <div className={`mt-2 text-2xl font-bold ${theme.text}`}>{room.themeColor}</div>
              </div>
            </div>
          </section>

          <div className="mb-12 relative">
             <div className={`absolute -inset-4 ${theme.bg} blur-2xl opacity-20 rounded-4xl pointer-events-none`} />
             <div className="relative p-8 md:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                   <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Room Signal</h2>
                   <div className="w-8 h-px bg-gradient-to-l from-transparent via-white/20 to-transparent" />
                </div>
                <p className="text-xl md:text-2xl font-serif italic text-gray-300 leading-relaxed max-w-3xl">
                   {room.description || "This space is currently waiting for your intellectual blueprint. What themes will you collect here before they become something larger?"}
                </p>
                {latestItems.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {latestItems.map((item) => (
                      <a
                        key={item.id}
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${theme.bg} ${theme.text} border-white/10 hover:border-white/20`}
                      >
                        {item.title}
                      </a>
                    ))}
                  </div>
                )}
             </div>
          </div>

          <div className="flex items-center justify-between mb-8">
            <span className={`inline-block px-4 py-1.5 rounded-full bg-[#1c1c1c] border border-white/5 text-sm font-bold uppercase tracking-widest ${theme.text}`}>
              {items.length} {items.length === 1 ? 'Artifact' : 'Artifacts'}
            </span>
            <button
              onClick={() => setShowAddItem(true)}
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold uppercase tracking-widest transition-all cursor-pointer active:scale-95"
            >
              <Plus size={16} /> Collect Artifact
            </button>
          </div>

          {showAddItem && (
            <div className="mb-8 bg-[#111318] border border-white/10 rounded-3xl p-6 relative animate-in slide-in-from-top-4 duration-300">
              <div className={`absolute -top-10 -right-10 w-32 h-32 ${theme.bg} blur-3xl opacity-30 pointer-events-none`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-white tracking-tight">Add to Room</h3>
                  <button onClick={() => { setShowAddItem(false); setAddError(''); }} type="button" className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer">
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Title *</label>
                    <input value={newTitle} onInput={e => { setNewTitle((e.target as HTMLInputElement).value); setAddError(''); }}
                      placeholder="Article title, song name…"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-white/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">URL / Link *</label>
                    <input value={newUrl} onInput={e => { setNewUrl((e.target as HTMLInputElement).value); setAddError(''); }}
                      placeholder="https://…"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-white/30 transition-all"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Your Note</label>
                  <textarea value={newNote} onInput={e => setNewNote((e.target as HTMLTextAreaElement).value)}
                    placeholder="Why does this matter to you?"
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm font-serif italic focus:outline-none focus:border-white/30 transition-all resize-none"
                  />
                </div>
                {addError && <p className="text-rose-400 text-xs mb-3 font-medium">{addError}</p>}
                <button onClick={handleAddItem}
                  type="button"
                  className="px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm text-black transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95"
                  style={{ backgroundColor: paletteColors.find(c => c.name === room.themeColor)?.hex || '#6366f1' }}
                >
                  Save to Room
                </button>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-[#111318]/50 backdrop-blur-md rounded-3xl border border-white/5">
              <div className={`w-20 h-20 ${theme.bg} rounded-3xl mb-6 flex items-center justify-center shadow-2xl`}>
                <Plus size={28} className={theme.text} />
              </div>
              <p className="text-white text-xl font-bold tracking-tight mb-2">This space is expectant.</p>
              <p className="text-gray-400 font-serif italic text-sm mb-6 max-w-lg text-center">Your artifacts will appear here as clusters of intelligence. Begin the collection phase.</p>
              <button onClick={() => setShowAddItem(true)}
                type="button"
                className="px-10 py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[12px] text-black cursor-pointer hover:-translate-y-1 active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_20px_50px_rgba(255,255,255,0.2)]"
                style={{ backgroundColor: paletteColors.find(c => c.name === room.themeColor)?.hex || '#6366f1' }}
              >
                Collect First Artifact
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {items.map(item => (
                <div key={item.id}
                  className={`bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden group transition-all duration-500 card-glow glow-${room.themeColor}`}
                >
                  <div className={`h-40 ${theme.bg} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-white/5 opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                       <ExternalLink size={40} className={theme.text} />
                    </div>
                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-gray-300 hover:text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>

                  <div className="p-7">
                    <div className="flex flex-col gap-1 mb-4">
                      <span className={`text-[8px] font-bold uppercase tracking-[0.2em] ${theme.text}`}>Artifact</span>
                      <h4 className="font-bold text-lg leading-tight text-white/90 group-hover:text-white transition-colors line-clamp-2">{item.title}</h4>
                    </div>
                    
                    {item.note && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-6 font-serif italic border-l-2 border-white/10 pl-4 py-1 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">"{item.note}"</p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/5">
                      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                        className={`text-[9px] uppercase font-bold tracking-[0.15em] truncate max-w-[70%] text-gray-500 hover:${theme.text} transition-colors`}
                      >
                        {getHostname(item.sourceUrl)}
                      </a>
                      <button
                        onClick={() => deleteItem(item.id)}
                        type="button"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div
                onClick={() => setShowAddItem(true)}
                className={`h-full min-h-[280px] border-2 border-dashed border-white/5 rounded-[2.5rem] hover:border-white/20 hover:bg-white/[0.02] transition-all duration-500 cursor-pointer flex flex-col items-center justify-center gap-4 group card-glow glow-${room.themeColor}`}
              >
                <div className={`w-14 h-14 rounded-full border-2 border-dashed border-gray-700 group-hover:${theme.border} flex items-center justify-center transition-all duration-500`}>
                  <Plus size={24} className={`text-gray-600 group-hover:${theme.text} transition-colors`} />
                </div>
                <div className="flex flex-col items-center gap-1">
                   <span className={`text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:${theme.text} transition-colors`}>Collect Artifact</span>
                   <span className="text-[9px] text-gray-700 font-serif italic">Expand your clusters</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}
