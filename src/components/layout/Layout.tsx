import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { 
  Home, Layers, BookOpen, Plus, User, PenTool, 
  Menu as MenuIcon, X, Network, Zap, Layout as LayoutIcon, 
  ChevronRight, Sparkles, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CaptureModal from '../modals/CaptureModal';
import ProfileOverlay from '../profile/ProfileOverlay';
import { useUserStore } from '../../store/useUserStore';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useUserStore();

  const navItems = [
    { label: 'Rooms', path: '/rooms', icon: <LayoutIcon size={22} />, desc: 'Your collection spaces' },
    { label: 'Threads', path: '/threads', icon: <Layers size={22} />, desc: 'Thematic syntheses' },
    { label: 'Journal', path: '/journal', icon: <BookOpen size={22} />, desc: 'Private introspection' },
    { label: 'Create', path: '/create', icon: <PenTool size={22} />, desc: 'Start a new flow' },
  ];

  const secondaryNav = [
    { label: 'Connections', path: '/connections', icon: <Network size={20} /> },
    { label: 'Settings', path: '/settings', icon: <User size={20} /> },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex flex-col h-screen w-full bg-canvas-bg-dark text-white overflow-hidden pb-safe">
      <CaptureModal isOpen={isCaptureOpen} onClose={() => setIsCaptureOpen(false)} />
      <ProfileOverlay isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      
      {/* UNIFIED TOP HEADER */}
      <header className="sticky top-0 w-full z-50 bg-canvas-bg-dark/90 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-6 md:px-10 py-4 h-20 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
         <div className="flex items-center gap-8">
            <h1 
              className="text-2xl font-bold tracking-tight cursor-pointer hover:text-canvas-primary transition-colors flex items-center gap-2" 
              onClick={() => navigate('/dashboard')}
            >
              <Zap size={22} className="text-canvas-primary fill-canvas-primary" />
              Muse
            </h1>

            {/* Desktop Quick Search Placeholder */}
            <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/8 rounded-full text-gray-500 cursor-text hover:border-white/20 transition-all">
               <Search size={16} />
               <span className="text-xs font-bold uppercase tracking-widest">Search deep artifacts...</span>
            </div>
         </div>

         <div className="flex items-center gap-4">
            {/* Clickable Profile Avatar */}
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="relative group p-0.5 rounded-full border border-white/10 hover:border-canvas-primary transition-all active:scale-95 outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center font-serif text-gray-400">
                 {user?.avatarUrl ? (
                   <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                 ) : (
                   user?.name?.charAt(0) || 'U'
                 )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-canvas-primary rounded-full border-2 border-canvas-bg-dark group-hover:scale-110 transition-transform shadow-lg" />
            </button>

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Redefined Global Menu Icon */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="group p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-canvas-primary/40 transition-all outline-none"
            >
               <MenuIcon size={22} className="text-gray-300 group-hover:text-white transition-colors" />
            </button>
         </div>
      </header>

      {/* GLOBAL NAVIGATION DRAWER (Unified Menu) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex justify-end"
          >
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-canvas-bg-dark/40 backdrop-blur-md cursor-pointer"
            />

            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-sm md:max-w-md h-full bg-[#111111] border-l border-white/5 shadow-2xl flex flex-col p-8 md:p-12 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                 <div>
                    <h2 className="text-[10px] font-bold text-canvas-primary uppercase tracking-[0.3em] mb-1">Navigation</h2>
                    <h3 className="text-2xl font-bold tracking-tight text-white">Choose Intent</h3>
                 </div>
                 <button onClick={() => setIsMenuOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-white transition-all cursor-pointer">
                   <X size={24} />
                 </button>
              </div>

              <nav className="flex flex-col gap-3 flex-1">
                {navItems.map(item => {
                  const active = isActive(item.path);
                  return (
                    <button 
                      key={item.label}
                      onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                      className={`group flex items-center justify-between p-6 rounded-[2rem] transition-all border ${active ? 'bg-canvas-primary border-canvas-primary shadow-[0_20px_40px_rgba(99,102,241,0.25)]' : 'bg-white/[0.03] border-white/5 hover:border-white/15'}`}
                    >
                      <div className="flex items-center gap-5">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${active ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-white'}`}>
                            {item.icon}
                         </div>
                         <div className="text-left">
                            <p className={`text-lg font-bold leading-tight ${active ? 'text-white' : 'text-gray-300'}`}>{item.label}</p>
                            <p className={`text-[10px] uppercase tracking-widest font-bold ${active ? 'text-white/60' : 'text-gray-600'}`}>{item.desc}</p>
                         </div>
                      </div>
                      <ChevronRight size={18} className={active ? 'text-white/60' : 'text-gray-800'} />
                    </button>
                  );
                })}

                <div className="h-px bg-white/5 my-6" />

                <div className="grid grid-cols-2 gap-3">
                   {secondaryNav.map(item => (
                     <button 
                        key={item.label}
                        onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                        className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all text-gray-500 hover:text-white ${isActive(item.path) ? 'border-canvas-primary/40 bg-canvas-primary/5 text-canvas-primary' : ''}`}
                     >
                        {item.icon}
                        <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                     </button>
                   ))}
                </div>
              </nav>

              <div className="pt-10 flex flex-col gap-4">
                 <button 
                   onClick={() => { setIsCaptureOpen(true); setIsMenuOpen(false); }}
                   className="w-full group py-5 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-3xl flex justify-center items-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] hover:-translate-y-1 active:scale-95 transition-all"
                 >
                   <Plus size={18} /> Deep Capture
                 </button>
                 <div className="text-center">
                    <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">Muse Beta 1.2.0 • Inspired Flow</p>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative scroll-smooth bg-canvas-bg-dark">
        <Outlet />
      </main>

      {/* MOBILE BOTTOM NAVIGATION: Simplified, Focus on Flow */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-canvas-bg-dark/95 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center h-20 px-4 z-40 pb-safe">
        <button 
          onClick={() => navigate('/dashboard')}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${isActive('/dashboard') ? 'text-canvas-primary scale-110' : 'text-gray-500'}`}
        >
          <Home size={22} />
        </button>
        
        <button 
          onClick={() => setIsCaptureOpen(true)}
          className="relative -top-10 w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-4 border-canvas-bg-dark active:scale-90 transition-transform"
        >
          <Plus size={28} />
        </button>

        <button 
          onClick={() => setIsMenuOpen(true)}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${isMenuOpen ? 'text-canvas-primary' : 'text-gray-500'}`}
        >
          <MenuIcon size={24} />
        </button>
      </nav>
    </div>
  );
}
