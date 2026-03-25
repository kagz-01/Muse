import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Trash2, ImagePlus, AlertTriangle, Globe, Lock } from 'lucide-react';
import { useThreadsStore, type Thread, type ThreadMood } from '../../store/useThreadsStore';

interface Props { thread: Thread; onClose: () => void; onDeleted?: () => void; }

const moods: { name: ThreadMood; label: string; color: string }[] = [
  { name: 'contemplative', label: 'Contemplative', color: '#8b5cf6' },
  { name: 'curious', label: 'Curious', color: '#06b6d4' },
  { name: 'dark', label: 'Dark', color: '#475569' },
  { name: 'hopeful', label: 'Hopeful', color: '#10b981' },
  { name: 'urgent', label: 'Urgent', color: '#f43f5e' },
  { name: 'serene', label: 'Serene', color: '#f59e0b' },
];

export default function EditThreadModal({ thread, onClose, onDeleted }: Props) {
  const updateThread = useThreadsStore(state => state.updateThread);
  const deleteThread = useThreadsStore(state => state.deleteThread);

  const [title, setTitle] = useState(thread.title);
  const [description, setDescription] = useState(thread.description);
  const [thesis, setThesis] = useState(thread.thesis);
  const [mood, setMood] = useState<ThreadMood>(thread.mood);
  const [coverPreview, setCoverPreview] = useState(thread.coverImage);
  const [isPublic, setIsPublic] = useState(thread.isPublic);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const selectedMood = moods.find(m => m.name === mood)!;

  const handleSave = () => {
    if (!title.trim()) { setError('Title cannot be empty.'); return; }
    updateThread(thread.id, { title: title.trim(), description: description.trim(), thesis: thesis.trim(), mood, coverImage: coverPreview, isPublic });
    onClose();
  };

  const handleDelete = () => { deleteThread(thread.id); onDeleted?.(); };

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#111318] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: selectedMood.color }} />

        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Edit Thread</h2>
              <p className="text-sm text-gray-400 mt-1 font-serif italic truncate max-w-[260px]">{thread.title}</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"><X size={18} /></button>
          </div>

          {/* Cover */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Cover Image</label>
            <div onClick={() => fileRef.current?.click()} className="relative w-full h-32 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/25 transition-all cursor-pointer overflow-hidden group">
              {coverPreview ? <img src={coverPreview} className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500"><ImagePlus size={22} /><span className="text-xs font-bold uppercase tracking-widest">Upload Cover</span></div>}
              {coverPreview && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-white text-xs font-bold uppercase tracking-widest">Change</span></div>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Title *</label>
            <input value={title} onChange={e => { setTitle(e.target.value); setError(''); }} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-white/30 transition-all text-base font-medium" />
            {error && <p className="text-rose-400 text-xs mt-2 font-medium">{error}</p>}
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Core Thesis</label>
            <textarea value={thesis} onChange={e => setThesis(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-white/30 transition-all text-sm font-serif italic leading-relaxed resize-none" />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-white/30 transition-all text-sm leading-relaxed resize-none" />
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Mood</label>
            <div className="flex gap-3 flex-wrap">
              {moods.map(m => (
                <button key={m.name} onClick={() => setMood(m.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${mood === m.name ? 'border-white/30 text-white' : 'border-white/10 text-gray-400 hover:border-white/20'}`}
                  style={mood === m.name ? { backgroundColor: m.color + '33', borderColor: m.color + '80' } : {}}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="mb-8 p-1 bg-white/5 rounded-2xl flex gap-2">
            <button 
              onClick={() => setIsPublic(false)}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${!isPublic ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Lock size={14} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Private Vault</span>
            </button>
            <button 
              onClick={() => setIsPublic(true)}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${isPublic ? 'bg-canvas-primary/20 text-canvas-primary shadow-lg shadow-canvas-primary/5' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Globe size={14} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Community Hub</span>
            </button>
          </div>

          <button onClick={handleSave} className="w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95 text-white mb-4"
            style={{ backgroundColor: selectedMood.color, boxShadow: `0 0 30px ${selectedMood.color}55` }}>
            Save Changes <Check size={16} />
          </button>

          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} className="w-full py-3 rounded-2xl border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-widest hover:bg-rose-500/10 transition-all cursor-pointer flex items-center justify-center gap-2">
              <Trash2 size={14} /> Delete Thread
            </button>
          ) : (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-rose-400 text-sm font-bold mb-3"><AlertTriangle size={16} /> This cannot be undone.</div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all cursor-pointer">Cancel</button>
                <button onClick={handleDelete} className="flex-[2] py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-rose-600 transition-all cursor-pointer">Yes, Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
