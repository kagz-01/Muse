import React from 'react';
import { useNavigate } from 'react-router';
import { Sparkles, Layers, ArrowRight, Network } from 'lucide-react';
import { useRoomsStore } from '../store/useRoomsStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const rooms = useRoomsStore(state => state.rooms);

  return (
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
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-canvas-primary/10 blur-3xl rounded-full"></div>
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
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#00E5FF]/10 blur-3xl rounded-full"></div>
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

      {/* The Foundations "Down Below": Rigid Rooms */}
      <section>
        <header className="mb-8 flex items-end justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Your Rooms</h2>
            <p className="text-sm text-gray-500 mt-1">Grounded foundations for your collection.</p>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {rooms.map((room) => (
            <div 
              key={room.id}
              onClick={() => navigate(`/rooms/${room.id}`)}
              className="bg-[#151515] p-6 rounded-2xl hover:bg-[#1f1f1f] transition-colors duration-200 cursor-pointer border border-white/5 group relative shadow-md hover:shadow-lg hover:border-white/10"
            >
              <h3 className="text-lg font-semibold mb-2 tracking-tight truncate group-hover:text-canvas-primary transition-colors">{room.name}</h3>
              <p className="text-xs text-gray-500 font-medium">{room.count} items</p>
            </div>
          ))}
          
          <div className="bg-transparent border-2 border-dashed border-white/10 p-6 rounded-2xl hover:border-white/20 hover:bg-white/5 transition-colors cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-white min-h-[120px]">
            <span className="text-2xl font-light mb-1 active:scale-90 transition-transform">+</span>
            <span className="text-xs font-bold uppercase tracking-wider mt-1">New Room</span>
          </div>
        </div>
      </section>

    </div>
  );
}
