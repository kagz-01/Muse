import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useRoomsStore, type RoomTheme } from '../store/useRoomsStore';
import { useItemsStore } from '../store/useItemsStore';
import { ArrowLeft, Share, MoreVertical, Globe, Lock, Palette, Check, Camera } from 'lucide-react';

const themeMapping: Record<RoomTheme, { borderHover: string, shadowHover: string, text: string, bg: string, ring: string, toggle: string }> = {
  indigo: { borderHover: 'hover:border-indigo-500/50', shadowHover: 'hover:shadow-indigo-500/20', text: 'text-indigo-400', bg: 'bg-indigo-500/10', ring: 'ring-indigo-500', toggle: 'bg-indigo-500' },
  emerald: { borderHover: 'hover:border-emerald-500/50', shadowHover: 'hover:shadow-emerald-500/20', text: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500', toggle: 'bg-emerald-500' },
  rose: { borderHover: 'hover:border-rose-500/50', shadowHover: 'hover:shadow-rose-500/20', text: 'text-rose-400', bg: 'bg-rose-500/10', ring: 'ring-rose-500', toggle: 'bg-rose-500' },
  amber: { borderHover: 'hover:border-amber-500/50', shadowHover: 'hover:shadow-amber-500/20', text: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-500', toggle: 'bg-amber-500' },
  cyan: { borderHover: 'hover:border-cyan-500/50', shadowHover: 'hover:shadow-cyan-500/20', text: 'text-cyan-400', bg: 'bg-cyan-500/10', ring: 'ring-cyan-500', toggle: 'bg-cyan-500' },
  slate: { borderHover: 'hover:border-slate-500/50', shadowHover: 'hover:shadow-slate-500/20', text: 'text-slate-400', bg: 'bg-slate-500/10', ring: 'ring-slate-500', toggle: 'bg-slate-500' }
};

const paletteColors: { name: RoomTheme, hex: string }[] = [
  { name: 'indigo', hex: '#6366f1' },
  { name: 'emerald', hex: '#10b981' },
  { name: 'rose', hex: '#f43f5e' },
  { name: 'amber', hex: '#f59e0b' },
  { name: 'cyan', hex: '#06b6d4' },
  { name: 'slate', hex: '#64748b' }
];

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const room = useRoomsStore(state => state.rooms.find(r => r.id === id));
  const updateRoomTheme = useRoomsStore(state => state.updateRoomTheme);
  const updateRoomCover = useRoomsStore(state => state.updateRoomCover);
  const toggleRoomPrivacy = useRoomsStore(state => state.toggleRoomPrivacy);
  
  const items = useItemsStore(state => state.items.filter(i => i.roomId === id));

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateRoomCover(room!.id, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!room) return <div className="p-10 text-white flex justify-center py-40 font-bold tracking-widest uppercase">Room Anomaly Detected</div>;

  const activeTheme = themeMapping[room.themeColor] || themeMapping['indigo'];

  return (
    <div className="pb-24 md:pb-10 min-h-screen transition-colors duration-700 bg-canvas-bg-dark font-sans relative">
      
      {/* Ambient Floor Glow based on Theme */}
      <div className={`fixed inset-0 pointer-events-none transition-colors duration-1000 ${activeTheme.bg} blur-3xl opacity-30`}></div>

      {/* Hero Header: Cinematic Cover Experience */}
      <header className="relative w-full h-[55vh] min-h-[450px] overflow-hidden group">
        {room.coverImage ? (
          <img src={room.coverImage} className="absolute inset-0 w-full h-full object-cover animate-in fade-in zoom-in-95 duration-1000" />
        ) : (
          <div className="absolute inset-0 bg-[#1c1c1c]"></div>
        )}
        
        {/* Gradients to ensure text readability */}
        <div className="absolute inset-0 bg-linear-to-t from-canvas-bg-dark via-canvas-bg-dark/60 to-transparent"></div>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-0"></div>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />

        {/* Upload Overlay Button placed beautifully on the Hero Image */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl active:scale-95 cursor-pointer opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
        >
          <Camera size={20} className="text-gray-300 drop-shadow-md" />
        </button>

        <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10 max-w-7xl mx-auto w-full z-10">
          
          {/* Top Actions */}
          <div className="flex justify-between items-center">
             <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors shadow-lg active:scale-95 cursor-pointer">
               <ArrowLeft size={18} />
             </button>
             
             <button 
               onClick={() => toggleRoomPrivacy(room.id)} 
               className={`px-4 py-2.5 rounded-full backdrop-blur-md border shadow-lg flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer active:scale-95 ${room.isPublic ? 'bg-white/10 border-white/20 text-white' : 'bg-black/50 border-black/50 text-gray-400'}`}
             >
               {room.isPublic ? <><Globe size={14} className={activeTheme.text} /> Public</> : <><Lock size={14} /> Private</>}
             </button>
          </div>

          {/* Bottom Title & Control Deck (Glassy See-Through Container) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl relative w-full overflow-hidden">
            {/* Soft inner glow matching the theme */}
            <div className={`absolute inset-0 ${activeTheme.bg} blur-2xl opacity-40 mix-blend-overlay pointer-events-none`}></div>
            
            <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-xl">{room.name}</h1>
                <p className="text-gray-300 font-serif italic text-lg max-w-2xl drop-shadow-md leading-relaxed">{room.description}</p>
              </div>
              
              {/* Personalization Controls */}
              <div className="flex items-center gap-4 shrink-0">
                 
                 {/* Color Palette Picker */}
                 <div className="relative group">
                   <button 
                     onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                     className={`w-14 h-14 rounded-full backdrop-blur-lg border border-white/10 flex items-center justify-center text-white transition-all shadow-xl cursor-pointer ${isPaletteOpen ? 'bg-white/20' : 'bg-black/50 hover:bg-white/10'}`}
                   >
                     <Palette size={22} className={activeTheme.text} />
                   </button>
                   
                   {isPaletteOpen && (
                     <div className="absolute bottom-full right-0 mb-4 bg-[#151515] border border-white/10 rounded-2xl p-3 shadow-2xl flex gap-2 animate-in fade-in slide-in-from-bottom-2">
                        {paletteColors.map(color => (
                          <button 
                            key={color.name}
                            onClick={() => { updateRoomTheme(room.id, color.name); setIsPaletteOpen(false); }}
                            style={{ backgroundColor: color.hex }}
                            className={`w-8 h-8 rounded-full shadow-inner flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 cursor-pointer ${room.themeColor === color.name ? 'ring-2 ring-white ring-offset-2 ring-offset-[#151515]' : ''}`}
                          >
                            {room.themeColor === color.name && <Check size={14} strokeWidth={3} />}
                          </button>
                        ))}
                     </div>
                   )}
                 </div>

                 <button className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer active:scale-95">
                   <Share size={18} /> Share
                 </button>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-6 md:p-10 max-w-7xl mx-auto relative z-10 -mt-8">
        
        {/* Count Pill */}
        <div className="mb-8">
          <span className={`inline-block px-4 py-1.5 rounded-full bg-[#1c1c1c] border border-white/5 text-sm font-bold uppercase tracking-widest ${activeTheme.text} shadow-lg`}>
            {items.length} Curated Artifacts
          </span>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-[#1c1c1c]/50 backdrop-blur-md rounded-[2rem] border border-white/5 shadow-inner">
             <div className={`w-20 h-20 ${activeTheme.bg} rounded-3xl mb-6 shadow-inner flex items-center justify-center`}>
                <div className={`w-8 h-8 rounded-full ${activeTheme.toggle}`}></div>
             </div>
             <p className="text-white text-xl font-bold tracking-tight">This architecture is empty.</p>
             <p className="text-md text-gray-500 mt-2 font-serif italic">Share content to Muse to collect items here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(item => (
              <div 
                key={item.id} 
                className={`bg-[#1c1c1c] rounded-[2rem] border border-white/5 overflow-hidden group transition-all duration-300 cursor-pointer shadow-lg hover:-translate-y-1 ${activeTheme.borderHover} ${activeTheme.shadowHover}`}
              >
                 <div className="h-48 bg-[#151515] relative overflow-hidden">
                    {/* Abstract aesthetic pattern placeholder for items */}
                    <div className={`absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay group-hover:scale-110 transition-transform duration-700`}></div>
                    <div className="absolute inset-0 bg-linear-to-t from-[#1c1c1c] via-transparent to-transparent opacity-90"></div>
                 </div>
                 
                 <div className="p-6 relative">
                   <h4 className="font-bold text-lg leading-tight mb-3 line-clamp-2 text-white/90 group-hover:text-white transition-colors">{item.title}</h4>
                   {item.note && <p className="text-sm text-gray-400 line-clamp-3 mb-4 font-serif italic border-l-2 pl-3 border-white/10">"{item.note}"</p>}
                   
                   <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                     <p className={`text-[10px] uppercase font-bold tracking-widest truncate max-w-[70%] transition-colors ${activeTheme.text}`}>
                       {new URL(item.sourceUrl).hostname}
                     </p>
                     <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Active'}</p>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}
