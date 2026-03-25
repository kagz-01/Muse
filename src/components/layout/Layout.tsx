import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Home, Layers, BookOpen, Plus, User, PenTool, Menu, X, Settings, Shield, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CaptureModal from '../modals/CaptureModal';
import { useUserStore } from '../../store/useUserStore';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { soloMode, toggleSoloMode } = useUserStore();

  const navItems = [
    { label: 'Rooms', path: '/rooms', icon: <Home size={20} /> },
    { label: 'Threads', path: '/threads', icon: <Layers size={20} /> },
    { label: 'Journal', path: '/journal', icon: <BookOpen size={20} /> },
    { label: 'Create', path: '/create', icon: <PenTool size={20} /> },
  ];

  return (
    <div className="flex h-screen w-full bg-canvas-bg-dark text-white overflow-hidden pb-16 md:pb-0">
      <CaptureModal isOpen={isCaptureOpen} onClose={() => setIsCaptureOpen(false)} />
      
      {/* Mobile Top Header: Forces Profile icon and Hamburger menus */}
      <header className="md:hidden fixed top-0 w-full z-40 bg-canvas-bg-dark/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 py-4 shadow-xs">
         <h1 className="text-2xl font-bold tracking-tight cursor-pointer" onClick={() => navigate('/dashboard')}>Muse</h1>
         <div className="flex items-center gap-3">
           <button onClick={() => navigate('/settings')} className="text-gray-300 hover:text-white transition-colors bg-white/5 p-2 rounded-full outline-none">
              <User size={18} />
           </button>
           <button onClick={() => setIsMenuOpen(true)} className="p-2 -mr-2 text-gray-300 hover:text-white transition-colors bg-white/5 rounded-full outline-none">
              <Menu size={20} />
           </button>
         </div>
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
            <div className="flex justify-between items-center mb-8 mt-2">
               <h2 className="text-2xl font-bold tracking-tight text-white/50">Navigation</h2>
               <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full">
                 <X size={24} />
               </button>
            </div>
            
            <nav className="flex flex-col gap-2">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-2 mb-1">Spaces</div>
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
              
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-2 mb-1">Manage</div>
              <button 
                  onClick={() => { navigate('/settings'); setIsMenuOpen(false); }}
                  className={`flex items-center justify-start gap-4 p-4 rounded-2xl text-lg font-semibold transition-all ${location.pathname.startsWith('/settings') ? 'bg-canvas-primary text-white shadow-[0_10px_20px_rgba(99,102,241,0.2)]' : 'bg-[#1c1c1c] border border-white/5 text-gray-300 hover:border-white/10'}`}
              >
                  <User size={20} /> Profile
              </button>
              <button 
                  onClick={() => { navigate('/connections'); setIsMenuOpen(false); }}
                  className={`flex items-center justify-start gap-4 p-4 rounded-2xl text-lg font-semibold transition-all ${location.pathname.startsWith('/connections') ? 'bg-canvas-primary text-white shadow-[0_10px_20px_rgba(99,102,241,0.2)]' : 'bg-[#1c1c1c] border border-white/5 text-gray-300 hover:border-white/10'}`}
              >
                  <Network size={20} /> Connections
              </button>
              <button 
                  onClick={toggleSoloMode}
                  className="flex items-center justify-between p-4 rounded-2xl text-lg font-semibold transition-all bg-[#1c1c1c] border border-white/5 text-gray-300 hover:border-white/10"
              >
                  <div className="flex items-center gap-4">
                    <Shield size={20} className={soloMode ? "text-canvas-primary" : ""} /> {soloMode ? "Solo Mode Active" : "Solo Mode Disabled"}
                  </div>
                  <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${soloMode ? 'bg-canvas-primary' : 'bg-gray-700'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${soloMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
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

      {/* Desktop Sidebar: Now featuring a comprehensive Management Menu natively */}
      <aside className="w-64 border-r border-white/5 hidden md:flex flex-col p-4 bg-canvas-bg-dark z-10">
        <div className="flex items-center justify-between mb-8 px-2">
          <h1 className="text-2xl font-bold tracking-tight cursor-pointer hover:text-canvas-primary transition-colors" onClick={() => navigate('/')}>Muse</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto no-scrollbar pb-6 space-y-1">
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest pl-3 mt-2 mb-3">Spaces</div>
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
          
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest pl-3 mt-10 mb-3">Manage</div>
          
          <div 
            onClick={() => navigate('/settings')}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors duration-200 font-medium ${location.pathname.startsWith('/settings') ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
          >
            <User size={20} /> Profile
          </div>
          <div 
            onClick={() => navigate('/connections')}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors duration-200 font-medium ${location.pathname.startsWith('/connections') ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
          >
            <Network size={20} /> Connections
          </div>
          
          <div 
            onClick={toggleSoloMode}
            className="flex items-center justify-between p-3 mt-2 rounded-xl cursor-pointer transition-colors duration-200 font-medium text-gray-500 hover:bg-white/5 hover:text-white group"
          >
             <div className="flex items-center gap-3">
               <Shield size={20} className={`transition-colors ${soloMode ? 'text-gray-400 group-hover:text-white' : ''}`} /> 
               Solo Mode
             </div>
             <div className={`w-8 h-4 rounded-full flex items-center px-0.5 transition-colors ${soloMode ? 'bg-canvas-primary' : 'bg-gray-700'}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${soloMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
             </div>
          </div>
        </nav>
        
        <div className="mt-auto pt-4 border-t border-white/5">
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

      {/* Mobile Bottom Navigation Component */}
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
