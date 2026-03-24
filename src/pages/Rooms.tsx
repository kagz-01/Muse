import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Globe, Lock, Plus } from 'lucide-react';
import { useRoomsStore, type RoomTheme } from '../store/useRoomsStore';
import CreateRoomModal from '../components/modals/CreateRoomModal';

const themeGradients: Record<RoomTheme, string> = {
  indigo: 'from-indigo-600/40',
  emerald: 'from-emerald-600/40',
  amber: 'from-amber-600/40',
  rose: 'from-rose-600/40',
  cyan: 'from-cyan-600/40',
  slate: 'from-slate-600/40',
};

export default function Rooms() {
  const navigate = useNavigate();
  const rooms = useRoomsStore(state => state.rooms);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}

      <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24 md:pb-10">
        
        <header className="mb-10 flex items-end justify-between border-b border-white/5 pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Your Rooms</h1>
            <p className="text-gray-400 font-serif italic">Expressive, personal curation spaces for everything you collect.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer active:scale-95"
          >
            <Plus size={16} />
            New Room
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const glowClass = themeGradients[room.themeColor] || themeGradients['indigo'];
            return (
              <div
                key={room.id}
                onClick={() => navigate(`/rooms/${room.id}`)}
                className="relative h-64 rounded-[2rem] overflow-hidden cursor-pointer group shadow-xl border border-white/5 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1"
              >
                {room.coverImage ? (
                  <img src={room.coverImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="absolute inset-0 bg-[#1c1c1c]" />
                )}
                
                <div className={`absolute inset-0 bg-linear-to-t ${glowClass} via-[#0a0a0a]/60 to-[#0a0a0a] opacity-70 group-hover:opacity-90 transition-opacity duration-500`} />
                <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />

                <div className="absolute inset-0 p-7 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div />
                    {room.isPublic ? (
                      <div className="bg-white/10 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold text-white border border-white/10 flex items-center gap-1.5">
                        <Globe size={11} /> Public
                      </div>
                    ) : (
                      <div className="bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold text-gray-400 border border-white/5 flex items-center gap-1.5">
                        <Lock size={11} /> Private
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-white mb-2 drop-shadow-lg">{room.name}</h3>
                    {room.description && (
                      <p className="text-gray-300 text-sm font-serif italic line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">{room.description}</p>
                    )}
                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-2 block drop-shadow-md">
                      {room.count} Artifacts
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Create New Room Card */}
          <div
            onClick={() => setShowCreate(true)}
            className="relative h-64 bg-transparent border-2 border-dashed border-white/10 rounded-[2rem] hover:border-white/25 hover:bg-white/[0.02] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center group"
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 group-hover:border-white flex items-center justify-center mb-4 transition-colors duration-300">
              <Plus size={24} className="text-gray-500 group-hover:text-white transition-colors" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">Create Expressive Room</span>
          </div>
        </div>
      </div>
    </>
  );
}
