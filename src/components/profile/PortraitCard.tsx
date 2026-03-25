import React from 'react';
import { Shield, ExternalLink, MapPin, Quote } from 'lucide-react';
import type { User } from '../../store/useUserStore';
import type { Room } from '../../store/useRoomsStore';

interface PortraitCardProps {
  user: User;
  activeRooms: Room[];
  soloMode?: boolean;
  className?: string;
}

export default function PortraitCard({ user, activeRooms, soloMode, className = "" }: PortraitCardProps) {
  const calculateAge = (birthDateString?: string) => {
    if (!birthDateString) return null;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  const userAge = calculateAge(user.birthDate);

  return (
    <div className={`w-full max-w-sm perspective-distant ${className}`}>
      {/* The Trading Card */}
      <div className="bg-linear-to-b from-white/[0.08] to-canvas-bg-dark rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)] transform-gpu transition-all duration-700 hover:rotate-y-2 hover:rotate-x-2 hover:-translate-y-2 relative group">
        
        {/* Ambient Glows */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-canvas-primary/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-canvas-primary/20 transition-colors duration-700" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-canvas-accent/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-canvas-accent/20 transition-colors duration-700" />

        {/* Cover Image / Header Area */}
        <div className="h-40 bg-linear-to-br from-canvas-primary/30 via-canvas-accent/10 to-transparent relative border-b border-white/5 flex justify-center">
          {soloMode && (
            <div className="absolute top-5 right-5 bg-black/60 backdrop-blur-xl border border-white/10 px-3.5 py-1.5 rounded-full flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-canvas-primary shadow-2xl z-20 animate-in fade-in zoom-in-90 duration-500">
              <Shield size={12} strokeWidth={2.5} /> Solo Mode
            </div>
          )}

          {/* Location Badge */}
          {user.location && (
            <div className="absolute top-5 left-5 bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 z-20">
              <MapPin size={10} /> {user.location}
            </div>
          )}

          <div className="absolute -bottom-12 w-24 h-24 rounded-full bg-canvas-bg-dark border-[4px] border-canvas-bg-dark overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center justify-center text-4xl font-serif text-gray-500 z-10 group-hover:scale-105 transition-transform duration-500">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0)
            )}
          </div>
        </div>

        {/* Profile Info Area */}
        <div className="px-8 pb-12 pt-16 text-center relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">{user.name}</h2>
          <div className="flex items-center justify-center gap-2.5 text-gray-500 text-[11px] font-bold uppercase tracking-widest mb-6 px-4">
            <span className="text-canvas-primary">{user.username}</span>
            {(userAge !== null || user.gender) && <span className="text-white/10">•</span>}
            {user.gender && <span>{user.gender}</span>}
            {userAge !== null && <span>{userAge} YRS</span>}
          </div>

          {/* BIO Section */}
          {user.bio && (
            <div className="mb-8 relative px-4">
               <Quote size={20} className="absolute -top-3 -left-1 text-white/5" />
               <p className="text-gray-400 font-serif italic text-[15px] leading-relaxed line-clamp-3">
                 "{user.bio}"
               </p>
            </div>
          )}

          {/* Realms Section */}
          <div className="mb-10 flex flex-col items-center">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-4 flex items-center gap-2.5">
               <span className="w-1.5 h-1.5 rounded-full bg-canvas-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
               Dominant Realms
            </h4>
            <div className="flex flex-wrap justify-center gap-2.5">
              {activeRooms.map(room => (
                <div key={room.id} className="bg-white/5 border border-white/8 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
                  {room.name}
                </div>
              ))}
              {activeRooms.length === 0 && (
                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest italic border border-dashed border-white/5 px-4 py-2 rounded-xl">
                  Discovering...
                </div>
              )}
            </div>
          </div>

          {/* Action Links */}
          <div className="space-y-2.5 text-left">
            {(user.links || []).length > 0 ? (
              (user.links || []).map(link => (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/5 hover:border-white/15 hover:-translate-x-1 transition-all group/link"
                >
                  <span className="text-xs font-bold text-gray-300 group-hover/link:text-white transition-colors truncate tracking-wide">{link.title}</span>
                  <ExternalLink size={14} className="text-gray-600 group-hover/link:text-canvas-primary transition-colors duration-300 shrink-0" />
                </a>
              ))
            ) : (
              <div className="text-[10px] text-gray-700 font-bold uppercase tracking-widest text-center py-6 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                 No external mappings
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
