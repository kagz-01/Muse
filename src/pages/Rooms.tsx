import { useState } from 'react';
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
        </header>

        <div className="flex gap-8 overflow-x-auto pb-16 pt-8 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 -mx-4">
          {rooms.map((room) => {
            const glowClass = themeGradients[room.themeColor] || themeGradients['indigo'];
            return (
              <div
                key={room.id}
                onClick={() => navigate(`/rooms/${room.id}`)}
                className="relative h-[40vh] min-h-[260px] max-h-[360px] w-[75vw] sm:w-[320px] md:w-[360px] shrink-0 snap-center rounded-[2rem] overflow-hidden cursor-pointer group shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] border border-white/5 hover:border-white/20 transition-all duration-500 transform hover:-translate-y-2"
              >
                {room.coverImage ? (
                  <img src={room.coverImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out brightness-90 group-hover:brightness-100" />
                ) : (
                  <div className="absolute inset-0 bg-[#121212]" />
                )}

                <div className={`absolute inset-0 bg-linear-to-t ${glowClass} via-[#050505]/70 to-[#050505]/20 opacity-70 group-hover:opacity-90 transition-opacity duration-700`} />
                <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-[#050505]/50 to-transparent" />

                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div />
                    {room.isPublic ? (
                      <div className="bg-white/10 backdrop-blur-xl px-2.5 py-1.5 rounded-lg text-[10px] uppercase tracking-[0.2em] font-bold text-white border border-white/10 flex items-center gap-1.5 shadow-sm">
                        <Globe size={11} /> Public
                      </div>
                    ) : (
                      <div className="bg-black/50 backdrop-blur-xl px-2.5 py-1.5 rounded-lg text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 border border-white/5 flex items-center gap-1.5 shadow-sm">
                        <Lock size={11} /> Private
                      </div>
                    )}
                  </div>

                  <div className="transform transition-transform duration-500 group-hover:translate-y-[-4px]">
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2 drop-shadow-xl">{room.name}</h3>
                    {room.description && (
                      <p className="text-gray-300 text-xs font-serif italic max-w-sm leading-relaxed opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-500 delay-75">{room.description}</p>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a8a29e] mt-3 block drop-shadow-md">
                      {room.count} Artifacts
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <div
            onClick={() => setShowCreate(true)}
            className="relative h-[40vh] min-h-[260px] max-h-[360px] w-[75vw] sm:w-[320px] md:w-[360px] shrink-0 snap-center bg-[#121212] border-2 border-dashed border-white/10 rounded-[2rem] hover:border-canvas-primary/30 hover:bg-white/[0.02] transition-colors duration-500 cursor-pointer flex flex-col items-center justify-center group"
          >
            <div className="w-14 h-14 rounded-full border border-dashed border-gray-600 group-hover:border-canvas-primary group-hover:scale-110 flex items-center justify-center mb-4 transition-all duration-500">
              <Plus size={24} className="text-gray-600 group-hover:text-canvas-primary transition-colors" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-canvas-primary transition-colors">Create Expressive Room</span>
          </div>
        </div>
      </div>
    </>
  );
}
