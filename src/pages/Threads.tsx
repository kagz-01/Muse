import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { useThreadsStore, type ThreadMood } from '../store/useThreadsStore';
import CreateThreadModal from '../components/modals/CreateThreadModal';

const moodColors: Record<ThreadMood, string> = {
  contemplative: '#8b5cf6',
  curious: '#06b6d4',
  dark: '#475569',
  hopeful: '#10b981',
  urgent: '#f43f5e',
  serene: '#f59e0b',
};

const moodLabels: Record<ThreadMood, string> = {
  contemplative: 'Contemplative',
  curious: 'Curious',
  dark: 'Dark',
  hopeful: 'Hopeful',
  urgent: 'Urgent',
  serene: 'Serene',
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d} days ago`;
}

export default function Threads() {
  const navigate = useNavigate();
  const threads = useThreadsStore(state => state.threads);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      {showCreate && <CreateThreadModal onClose={() => setShowCreate(false)} />}

      <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24 md:pb-10">
        <header className="mb-10 border-b border-white/5 pb-6">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Threads</h1>
          <p className="text-gray-400 font-serif italic max-w-xl">
            Thematic collections where your artifacts reveal deeper patterns. Each thread is an idea you're actively exploring.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {threads.map((thread) => {
            const color = moodColors[thread.mood];
            return (
              <div
                key={thread.id}
                onClick={() => navigate(`/threads/${thread.id}`)}
                className="relative h-72 rounded-[2rem] overflow-hidden cursor-pointer group border border-white/5 hover:border-white/20 shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Cover */}
                {thread.coverImage ? (
                  <img src={thread.coverImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="absolute inset-0 bg-[#1a1a1a]" style={{ background: `radial-gradient(ellipse at top right, ${color}20, transparent 60%)` }} />
                )}

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(ellipse at bottom, ${color}25, transparent 70%)` }} />

                {/* Content */}
                <div className="absolute inset-0 p-7 flex flex-col justify-between">
                  {/* Top: mood badge */}
                  <div className="flex justify-between items-start">
                    <div />
                    <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md"
                      style={{ backgroundColor: color + '22', borderColor: color + '55', color }}
                    >
                      {moodLabels[thread.mood]}
                    </span>
                  </div>

                  {/* Bottom: info */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{thread.itemIds.length} Artifacts connected</p>
                    <h3 className="text-2xl font-bold tracking-tight text-white mb-2 leading-tight drop-shadow-xl">{thread.title}</h3>
                    {thread.thesis && (
                      <p className="text-gray-300 text-sm font-serif italic line-clamp-2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 leading-relaxed">"{thread.thesis}"</p>
                    )}
                    <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-3">{timeAgo(thread.updatedAt)}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Create new card */}
          <div
            onClick={() => setShowCreate(true)}
            className="relative h-72 border-2 border-dashed border-white/10 rounded-[2rem] hover:border-white/25 hover:bg-white/[0.02] transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group"
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 group-hover:border-white flex items-center justify-center transition-colors duration-300">
              <Plus size={24} className="text-gray-500 group-hover:text-white transition-colors" />
            </div>
            <div className="text-center px-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">Start a New Thread</p>
              <p className="text-[10px] text-gray-600 mt-1 font-serif italic group-hover:text-gray-400 transition-colors">Weave a thematic idea across your artifacts</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
