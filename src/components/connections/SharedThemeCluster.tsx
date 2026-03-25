import React from 'react';
import { useConnectionsStore } from '../../store/useConnectionsStore';
import { motion } from 'framer-motion';

export default function SharedThemeCluster() {
  const themes = useConnectionsStore(state => state.activeThemes);
  
  return (
    <div className="bg-[#1c1c1c] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
      <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Active Shared Themes</h3>
      <div className="flex flex-wrap gap-3">
        {themes.map((theme, i) => (
          <motion.button 
            key={theme}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-gray-400 hover:text-white hover:border-canvas-primary hover:bg-canvas-primary/10 transition-all shadow-lg uppercase tracking-widest cursor-pointer"
          >
            {theme}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
