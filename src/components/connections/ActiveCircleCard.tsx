import React from 'react';
import { Users, Plus, ArrowRight, MessageSquare, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import type { ActiveCircle } from '../../store/useConnectionsStore';

interface Props {
  circle: ActiveCircle;
  onJoin?: () => void;
}

export default function ActiveCircleCard({ circle, onJoin }: Props) {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-[#1c1c1c] border border-white/5 rounded-[2.5rem] p-8 transition-all duration-500 hover:border-canvas-primary/30 hover:bg-white/[0.02] shadow-2xl flex flex-col h-full overflow-hidden cursor-pointer"
      onClick={() => navigate(`/threads/${circle.id}?type=circle`)}
    >
      {/* Ambient background accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-canvas-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="flex justify-between items-start gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-canvas-primary/10 border border-canvas-primary/20">
                <div className="w-1.5 h-1.5 rounded-full bg-canvas-primary animate-pulse" />
                <span className="text-[9px] font-bold text-canvas-primary uppercase tracking-widest">Active Circle</span>
             </div>
             <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
               <MessageSquare size={12} className="text-gray-600" /> {circle.recentActivity}
             </span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-canvas-primary transition-colors duration-300">{circle.name}</h3>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onJoin?.(); }}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-canvas-primary hover:border-canvas-primary transition-all active:scale-90 shadow-lg"
        >
          <Plus size={22} />
        </button>
      </div>

      <p className="text-gray-400 font-serif italic text-base leading-relaxed mb-8 flex-1 line-clamp-2">
        "{circle.description}"
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        <span className="text-[10px] font-bold text-gray-500 border border-white/10 px-3 py-1 rounded-lg uppercase tracking-widest hover:border-white/30 hover:text-white transition-all cursor-default flex items-center gap-2">
          <Globe size={12} /> {circle.theme}
        </span>
      </div>

      <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
               {circle.members.slice(0, 3).map((member, i) => (
                 <div key={i} className="w-10 h-10 rounded-xl overflow-hidden border-2 border-[#1c1c1c] shadow-xl bg-gray-800 flex items-center justify-center">
                    <img src={`https://i.pravatar.cc/100?u=${circle.id}${i}`} className="w-full h-full object-cover" />
                 </div>
               ))}
               {circle.memberCount > 3 && (
                 <div className="w-10 h-10 rounded-xl bg-[#222] border-2 border-[#1c1c1c] flex items-center justify-center text-[10px] font-bold text-gray-400 shadow-xl">
                   +{circle.memberCount - 3}
                 </div>
               )}
            </div>
            <div>
               <p className="text-xs font-bold text-white leading-none mb-1">{circle.memberCount} Members</p>
               <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Active Pulse</p>
            </div>
         </div>

         <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors">
            Enter <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
         </div>
      </div>
    </motion.div>
  );
}
