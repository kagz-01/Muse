import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Home, Layers, BookOpen, Plus, User, PenTool, Menu, X, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CaptureModal from '../modals/CaptureModal';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Rooms', path: '/dashboard', icon: <Home size={20} /> },
    { label: 'Threads', path: '/threads', icon: <Layers size={20} /> },
    { label: 'Journal', path: '/journal', icon: <BookOpen size={20} /> },
    { label: 'Create', path: '/create', icon: <PenTool size={20} /> },
  ];

  return (
    <div className="flex h-screen w-full bg-canvas-bg-dark text-white overflow-hidden pb-16 md:pb-0">
      <CaptureModal isOpen={isCaptureOpen} onClose={() => setIsCaptureOpen(false)} />
      
      {/* Mobile Top Header & Hamburger Menu Trigger */}
      <header className="md:hidden fixed top-0 w-full z-40 bg-canvas-bg-dark/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 py-4 shadow-xs">
         <h1 className="text-2xl font-bold tracking-tight cursor-pointer" onClick={() => navigate('/dashboard')}>Muse</h1>
         <button onClick={() => setIsMenuOpen(true)} className="p-2 -mr-2 text-gray-300 hover:text-white transition-colors bg-white/5 rounded-full outline-none">
            <Menu size={20} />
         </button>
      </header>

      {/* Full Screen Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col pt-6 px-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-10 mt-2">
               <h2 className="text-2xl font-bold tracking-tight text-white/50">Navigation</h2>
               <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full">
                 <X size={24} />
               </button>
            </div>
            
            <nav className="flex flex-col gap-3">
              {navItems.map(item => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <button 
                    key={item.label}
                    onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                    className={`flex items-center justify-start gap-4 p-4 rounded-2xl text-lg font-semibold transition-all ${isActive ? 'bg-canvas-primary text-white shadow-[0_10px_20px_rgba(99,102,241,0.2)]' : 'bg-[#1c1c1c] border border-white/5 text-gray-300 hover:border-white/10'}`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                );
              })}
              
              <div className="w-full h-px bg-white/5 my-4"></div>
              
              <button 
                  onClick={() => { navigate('/settings'); setIsMenuOpen(false); }}
                  className={`flex items-center justify-start gap-4 p-4 rounded-2xl text-lg font-semibold transition-all ${location.pathname.startsWith('/settings') ? 'bg-canvas-primary text-white shadow-[0_10px_20px_rgba(99,102,241,0.2)]' : 'bg-[#1c1c1c] border border-white/5 text-gray-300 hover:border-white/10'}`}
              >
                  <Settings size={20} />
                  Settings & Profiles
              </button>
            </nav>
            
            <div className="mt-auto pb-10 pt-10 flex justify-center">
              <button 
                onClick={() => { setIsCaptureOpen(true); setIsMenuOpen(false); }}
                className="w-full py-4.5 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-2xl flex justify-center items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 transition-transform"
              >
                <Plus size={18} /> Deep Capture
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-white/5 hidden md:flex flex-col p-4 bg-canvas-bg-dark z-10">
        <div className="flex items-center justify-between mb-8 px-2">
          <h1 className="text-2xl font-bold tracking-tight cursor-pointer hover:text-canvas-primary transition-colors" onClick={() => navigate('/')}>Muse</h1>
          <button onClick={() => navigate('/settings')} className="outline-none p-1.5 rounded-full hover:bg-white/5 transition-colors">
             <User size={20} className="text-gray-400 hover:text-white transition-colors" />
          </button>
        </div>
        
        <nav className="flex-1 space-y-1.5 mt-4">
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <div 
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors duration-200 font-medium ${isActive ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
              >
                {item.icon}
                {item.label}
              </div>
            );
          })}
        </nav>
        
        <div className="mt-auto">
          <button 
            onClick={() => setIsCaptureOpen(true)} 
            className="w-full py-4 bg-white hover:bg-gray-200 text-black rounded-xl flex items-center justify-center gap-2 font-medium transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transform hover:-translate-y-0.5 active:scale-95"
          >
            <Plus size={20} />
            Capture
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto w-full relative scroll-smooth bg-canvas-bg-dark pt-16 md:pt-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-canvas-bg-dark/90 backdrop-blur-2xl border-t border-white/5 flex justify-around items-center p-2 z-30 pb-safe">
        {navItems.slice(0, 3).map(item => {
           const isActive = location.pathname.startsWith(item.path);
           return (
             <div 
               key={item.label}
               onClick={() => navigate(item.path)}
               className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${isActive ? 'text-white' : 'text-gray-500'}`}
             >
               {item.icon}
               <span className="text-[10px] font-medium">{item.label}</span>
             </div>
           );
        })}
        {/* Floating prominent capture button for mobile */}
        <div className="relative -top-6">
          <button 
            onClick={() => setIsCaptureOpen(true)}
            className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)] transform active:scale-95 transition-transform"
          >
            <Plus size={24} />
          </button>
        </div>
        
        <div onClick={() => navigate('/create')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${location.pathname.startsWith('/create') ? 'text-white' : 'text-gray-500'}`}>
           <PenTool size={20} />
           <span className="text-[10px] font-medium">Create</span>
        </div>
      </nav>
    </div>
  );
}
