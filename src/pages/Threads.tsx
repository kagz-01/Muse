import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MessageSquare, 
  Layers, 
  Users, 
  Zap, 
  ChevronRight,
  Sparkles,
  Globe,
  Lock
} from 'lucide-react';
import { useThreadsStore } from '../store/useThreadsStore';
import { useConnectionsStore, type ActiveCircle } from '../store/useConnectionsStore';

export default function Threads() {
  const navigate = useNavigate();
  const personalThreads = useThreadsStore(state => state.threads);
  const { circles } = useConnectionsStore();
  const [activeView, setActiveView] = useState<'community' | 'private'>('community');
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen bg-canvas-bg-dark pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="mb-16">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {circles.map((circle) => (
                <CommunityDialogueCard key={circle.id} circle={circle} onClick={() => navigate(`/threads/${circle.id}?type=circle`)} />
              ))}
              
              {/* Explore more button */}
              <button 
                onClick={() => navigate('/connections')}
                className="group relative h-72 border-2 border-dashed border-white/10 rounded-4xl flex flex-col items-center justify-center gap-4 hover:border-canvas-primary/30 transition-all cursor-pointer"
              >
                 <div className="w-14 h-14 rounded-full border border-dashed border-gray-600 flex items-center justify-center group-hover:border-canvas-primary transition-colors">
                    <Sparkles size={20} className="text-gray-600 group-hover:text-canvas-primary" />
                 </div>
                 <div className="text-center">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">Discover New Circles</p>
                    <p className="text-[10px] text-gray-600 font-serif italic mt-1 group-hover:text-gray-400 transition-colors">Find collective intelligence</p>
                 </div>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="private"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {personalThreads.map((thread) => (
                <PrivateWeaveCard key={thread.id} thread={thread} onClick={() => navigate(`/threads/${thread.id}`)} />
              ))}
              
              <button 
                onClick={() => setShowCreate(true)}
                className="group relative h-72 border-2 border-dashed border-white/10 rounded-4xl flex flex-col items-center justify-center gap-4 hover:border-canvas-primary/30 transition-all cursor-pointer"
              >
                 <div className="w-14 h-14 rounded-full border border-dashed border-gray-600 flex items-center justify-center group-hover:border-canvas-primary transition-colors">
                    <Plus size={20} className="text-gray-600 group-hover:text-canvas-primary" />
                 </div>
                 <div className="text-center">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">Start a Private Weave</p>
                    <p className="text-[10px] text-gray-600 font-serif italic mt-1 group-hover:text-gray-400 transition-colors">Synthesize your personal artifacts</p>
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
      className="group relative h-72 rounded-4xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/10 shadow-2xl transition-all"
    >
      <div className="absolute inset-0 bg-[#111] bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-canvas-primary/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-canvas-primary/10 border border-canvas-primary/20">
              <div className="w-1.5 h-1.5 rounded-full bg-canvas-primary animate-pulse" />
              <span className="text-[9px] font-bold text-canvas-primary uppercase tracking-widest">Active Dialogue</span>
           </div>
           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{circle.recentActivity}</span>
        </div>

        <div>
           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">{circle.theme}</p>
           <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-canvas-primary transition-colors">{circle.name}</h3>
           <p className="text-sm text-gray-400 font-serif italic line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
             "{circle.description}"
           </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
           <div className="flex -space-x-2">
              {/* Mock avatars based on members list */}
              {[0, 1, 2].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#111] bg-gray-800 flex items-center justify-center text-[10px] overflow-hidden">
                   <img src={`https://i.pravatar.cc/100?u=${circle.id}${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
              {circle.memberCount > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-[#111] bg-[#222] flex items-center justify-center text-[9px] font-bold text-gray-500">
                   +{circle.memberCount - 3}
                </div>
              )}
           </div>
           
           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-canvas-primary group-hover:translate-x-1 transition-transform">
              Enter <ChevronRight size={14} />
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
      className="group relative h-72 rounded-4xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/10 shadow-2xl transition-all"
    >
      {thread.coverImage ? (
        <img src={thread.coverImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-40 group-hover:opacity-60" />
      ) : (
        <div className="absolute inset-0 bg-[#1c1c1c] opacity-50" />
      )}
      
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
      
      <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Lock size={12} className="text-gray-400" />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Private Weave</span>
           </div>
           <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">3 artifacts</span>
        </div>

        <div>
           <h3 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-canvas-primary transition-colors">{thread.title}</h3>
           <p className="text-sm text-gray-400 font-serif italic line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
             "{thread.thesis}"
           </p>
        </div>

        <div className="flex items-center justify-end pt-6">
           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-all group-hover:translate-x-1">
              Analyze <ChevronRight size={14} />
           </div>
        </div>
      </div>
    </motion.div>
  );
}
