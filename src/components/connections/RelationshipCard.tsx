import React from 'react';
import { Network } from 'lucide-react';
import { Relationship } from '../../store/useConnectionsStore';

export default function RelationshipCard({ relationship }: { relationship: Relationship }) {
  return (
    <div className="bg-[#1c1c1c] border border-white/5 rounded-2xl p-5 shadow-lg hover:bg-white/5 transition-all cursor-pointer group">
      <div className="flex items-center gap-4 mb-4">
        <img src={relationship.avatar} alt={relationship.name} className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-sm" />
        <div>
          <h4 className="font-bold text-white group-hover:text-canvas-primary transition-colors">{relationship.name}</h4>
          <p className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mt-0.5">{relationship.exchangeCount} Meaningful Exchanges</p>
        </div>
      </div>
      
      <div className="w-full bg-[#0a0a0a] rounded-full h-1.5 mb-5 overflow-hidden border border-white/5">
        <div className="bg-gradient-to-r from-canvas-primary to-[#00E5FF] h-full rounded-full" style={{ width: `${relationship.strength}%` }}></div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {relationship.sharedThemes.map(theme => (
           <span key={theme} className="text-[10px] uppercase tracking-widest bg-white/5 text-gray-400 px-2 py-1 rounded-md font-bold">
             {theme}
           </span>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400 bg-[#0a0a0a] p-2.5 rounded-xl border border-white/5">
        <Network size={14} className="text-canvas-primary shrink-0" />
        <span className="truncate font-serif italic text-[11px]">{relationship.communicationStyle}</span>
      </div>
    </div>
  );
}
