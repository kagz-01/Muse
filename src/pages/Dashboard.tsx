import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Sparkles, ArrowRight, Network, Lock, Globe, Plus } from 'lucide-react';
import { useRoomsStore, type RoomTheme } from '../store/useRoomsStore';
import CreateRoomModal from '../components/modals/CreateRoomModal';

const themeGradients: Record<RoomTheme, string> = {
  indigo: 'from-indigo-600/30',
  emerald: 'from-emerald-600/30',
  amber: 'from-amber-600/30',
  rose: 'from-rose-600/30',
  cyan: 'from-cyan-600/30',
  slate: 'from-slate-600/30',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const rooms = useRoomsStore(state => state.rooms);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}
      <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24 md:pb-10 min-h-full">
      
      {/* Dynamic Top Realm: Contemplation Feed */}
      <section className="mb-16">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Contemplation</h2>
            <p className="text-gray-400">Your latest patterns and insights.</p>
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Mirror Sneak Peek widget */}
          <div 
            onClick={() => navigate('/mirror')}
            className="group relative overflow-hidden bg-linear-to-br from-[#1c1c1c] to-[#0a0a0a] rounded-3xl p-8 border border-white/5 shadow-lg cursor-pointer hover:border-canvas-primary/30 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-canvas-primary/10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <Sparkles size={20} className="text-canvas-primary" />
              <h3 className="font-semibold text-white/90 tracking-tight">Weekly Mirror</h3>
            </div>
            <p className="text-sm text-gray-400 mb-6 font-serif italic leading-relaxed relative z-10 pr-4">
              "You've been collecting a lot of ambient music lately..."
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-canvas-primary relative z-10 group-hover:translate-x-1 transition-transform">
              Reflect now <ArrowRight size={14} />
            </div>
          </div>

          {/* Meaningful Network Widget */}
          <div 
            onClick={() => navigate('/connections')}
            className="group bg-[#1c1c1c] rounded-3xl p-8 border border-white/5 shadow-lg cursor-pointer hover:border-[#00E5FF]/30 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#00E5FF]/10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="flex flex-col h-full relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <Network size={20} className="text-[#00E5FF]" />
                  <h3 className="font-bold text-white tracking-tight">Connections</h3>
                </div>
                <span className="bg-[#00E5FF]/10 text-[#00E5FF] text-[10px] uppercase tracking-widest px-2 py-1 rounded-md font-bold shadow-sm">1 Pending</span>
              </div>
              
              <p className="text-sm text-gray-400 mb-6 leading-relaxed font-serif italic pr-2">
                "You and <span className="text-white font-sans font-medium not-italic">David Chen</span> have had 8 thoughtful exchanges this week. Your strongest shared theme is <span className="text-white font-sans font-medium not-italic">Identity</span>."
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80" className="w-8 h-8 rounded-full border-[3px] border-[#1c1c1c] object-cover" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" className="w-8 h-8 rounded-full border-[3px] border-[#1c1c1c] object-cover" />
                </div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00E5FF] group-hover:translate-x-1 transition-transform">
                  Contribute <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Foundations: Cinematic Rooms Gallery */}
      <section>
        <header className="mb-8 flex items-end justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Your Rooms</h2>
            <p className="text-sm text-gray-500 mt-1">Highly personalized and expressive curation spaces.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/rooms')} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">View All</button>
            <button onClick={() => setShowCreate(true)} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer">
              <Plus size={16} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rooms.map((room) => {
             const glowClass = themeGradients[room.themeColor] || themeGradients['indigo'];
             return (
               <div 
                 key={room.id}
                 onClick={() => navigate(`/rooms/${room.id}`)}
                 className="relative h-56 rounded-[2rem] overflow-hidden cursor-pointer group shadow-xl border border-white/5 hover:border-white/20 transition-all transform hover:-translate-y-1"
               >
                 <img src={room.coverImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                 
                 {/* Double Gradient System for readability and premium thematic tint */}
                 <div className={`absolute inset-0 bg-linear-to-t ${glowClass} via-[#0a0a0a]/60 to-[#0a0a0a] opacity-60 group-hover:opacity-80 transition-opacity duration-500`}></div>
                 <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent opacity-90"></div>
                 
                 <div className="absolute inset-0 p-6 flex flex-col justify-between">
                   <div className="flex justify-end">
                      {room.isPublic ? (
                        <div className="bg-white/10 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold text-white shadow-sm border border-white/10 flex items-center gap-1.5">
                          <Globe size={12} /> Public
                        </div>
                      ) : (
                        <div className="bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold text-gray-300 shadow-sm border border-white/5 flex items-center gap-1.5">
                          <Lock size={12} /> Private
                        </div>
                      )}
                   </div>
                   
                   <div>
                     <h3 className="text-2xl font-bold tracking-tight text-white mb-2 drop-shadow-lg group-hover:text-white transition-colors">
                       {room.name}
                     </h3>
                     <span className="text-xs font-bold uppercase tracking-widest text-gray-300/80 drop-shadow-md">
                       {room.count} Artifacts
                     </span>
                   </div>
                 </div>
               </div>
             )
          })}
          
          <div
            onClick={() => setShowCreate(true)}
            className="relative h-56 bg-[#1c1c1c] border-2 border-dashed border-white/10 rounded-[2rem] hover:border-canvas-primary/30 hover:bg-white/[0.02] transition-colors cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-white group">
            <div className="w-14 h-14 rounded-full border border-dashed border-gray-600 group-hover:border-canvas-primary flex items-center justify-center mb-4 text-2xl font-light transition-colors">
              +
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest group-hover:text-canvas-primary transition-colors">Create Expressive Room</span>
          </div>
        </div>
      </section>

      </div>
    </>
  );
}
