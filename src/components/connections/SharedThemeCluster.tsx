import React from 'react';
import { useConnectionsStore } from '../../store/useConnectionsStore';

export default function SharedThemeCluster() {
  const themes = useConnectionsStore(state => state.activeThemes);
  
  return (
    <div className="bg-[#1c1c1c] border border-white/5 rounded-2xl p-6 shadow-lg">
      <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Active Shared Themes</h3>
      <div className="flex flex-wrap gap-2.5">
        {themes.map(theme => (
          <button 
            key={theme}
            className="px-3 py-1.5 rounded-xl bg-[#0a0a0a] border border-white/5 text-xs font-semibold text-gray-300 hover:text-white hover:border-canvas-primary hover:bg-canvas-primary/10 transition-all shadow-sm"
          >
            {theme}
          </button>
        ))}
      </div>
    </div>
  );
}
