import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, LogOut, Shield, ChevronRight, Globe } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useUserStore } from '../../store/useUserStore';
import { useRoomsStore } from '../../store/useRoomsStore';
import PortraitCard from './PortraitCard';
import PrivacyManager from '../modals/PrivacyManager';

interface ProfileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileOverlay({ isOpen, onClose }: ProfileOverlayProps) {
  const navigate = useNavigate();
  const { user, soloMode, toggleSoloMode, logout } = useUserStore();
  const rooms = useRoomsStore(state => state.rooms);
  const [isPrivacyOpen, setIsPrivacyOpen] = React.useState(false);
  
  const activeRooms = rooms.slice().sort((a, b) => b.count - a.count).slice(0, 3);

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
        >
           <PrivacyManager isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

          {/* Backdrop blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-canvas-bg-dark/80 backdrop-blur-[40px] cursor-pointer"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left side: The Portrait Card */}
            <div className="flex justify-center lg:justify-end">
              <PortraitCard user={user} activeRooms={activeRooms} soloMode={soloMode} />
            </div>

            {/* Right side: Management Actions */}
            <div className="flex flex-col gap-6 max-w-md mx-auto lg:mx-0">
               <div className="mb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-canvas-primary mb-2">Persona Control</h3>
                  <h2 className="text-3xl font-bold tracking-tight text-white italic font-serif">Manage your digital replica.</h2>
               </div>

               <div className="space-y-3">
                  <button 
                    onClick={() => { navigate('/settings'); onClose(); }}
                    className="w-full group flex items-center justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-white group-hover:bg-canvas-primary transition-all">
                          <Settings size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white">Edit Profile</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Blocks & Identity</p>
                       </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-700 group-hover:text-white transition-colors" />
                  </button>

                  <button 
                    onClick={toggleSoloMode}
                    className="w-full group flex items-center justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${soloMode ? 'bg-canvas-primary/20 border-canvas-primary/40 text-canvas-primary' : 'bg-white/5 border-white/10 text-gray-500 group-hover:text-white'}`}>
                          <Shield size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white">{soloMode ? 'Solo Mode Active' : 'Solo Mode Disabled'}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Privacy & Noise control</p>
                       </div>
                    </div>
                    <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${soloMode ? 'bg-canvas-primary' : 'bg-gray-800'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${soloMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setIsPrivacyOpen(true)}
                    className="w-full group flex items-center justify-between p-5 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 transition-all">
                          <Globe size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white">Community Settings</p>
                          <p className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest">Granular sharing</p>
                       </div>
                    </div>
                    <ChevronRight size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                  </button>

                  <button 
                    onClick={() => { logout(); onClose(); navigate('/auth'); }}
                    className="w-full group flex items-center justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-rose-400 group-hover:bg-rose-500/20 transition-all">
                          <LogOut size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white">Logout</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">End session</p>
                       </div>
                    </div>
                    <X size={16} className="text-gray-700 group-hover:text-rose-400 transition-colors" />
                  </button>
               </div>

               <button 
                onClick={onClose}
                className="mt-4 w-full py-4 rounded-3xl border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all"
               >
                 Close Persona
               </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
