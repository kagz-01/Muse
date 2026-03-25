import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { X, ArrowRight, Check, ImagePlus, Globe, Lock } from 'lucide-react';
import { useThreadsStore, type ThreadMood } from '../../store/useThreadsStore';

interface Props { onClose: () => void; }

const moods: { name: ThreadMood; label: string; description: string; color: string }[] = [
  { name: 'contemplative', label: 'Contemplative', description: 'Deep, slow, introspective', color: '#8b5cf6' },
  { name: 'curious', label: 'Curious', description: 'Questions, exploration, wonder', color: '#06b6d4' },
  { name: 'dark', label: 'Dark', description: 'Heavy, raw, unresolved', color: '#475569' },
  { name: 'hopeful', label: 'Hopeful', description: 'Optimistic, forward-looking', color: '#10b981' },
  { name: 'urgent', label: 'Urgent', description: 'Critical, immediate, pressing', color: '#f43f5e' },
  { name: 'serene', label: 'Serene', description: 'Calm, minimal, restful', color: '#f59e0b' },
];

export default function CreateThreadModal({ onClose }: Props) {
  const navigate = useNavigate();
  const addThread = useThreadsStore(state => state.addThread);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thesis, setThesis] = useState('');
  const [mood, setMood] = useState<ThreadMood>('contemplative');
  const [coverPreview, setCoverPreview] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState('');

  const titleRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);
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

  const handleCreate = () => {
    if (!title.trim()) { setError('Give your thread a title.'); return; }
    const thread = addThread({ 
      title: title.trim(), 
      description: description.trim(), 
      thesis: thesis.trim(), 
      mood, 
      coverImage: coverPreview, 
      isPublic 
    });
    onClose();
    navigate(`/threads/${thread.id}`);
  };

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#111318] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">

        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500" style={{ backgroundColor: selectedMood.color }} />

        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Start a Thread</h2>
              <p className="text-sm text-gray-400 mt-1 font-serif italic">Define the thematic idea you want to explore.</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
              <X size={18} />
            </button>
          </div>

          {/* Cover */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Cover Image</label>
            <div onClick={() => fileRef.current?.click()} className="relative w-full h-32 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/25 transition-all cursor-pointer overflow-hidden group">
              {coverPreview ? (
                <img src={coverPreview} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 group-hover:text-gray-300 transition-colors">
                  <ImagePlus size={22} />
                  <span className="text-xs font-bold uppercase tracking-widest">Upload Cover</span>
                </div>
              )}
              {coverPreview && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-white text-xs font-bold uppercase tracking-widest">Change Image</span></div>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
          </div>

          {/* Title */}
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Thread Title *</label>
            <input ref={titleRef} value={title} onChange={e => { setTitle(e.target.value); setError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
              placeholder="e.g. The Aesthetic of Restraint"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-base font-medium tracking-tight"
            />
            {error && <p className="text-rose-400 text-xs mt-2 font-medium">{error}</p>}
          </div>

          {/* Thesis */}
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Core Thesis</label>
            <textarea value={thesis} onChange={e => setThesis(e.target.value)}
              placeholder="What core question or idea does this thread explore?"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-sm font-serif italic leading-relaxed resize-none"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Brief Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="A short summary of what you're gathering here…"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-sm leading-relaxed resize-none"
            />
          </div>

          {/* Mood Selector */}
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Thread Mood</label>
            <div className="grid grid-cols-2 gap-2">
              {moods.map(m => (
                <button key={m.name} onClick={() => setMood(m.name)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all cursor-pointer text-left ${mood === m.name ? 'border-white/30 bg-white/10' : 'border-white/5 bg-white/[0.02] hover:border-white/15'}`}
                >
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                  <div>
                    <p className="text-white text-xs font-bold">{m.label}</p>
                    <p className="text-gray-500 text-[10px]">{m.description}</p>
                  </div>
                  {mood === m.name && <Check size={13} strokeWidth={3} className="text-white ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="mb-8 p-1 bg-white/5 rounded-2xl flex gap-2">
            <button 
              onClick={() => setIsPublic(false)}
              className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${!isPublic ? 'bg-white/10 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
              type="button"
            >
              <Lock size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Private Vault</span>
            </button>
            <button 
              onClick={() => setIsPublic(true)}
              className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${isPublic ? 'bg-canvas-accent/20 text-canvas-accent shadow-xl shadow-canvas-accent/5' : 'text-gray-500 hover:text-gray-300'}`}
              type="button"
            >
              <Globe size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Community Hub</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="flex-1 py-4 rounded-2xl border border-white/10 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
              Cancel
            </button>
            <button onClick={handleCreate}
              className="flex-[2] py-4 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95 text-white"
              style={{ backgroundColor: selectedMood.color, boxShadow: `0 0 30px ${selectedMood.color}55` }}
            >
              Start Thread <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
