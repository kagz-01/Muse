import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Users, MessageSquare, Sparkles } from 'lucide-react';

const PULSE_MESSAGES = [
  { icon: <Zap size={14} />, text: "3 Circles Growing in 'Architecture of Silence'", color: 'text-canvas-primary' },
  { icon: <Users size={14} />, text: "Amina El-Sayed is reflecting in 'Silence'", color: 'text-amber-400' },
  { icon: <Sparkles size={14} />, text: "Global Theme: 'Identity' is surfacing today", color: 'text-emerald-400' },
  { icon: <MessageSquare size={14} />, text: "New Perspective: Marcus shared a direct insight", color: 'text-rose-400' },
];

export default function CommunityPulseStrip() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % PULSE_MESSAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = PULSE_MESSAGES[index];

  return (
    <div className="w-full h-12 bg-white/[0.02] border-y border-white/5 flex items-center justify-center overflow-hidden px-6 relative">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-canvas-primary/5 to-transparent opacity-50" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="flex items-center gap-3 relative z-10"
        >
          <span className={`${current.color} drop-shadow-sm`}>{current.icon}</span>
          <span className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">
            {current.text}
          </span>
        </motion.div>
      </AnimatePresence>

      <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1.5 opacity-30">
        <div className="w-1.5 h-1.5 rounded-full bg-canvas-primary animate-pulse" />
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Live Pulse</span>
      </div>
    </div>
  );
}
