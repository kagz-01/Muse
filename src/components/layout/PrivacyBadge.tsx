import React from 'react';
import { Lock, Globe, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../../store/useUserStore';

export default function PrivacyBadge() {
  const { soloMode, toggleSoloMode } = useUserStore();

  return (
    <button 
      onClick={toggleSoloMode}
      className={`relative group flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all duration-500 overflow-hidden ${
        soloMode 
          ? 'bg-canvas-primary/10 border-canvas-primary/30 text-canvas-primary' 
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20'
      }`}
    >
      {/* Background Shimmer */}
      <AnimatePresence>
        {soloMode && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex items-center gap-2">
        {soloMode ? (
          <>
            <Lock size={14} className="animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Solo Mode</span>
          </>
        ) : (
          <>
            <Globe size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Community</span>
          </>
        )}
      </div>

      <div className="relative z-10 w-px h-3 bg-current opacity-20 mx-0.5" />
      
      <ShieldCheck size={14} className="relative z-10 opacity-70 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
