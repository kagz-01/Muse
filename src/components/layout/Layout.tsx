import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Home, Layers, BookOpen, Plus, User, PenTool } from 'lucide-react';
import CaptureModal from '../modals/CaptureModal';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);

  const navItems = [
    { label: 'Rooms', path: '/dashboard', icon: <Home size={20} /> },
    { label: 'Threads', path: '/threads', icon: <Layers size={20} /> },
    { label: 'Journal', path: '/journal', icon: <BookOpen size={20} /> },
    { label: 'Create', path: '/create', icon: <PenTool size={20} /> },
  ];

  return (
    <div className="flex h-screen w-full bg-canvas-bg-dark text-white overflow-hidden pb-16 md:pb-0">
      <CaptureModal isOpen={isCaptureOpen} onClose={() => setIsCaptureOpen(false)} />
      
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-white/5 hidden md:flex flex-col p-4 bg-canvas-bg-dark">
        <div className="flex items-center justify-between mb-8 px-2">
          <h1 className="text-2xl font-bold tracking-tight cursor-pointer" onClick={() => navigate('/')}>Muse</h1>
          <User size={20} className="text-gray-400 cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/settings')} />
        </div>
        
        <nav className="flex-1 space-y-1 mt-4">
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
            className="w-full py-4 bg-white hover:bg-gray-200 text-black rounded-xl flex items-center justify-center gap-2 font-medium transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transform hover:-translate-y-0.5"
          >
            <Plus size={20} />
            Capture
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto w-full relative scroll-smooth bg-canvas-bg-dark">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#0a0a0a]/90 backdrop-blur-2xl border-t border-white/5 flex justify-around items-center p-2 z-50 pb-safe">
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
