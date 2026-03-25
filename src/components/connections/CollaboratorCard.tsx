import React from 'react';
import { Shield, MessageCircle, Zap, ExternalLink } from 'lucide-react';
import type { Collaborator } from '../../store/useConnectionsStore';

interface Props {
  collaborator: Collaborator;
}

export default function CollaboratorCard({ collaborator }: Props) {
  const statusColors = {
    'Online': 'bg-emerald-500',
    'Reflecting': 'bg-amber-500',
    'Deep Focus': 'bg-canvas-primary',
    'Offline': 'bg-gray-600'
  };

  return (
    <div className="group relative bg-white/[0.03] border border-white/5 rounded-3xl p-6 transition-all duration-500 hover:bg-white/[0.06] hover:border-white/10 hover:-translate-y-1 shadow-xl overflow-hidden">
      {/* Glow Effect */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${statusColors[collaborator.status]}`} />

      <div className="relative z-10 flex items-start justify-between mb-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors">
            <img src={collaborator.avatar} alt={collaborator.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1c1c1c] ${statusColors[collaborator.status]} shadow-lg`} />
        </div>

        <div className="flex gap-2">
           <button className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-canvas-primary/20 hover:border-canvas-primary/30 transition-all">
              <MessageCircle size={16} />
           </button>
           <button className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs font-bold">
              <ExternalLink size={16} />
           </button>
        </div>
      </div>

      <div className="relative z-10 mb-5">
        <h4 className="text-lg font-bold text-white mb-1 group-hover:text-canvas-primary transition-colors">{collaborator.name}</h4>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
           <Shield size={10} className="text-canvas-primary" /> {collaborator.communicationStyle}
        </p>
      </div>

      <div className="relative z-10 space-y-4">
        {/* Strength Meter */}
        <div>
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Node Strength</span>
            <span className="text-[11px] font-mono text-white">{collaborator.strength}%</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-canvas-primary to-canvas-primary/40 transition-all duration-1000" 
              style={{ width: `${collaborator.strength}%` }}
            />
          </div>
        </div>

        {/* Exchange Count */}
        <div className="flex items-center gap-3">
           <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-3 text-center">
              <div className="text-sm font-bold text-white mb-0.5">{collaborator.exchangeCount}</div>
              <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Exchanges</div>
           </div>
           <div className="flex-[2] flex flex-wrap gap-1.5">
              {collaborator.sharedThemes.slice(0, 2).map(theme => (
                <span key={theme} className="text-[8px] font-bold text-canvas-primary bg-canvas-primary/10 border border-canvas-primary/20 px-2 py-1 rounded-lg uppercase tracking-widest">
                  {theme}
                </span>
              ))}
              {collaborator.sharedThemes.length > 2 && (
                <span className="text-[8px] font-bold text-gray-500 bg-white/5 border border-white/5 px-2 py-1 rounded-lg uppercase tracking-widest">
                  +{collaborator.sharedThemes.length - 2}
                </span>
              )}
           </div>
        </div>
      </div>

      {/* Status Overlay for Deep Focus */}
      {collaborator.status === 'Deep Focus' && (
        <div className="absolute inset-0 bg-canvas-bg-dark/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
           <div className="bg-[#1c1c1c] border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-2xl">
              <Zap size={10} className="text-canvas-primary animate-pulse" />
              <span className="text-[9px] font-bold text-white uppercase tracking-widest">In Deep Flow</span>
           </div>
        </div>
      )}
    </div>
  );
}
