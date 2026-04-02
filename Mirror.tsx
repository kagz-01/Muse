import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { ArrowLeft, Sparkles, BarChart2, Layers, BookOpen, TrendingUp, Share2 } from 'lucide-react';
import { useItemsStore } from '../store/useItemsStore';
import { useRoomsStore } from '../store/useRoomsStore';
import { useJournalStore } from '../store/useJournalStore';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function Mirror() {
  const navigate = useNavigate();
  const items = useItemsStore(s => s.items);
  const rooms = useRoomsStore(s => s.rooms);
  const entries = useJournalStore(s => s.entries);

  const now = Date.now();
  const weekItems = useMemo(() => items.filter(i => now - i.createdAt < ONE_WEEK_MS), [items]);
  const weekEntries = useMemo(() => entries.filter(e => now - e.createdAt < ONE_WEEK_MS), [entries]);

  // Top room by activity this week
  const roomCounts = weekItems.reduce<Record<string, number>>((acc, i) => {
    acc[i.roomId] = (acc[i.roomId] || 0) + 1; return acc;
  }, {});
  const topRoomId = Object.keys(roomCounts).sort((a, b) => roomCounts[b] - roomCounts[a])[0];
  const topRoom = rooms.find(r => r.id === topRoomId);

  const stats = [
    { label: 'Artifacts saved', value: weekItems.length, icon: Layers, color: 'text-canvas-primary', bg: 'bg-canvas-primary/10' },
    { label: 'Journal entries', value: weekEntries.length, icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Rooms explored', value: new Set(weekItems.map(i => i.roomId)).size, icon: BarChart2, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Public artifacts', value: weekItems.filter(i => i.isPublic).length, icon: TrendingUp, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  const reflections = [
    topRoom
      ? `You've been deeply exploring "${topRoom.name}" this week. ${roomCounts[topRoomId] || 0} artifacts captured.`
      : 'Start adding artifacts to rooms to see weekly insights here.',
    weekEntries.length > 0
      ? `You reflected ${weekEntries.length} time${weekEntries.length > 1 ? 's' : ''} in your Journal this week. That's meaningful.`
      : 'Try writing a journal entry — it sharpens clarity.',
    weekItems.length >= 5
      ? `You've been intentional — ${weekItems.length} items curated this week. Pattern recognition is forming.`
      : 'Collect more artifacts this week to start seeing patterns in your thinking.',
  ];

  return (
    <div className="min-h-screen bg-canvas-bg-dark pb-24">
      <div className="fixed inset-0 pointer-events-none bg-canvas-primary/5 blur-3xl opacity-30" />

      <div className="max-w-4xl mx-auto px-6 py-10 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-10 text-sm font-bold uppercase tracking-widest cursor-pointer"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
              <Sparkles size={24} className="text-canvas-primary" />
            </motion.div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-canvas-primary">Weekly Mirror</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-4">
            This Week <span className="text-gray-600 italic font-serif">in Muse.</span>
          </h1>
          <p className="text-gray-400 font-serif italic text-lg leading-relaxed max-w-xl">
            A curated reflection on your curation — the patterns your selections reveal about you.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex flex-col items-start gap-3"
            >
              <div className={`w-10 h-10 ${s.bg} rounded-2xl flex items-center justify-center`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-3xl font-bold text-white font-mono">{s.value}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Reflections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/[0.02] border border-white/5 rounded-4xl p-8 md:p-12 mb-10 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-canvas-primary/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <Sparkles size={20} className="text-canvas-primary" /> Curator's Insights
            </h2>
            <div className="space-y-6">
              {reflections.map((text, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-canvas-primary shrink-0 group-hover:scale-150 transition-transform" />
                  <p className="text-gray-300 leading-relaxed font-serif italic text-lg group-hover:text-white transition-colors">
                    "{text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Room Breakdown */}
        {rooms.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-10">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
              <BarChart2 size={14} /> Room Activity This Week
            </h2>
            <div className="space-y-3">
              {rooms.map(room => {
                const count = roomCounts[room.id] || 0;
                const max = Math.max(...Object.values(roomCounts), 1);
                const pct = Math.round((count / max) * 100);
                return (
                  <button
                    key={room.id}
                    onClick={() => navigate(`/rooms/${room.id}`)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer text-left"
                  >
                    <span className="text-sm font-bold text-white w-36 truncate shrink-0">{room.name}</span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-canvas-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] font-mono text-gray-500 shrink-0 w-14 text-right">{count} items</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Share CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex justify-center">
          <button className="flex items-center gap-3 px-10 py-5 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 active:scale-95 transition-all cursor-pointer">
            <Share2 size={16} /> Share Your Week
          </button>
        </motion.div>
      </div>
    </div>
  );
}
