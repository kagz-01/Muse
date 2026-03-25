import React from 'react';
import { Users, Plus, ArrowRight, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ActiveCircle } from '../../store/useConnectionsStore';

interface Props {
  circle: ActiveCircle;
  onJoin?: () => void;
}

export default function ActiveCircleCard({ circle, onJoin }: Props) {
  const statusColors = {
    'Growing': 'text-emerald-400 bg-emerald-400/10',
    'Vibrant': 'text-canvas-primary bg-canvas-primary/10',
    'Quiet': 'text-gray-500 bg-gray-500/10',
    'Intense': 'text-rose-400 bg-rose-400/10'
  };

  return (
    <div className="group relative bg-[#1c1c1c] border border-white/5 rounded-[2.5rem] p-8 transition-all duration-500 hover:border-canvas-primary/30 hover:bg-white/[0.02] shadow-2xl flex flex-col h-full overflow-hidden">
      {/* Ambient background accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-canvas-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="flex justify-between items-start gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
             <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/5 ${statusColors[circle.status]}`}>
               {circle.status}
             </span>
             <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
               <MessageSquare size={12} className="text-gray-600" /> Active {circle.lastActivity} ago
             </span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-canvas-primary transition-colors duration-300">{circle.name}</h3>
        </div>
        
        <button 
          onClick={onJoin}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-canvas-primary hover:border-canvas-primary transition-all active:scale-90 shadow-lg"
        >
          <Plus size={22} />
        </button>
      </div>

      <p className="text-gray-400 font-serif italic text-base leading-relaxed mb-8 flex-1">
        "{circle.description}"
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {circle.themes.map(theme => (
          <span key={theme} className="text-[10px] font-bold text-gray-500 border border-white/10 px-3 py-1 rounded-lg uppercase tracking-widest hover:border-white/30 hover:text-white transition-all cursor-default">
            {theme}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
               {circle.members.map((member, i) => (
                 <div key={i} className="w-10 h-10 rounded-xl overflow-hidden border-2 border-[#1c1c1c] shadow-xl">
                   <img src={member.avatar} className="w-full h-full object-cover" />
                 </div>
               ))}
               {circle.memberCount > circle.members.length && (
                 <div className="w-10 h-10 rounded-xl bg-[#222] border-2 border-[#1c1c1c] flex items-center justify-center text-[10px] font-bold text-gray-400 shadow-xl">
                   +{circle.memberCount - circle.members.length}
                 </div>
               )}
            </div>
            <div>
               <p className="text-xs font-bold text-white leading-none mb-1">{circle.activeNow} Present</p>
               <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{circle.memberCount} Members</p>
            </div>
         </div>

         <button className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors group/btn">
            Enter Circle <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
         </button>
      </div>
    </div>
  );
}
