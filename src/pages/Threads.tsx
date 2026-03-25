import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Layers,
  ChevronRight,
  Sparkles,
  Globe,
  Lock
} from 'lucide-react';
import { useThreadsStore } from '../store/useThreadsStore';
import { useConnectionsStore, type ActiveCircle } from '../store/useConnectionsStore';
import { useUserStore } from '../store/useUserStore';
import CreateCircleModal from '../components/modals/CreateCircleModal';

export default function Threads() {
  const navigate = useNavigate();
  const personalThreads = useThreadsStore(state => state.threads);
  const { circles } = useConnectionsStore();
  const { soloMode } = useUserStore();
  const [activeView, setActiveView] = useState<'community' | 'private'>(soloMode ? 'private' : 'community');
  const [showCreateCircle, setShowCreateCircle] = useState(false);
  const [, setShowCreate] = useState(false);

  // Sync activeView with soloMode if it changes
  useEffect(() => {
    if (soloMode && activeView === 'community') {
      setActiveView('private');
    }
  }, [soloMode, activeView]);

  return (
    <div className="min-h-screen bg-canvas-bg-dark pb-24 overflow-hidden">
      {showCreateCircle && <CreateCircleModal onClose={() => setShowCreateCircle(false)} />}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-6">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="w-10 h-10 rounded-2xl bg-canvas-primary/20 border border-canvas-primary/30 flex items-center justify-center text-canvas-primary">
                  <Layers size={20} />
                </div>
                <span className="text-[10px] font-bold text-canvas-primary uppercase tracking-[0.3em]">Dialogue Portal</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold text-white tracking-tight"
              >
                Active <span className="text-gray-600">Thematic.</span>
              </motion.h1>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-3xl w-fit">
                <button
                  onClick={() => setActiveView('community')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all ${activeView === 'community' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                >
                  <Globe size={14} /> Community
                </button>
                <button
                  onClick={() => setActiveView('private')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all ${activeView === 'private' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                >
                  <Lock size={14} /> Private Weaves
                </button>
              </div>
              {activeView === 'community' && (
                <button
                  onClick={() => setShowCreateCircle(true)}
                  className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)] animate-in zoom-in duration-300 cursor-pointer"
                  title="Start a new circle"
                >
                  <Plus size={18} />
                </button>
              )}
            </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeView === 'community' ? (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-8 overflow-x-auto pb-16 pt-8 px-4 -mx-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {circles.map((circle) => (
                <CommunityDialogueCard key={circle.id} circle={circle} onClick={() => navigate(`/threads/${circle.id}?type=circle`)} />
              ))}

              {/* Explore more button */}
              <button
                onClick={() => navigate('/connections')}
                className="group relative h-[40vh] min-h-[260px] max-h-[360px] w-[75vw] sm:w-[320px] lg:w-[380px] shrink-0 snap-center sm:snap-start border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:border-canvas-primary/30 hover:bg-[#121212] transition-colors duration-500 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full border border-dashed border-gray-600 flex items-center justify-center group-hover:border-canvas-primary group-hover:scale-110 transition-all duration-500 text-gray-500 group-hover:text-canvas-primary">
                  <Sparkles size={20} className="transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-canvas-primary transition-colors">Discover New Circles</p>
                  <p className="text-[9px] text-gray-600 font-serif italic mt-1.5 group-hover:text-gray-400 transition-colors">Find collective intelligence</p>
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="private"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-8 overflow-x-auto pb-16 pt-8 px-4 -mx-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {personalThreads.map((thread) => (
                <PrivateWeaveCard key={thread.id} thread={thread} onClick={() => navigate(`/threads/${thread.id}`)} />
              ))}

              <button
                onClick={() => setShowCreate(true)}
                className="group relative h-[40vh] min-h-[260px] max-h-[360px] w-[75vw] sm:w-[320px] lg:w-[380px] shrink-0 snap-center sm:snap-start border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:border-canvas-primary/30 hover:bg-[#121212] transition-colors duration-500 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full border border-dashed border-gray-600 flex items-center justify-center group-hover:border-canvas-primary group-hover:scale-110 transition-all duration-500 text-gray-500 group-hover:text-canvas-primary">
                  <Plus size={24} className="transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-canvas-primary transition-colors">Start a Private Weave</p>
                  <p className="text-[9px] text-gray-600 font-serif italic mt-1.5 group-hover:text-gray-400 transition-colors">Synthesize your personal artifacts</p>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CommunityDialogueCard({ circle, onClick }: { circle: ActiveCircle; onClick: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      className="group relative h-[40vh] min-h-[260px] max-h-[360px] w-[75vw] sm:w-[320px] lg:w-[380px] shrink-0 snap-center sm:snap-start rounded-[2rem] overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-500 transform hover:-translate-y-2"
    >
      <div className="absolute inset-0 bg-[#0d0d0d] bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-canvas-primary/15 via-[#050505] to-[#050505] opacity-80 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-canvas-primary/10 border border-canvas-primary/20 backdrop-blur-md shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-canvas-primary animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            <span className="text-[9px] font-bold text-canvas-primary uppercase tracking-[0.2em]">Active Dialogue</span>
          </div>
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">{circle.recentActivity}</span>
        </div>

        <div className="transform transition-transform duration-500 group-hover:translate-y-[-4px]">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-2">{circle.theme}</p>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight group-hover:text-canvas-primary transition-colors duration-500">{circle.name}</h3>
          <p className="text-xs text-gray-400 font-serif italic line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-75">
            "{circle.description}"
          </p>
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-white/5">
          <div className="flex -space-x-3">
            {/* Mock avatars based on members list */}
            {[0, 1, 2].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-[#111] bg-gray-800 flex items-center justify-center text-[10px] overflow-hidden shadow-md transition-transform duration-500 group-hover:translate-y-[-2px]" style={{ transitionDelay: `${i * 50}ms` }}>
                <img src={`https://i.pravatar.cc/100?u=${circle.id}${i}`} className="w-full h-full object-cover" />
              </div>
            ))}
            {circle.memberCount > 3 && (
              <div className="w-10 h-10 rounded-full border-2 border-[#111] bg-[#1a1a1a] flex items-center justify-center text-[10px] font-bold text-gray-400 shadow-md">
                +{circle.memberCount - 3}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-canvas-primary group-hover:translate-x-1 transition-transform duration-500 bg-canvas-primary/10 px-2.5 py-1.5 rounded-lg backdrop-blur-md">
            Enter <ChevronRight size={12} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PrivateWeaveCard({ thread, onClick }: { thread: any; onClick: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      className="group relative h-[40vh] min-h-[260px] max-h-[360px] w-[75vw] sm:w-[320px] lg:w-[380px] shrink-0 snap-center sm:snap-start rounded-[2rem] overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-500 transform hover:-translate-y-2"
    >
      {thread.coverImage ? (
        <img src={thread.coverImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out opacity-50 group-hover:opacity-70" />
      ) : (
        <div className="absolute inset-0 bg-[#0d0d0d]" />
      )}

      <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-[#050505]/60 to-transparent" />

      <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl shadow-sm">
            <Lock size={11} className="text-gray-400" />
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em]">Private Weave</span>
          </div>
          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em]">3 artifacts</span>
        </div>

        <div className="transform transition-transform duration-500 group-hover:translate-y-[-4px]">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight group-hover:text-canvas-primary transition-colors duration-500">{thread.title}</h3>
          <p className="text-xs text-gray-400 font-serif italic line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-500 delay-75">
            "{thread.thesis}"
          </p>
        </div>

        <div className="flex items-center justify-end pt-5">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-white transition-all duration-500 group-hover:translate-x-1 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg backdrop-blur-md">
            Analyze <ChevronRight size={12} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
