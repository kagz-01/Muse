import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { X, ArrowRight, Check, Image as ImageIcon, Globe, Lock } from 'lucide-react';
import { useRoomsStore, type RoomTheme } from '../../store/useRoomsStore';

interface Props { onClose: () => void; }

const paletteColors: { name: RoomTheme; hex: string; label: string }[] = [
  { name: 'indigo', hex: '#6366f1', label: 'Indigo' },
  { name: 'emerald', hex: '#10b981', label: 'Emerald' },
  { name: 'rose', hex: '#f43f5e', label: 'Rose' },
  { name: 'amber', hex: '#f59e0b', label: 'Amber' },
  { name: 'cyan', hex: '#06b6d4', label: 'Cyan' },
  { name: 'slate', hex: '#64748b', label: 'Slate' },
];

export default function CreateRoomModal({ onClose }: Props) {
  const navigate = useNavigate();
  const addRoom = useRoomsStore(state => state.addRoom);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState<RoomTheme>('indigo');
  const [coverImage, setCoverImage] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState('');

  const nameRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);
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
      reader.onloadend = () => setCoverImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const selectedPalette = paletteColors.find(c => c.name === themeColor)!;

  const handleCreate = () => {
    if (!name.trim()) { setError('Give your room a name.'); return; }
    
    try {
      const newRoom = addRoom(name.trim(), description.trim(), themeColor, coverImage, isPublic);
      onClose();
      // Navigate directly into the new room so user can see it immediately
      navigate(`/rooms/${newRoom.id}`);
    } catch (err) {
      setError('Failed to establish room identity.');
    }
  };

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#111318] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500" style={{ backgroundColor: selectedPalette.hex }} />

        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Create a Room</h2>
              <p className="text-sm text-gray-400 mt-1 font-serif italic">Define your expressive collection space.</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
              <X size={18} />
            </button>
          </div>

          {/* Cover Image Picker */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Cover Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative w-full h-36 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/25 transition-all cursor-pointer overflow-hidden group"
            >
              {coverImage ? (
                <img src={coverImage} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 group-hover:text-gray-300 transition-colors">
                  <ImageIcon size={24} />
                  <span className="text-xs font-bold uppercase tracking-widest">Upload Cover Photo</span>
                </div>
              )}
              {coverImage && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">Change Image</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
          </div>

          {/* Room Name */}
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Room Name *</label>
            <input
              ref={nameRef}
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
              placeholder="e.g. Music & Ambience"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-base font-medium tracking-tight"
            />
            {error && <p className="text-rose-400 text-xs mt-2 font-medium">{error}</p>}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Description</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="What does this room hold? What energy does it carry?"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-sm font-serif italic leading-relaxed resize-none"
            />
          </div>

          {/* Theme Palette */}
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Room Theme</label>
            <div className="flex gap-3 flex-wrap">
              {paletteColors.map(color => (
                <button key={color.name} onClick={() => setThemeColor(color.name)} title={color.label}
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer ${themeColor === color.name ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111318] scale-110' : ''}`}
                  style={{ backgroundColor: color.hex }}
                >
                  {themeColor === color.name && <Check size={16} strokeWidth={3} className="text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>
          {/* Visibility Toggle */}
          <div className="mb-8 p-1 bg-white/5 rounded-3xl flex gap-2">
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
              className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${isPublic ? 'bg-canvas-primary/20 text-canvas-primary shadow-xl shadow-canvas-primary/5' : 'text-gray-500 hover:text-gray-300'}`}
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
              className="flex-[2] py-4 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95"
              style={{ backgroundColor: selectedPalette.hex, boxShadow: `0 0 30px ${selectedPalette.hex}55` }}
            >
              Create Room <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
