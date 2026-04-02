import { isMenuOpenSignal, closeMenu, toggleMenu, toggleCapture } from "../signals/ui.ts";
import { Home, Layers, BookOpen, Plus, User, PenTool, Menu as MenuIcon, X, Network, Layout as LayoutIcon, ChevronRight, Sparkles, Compass } from "lucide-preact";

interface AppMenuProps {
  currentPath: string;
}

export default function AppMenu({ currentPath }: AppMenuProps) {
  const isOpen = isMenuOpenSignal.value;

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: <Home size={22} />, desc: 'Your central flow' },
    { label: 'Create', path: '/create', icon: <PenTool size={22} />, desc: 'Start a new flow' },
    { label: 'Rooms', path: '/rooms', icon: <LayoutIcon size={22} />, desc: 'Your collection spaces' },
    { label: 'Threads', path: '/threads', icon: <Layers size={22} />, desc: 'Thematic syntheses' },
    { label: 'Journal', path: '/journal', icon: <BookOpen size={22} />, desc: 'Private introspection' },
  ];

  const secondaryNav = [
    { label: 'Profile', path: '/profile', icon: <User size={20} /> },
    { label: 'Community', path: '/connections', icon: <Network size={20} /> },
    { label: 'Quick Actions', path: '/actions', icon: <Compass size={20} /> },
    { label: 'Mirror', path: '/mirror', icon: <Sparkles size={20} /> },
    { label: 'Settings', path: '/settings', icon: <User size={20} /> },
  ];

  const isActive = (path: string) => currentPath.startsWith(path);

  return (
    <>
      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-canvas-bg-dark/95 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center h-20 px-4 z-40 pb-safe">
        <a 
          href="/dashboard"
          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${isActive('/dashboard') ? 'text-canvas-primary scale-110' : 'text-gray-500'}`}
        >
          <Home size={22} />
        </a>
        
        <button 
          type="button"
          onClick={toggleCapture}
          className="relative -top-10 w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-4 border-canvas-bg-dark active:scale-90 transition-transform"
        >
          <Plus size={28} />
        </button>

        <button 
          type="button"
          onClick={toggleMenu}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${isOpen ? 'text-canvas-primary' : 'text-gray-500'}`}
        >
          <MenuIcon size={24} />
        </button>
      </nav>

      {/* DRAWER MENU */}
      <div 
        className={`fixed inset-0 z-[60] flex justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div 
          onClick={closeMenu}
          className="absolute inset-0 bg-canvas-bg-dark/40 backdrop-blur-md cursor-pointer"
        />

        {/* Drawer */}
        <div 
          className={`relative w-full max-w-sm md:max-w-md h-full bg-[#111111] border-l border-white/5 shadow-2xl flex flex-col p-8 md:p-12 overflow-y-auto transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-[10px] font-bold text-canvas-primary uppercase tracking-[0.3em] mb-1">Navigation</h2>
              <h3 className="text-2xl font-bold tracking-tight text-white">Choose Intent</h3>
            </div>
            <button type="button" onClick={closeMenu} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-white transition-all cursor-pointer">
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-3 flex-1">
            {navItems.map(item => {
              const active = isActive(item.path);
              return (
                <a 
                  key={item.label}
                  href={item.path}
                  onClick={closeMenu}
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
                </a>
              );
            })}

            <div className="h-px bg-white/5 my-6" />

            <div className="grid grid-cols-2 gap-3">
              {secondaryNav.map(item => (
                <a 
                  key={item.label}
                  href={item.path}
                  onClick={closeMenu}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all text-gray-500 hover:text-white ${isActive(item.path) ? 'border-canvas-primary/40 bg-canvas-primary/5 text-canvas-primary' : ''}`}
                >
                  {item.icon}
                  <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                </a>
              ))}
            </div>
          </nav>

          <div className="pt-10 flex flex-col gap-4">
            <button 
              type="button"
              onClick={() => { toggleCapture(); closeMenu(); }}
              className="w-full group py-5 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-3xl flex justify-center items-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] hover:-translate-y-1 active:scale-95 transition-all"
            >
              <Plus size={18} /> Deep Capture
            </button>
            <div className="text-center">
              <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">Muse 2.0 • Edge Native</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
