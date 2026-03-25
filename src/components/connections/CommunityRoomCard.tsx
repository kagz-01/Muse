import React from 'react';
import { Globe, Users, ArrowRight } from 'lucide-react';
import type { CommunityRoom } from '../../store/useConnectionsStore';

interface Props {
  room: CommunityRoom;
}

export default function CommunityRoomCard({ room }: Props) {
  return (
    <div className="group relative h-[420px] rounded-[3rem] overflow-hidden bg-[#1c1c1c] border border-white/5 shadow-2xl transition-all duration-700 hover:border-canvas-primary/40 hover:-translate-y-2">
      {/* Background Image with Parallax-like effect on hover */}
      <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
        <img src={room.coverImage} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700" alt={room.name} />
        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
      </div>

      <div className="relative h-full z-10 p-10 flex flex-col">
        <div className="flex justify-between items-start mb-6">
           <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-xl group-hover:bg-canvas-primary group-hover:border-canvas-primary transition-all duration-500">
              <Globe size={24} />
           </div>
           <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-2">
              <Users size={14} className="text-canvas-primary" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">{room.memberCount} Members</span>
           </div>
        </div>

        <div className="mt-auto">
           <div className="flex flex-wrap gap-2 mb-4">
              {room.themes.map(theme => (
                <span key={theme} className="text-[9px] font-bold text-white/50 bg-white/5 border border-white/10 px-3 py-1 rounded-lg uppercase tracking-widest backdrop-blur-sm">
                  {theme}
                </span>
              ))}
           </div>
           <h3 className="text-3xl font-bold tracking-tight text-white mb-3 group-hover:text-canvas-primary transition-all duration-500">{room.name}</h3>
           <p className="text-gray-400 font-serif italic text-base leading-relaxed mb-8 max-w-sm line-clamp-2 group-hover:text-gray-200 transition-colors">
              {room.description}
           </p>

           <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                 <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Curated by</div>
                 <div className="flex -space-x-2">
                    {room.curators.map((curator, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] bg-canvas-primary flex items-center justify-center text-[10px] font-bold text-white shadow-lg" title={curator}>
                        {curator.charAt(0)}
                      </div>
                    ))}
                 </div>
              </div>

              <button className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all transform group-hover:rotate-[-45deg] duration-500">
                 <ArrowRight size={20} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
