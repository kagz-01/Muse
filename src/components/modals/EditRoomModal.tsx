import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Trash2, ImagePlus, AlertTriangle } from 'lucide-react';
import { useRoomsStore, type Room, type RoomTheme } from '../../store/useRoomsStore';

interface Props {
  room: Room;
  onClose: () => void;
  onDeleted?: () => void;
}

const paletteColors: { name: RoomTheme; hex: string; label: string }[] = [
  { name: 'indigo', hex: '#6366f1', label: 'Indigo' },
  { name: 'emerald', hex: '#10b981', label: 'Emerald' },
  { name: 'rose', hex: '#f43f5e', label: 'Rose' },
  { name: 'amber', hex: '#f59e0b', label: 'Amber' },
  { name: 'cyan', hex: '#06b6d4', label: 'Cyan' },
  { name: 'slate', hex: '#64748b', label: 'Slate' },
];

export default function EditRoomModal({ room, onClose, onDeleted }: Props) {
  const updateRoom = useRoomsStore(state => state.updateRoom);
  const deleteRoom = useRoomsStore(state => state.deleteRoom);

  const [name, setName] = useState(room.name);
  const [description, setDescription] = useState(room.description);
  const [themeColor, setThemeColor] = useState<RoomTheme>(room.themeColor);
  const [coverPreview, setCoverPreview] = useState(room.coverImage);
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

  const selectedPalette = paletteColors.find(c => c.name === themeColor)!;

  const handleSave = () => {
    if (!name.trim()) { setError('Room name cannot be empty.'); return; }
    updateRoom(room.id, { name: name.trim(), description: description.trim(), themeColor, coverImage: coverPreview });
    onClose();
  };

  const handleDelete = () => {
    deleteRoom(room.id);
    onDeleted?.();
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
              <h2 className="text-2xl font-bold tracking-tight text-white">Edit Room</h2>
              <p className="text-sm text-gray-400 mt-1 font-serif italic truncate max-w-[260px]">{room.name}</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
              <X size={18} />
            </button>
          </div>

          {/* Cover Image Picker */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Cover Image</label>
            <div onClick={() => fileRef.current?.click()} className="relative w-full h-36 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/25 transition-all cursor-pointer overflow-hidden group">
              {coverPreview ? (
                <img src={coverPreview} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 group-hover:text-gray-300 transition-colors">
                  <ImagePlus size={24} />
                  <span className="text-xs font-bold uppercase tracking-widest">Upload Cover Photo</span>
                </div>
              )}
              {coverPreview && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">Change Image</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
          </div>

          {/* Name */}
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Room Name *</label>
            <input
              value={name} onChange={e => { setName(e.target.value); setError(''); }}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-base font-medium tracking-tight"
            />
            {error && <p className="text-rose-400 text-xs mt-2 font-medium">{error}</p>}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Description</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-sm font-serif italic leading-relaxed resize-none"
            />
          </div>

          {/* Theme */}
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

          {/* Save Button */}
          <button onClick={handleSave}
            className="w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95 mb-4"
            style={{ backgroundColor: selectedPalette.hex, boxShadow: `0 0 30px ${selectedPalette.hex}55` }}
          >
            Save Changes <Check size={16} />
          </button>

          {/* Delete Zone */}
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} className="w-full py-3 rounded-2xl border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-widest hover:bg-rose-500/10 transition-all cursor-pointer flex items-center justify-center gap-2">
              <Trash2 size={14} /> Delete Room
            </button>
          ) : (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-rose-400 text-sm font-bold mb-3">
                <AlertTriangle size={16} /> This action cannot be undone.
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleDelete} className="flex-[2] py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-rose-600 transition-all cursor-pointer">
                  Yes, Delete Room
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
