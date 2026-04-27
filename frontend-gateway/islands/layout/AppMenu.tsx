import { isMenuOpenSignal, closeMenu, toggleMenu, toggleCapture } from "../../signals/ui.ts";
import { Home, Layers, BookOpen, Plus, User, PenTool, Menu as MenuIcon, X, Network, Layout as LayoutIcon, ChevronRight, Sparkles, Compass, MessageSquare } from "lucide-preact";

interface AppMenuProps {
  currentPath: string;
}

export default function AppMenu({ currentPath }: AppMenuProps) {
  const isOpen = isMenuOpenSignal.value;

  // The Core Cycle Flow: Rooms (Collect) -> Threads (Analyze) -> Create -> Journal (Contemplate) -> Community (Network)
  const cycleNav = [
    { label: 'Rooms', path: '/rooms', icon: <LayoutIcon size={24} />, desc: 'Collect' },
    { label: 'Threads', path: '/threads', icon: <Layers size={24} />, desc: 'Analyze' },
    { label: 'Journal', path: '/journal', icon: <BookOpen size={24} />, desc: 'Contemplate' },
    { label: 'Community', path: '/connections', icon: <Network size={24} />, desc: 'Network' },
  ];

  const secondaryNav = [
    { label: 'Home', path: '/dashboard', icon: <Home size={20} /> },
    { label: 'Mirror', path: '/mirror', icon: <Sparkles size={20} /> },
    { label: 'Profile', path: '/profile', icon: <User size={20} /> },
    { label: 'Settings', path: '/settings', icon: <User size={20} /> },
    { label: 'Quick Actions', path: '/actions', icon: <Compass size={20} /> },
  ];

  const isActive = (path: string) => currentPath.startsWith(path);

  return (
    <>
      {/* UNIVERSAL BOTTOM NAVIGATION (Cycle Bar) */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/90 backdrop-blur-3xl border-t border-white/5 flex justify-between items-center h-20 px-2 md:px-10 z-[60] pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {/* Left Side: Collect & Analyze */}
        <div className="flex flex-1 justify-around items-center h-full max-w-[40%]">
          {cycleNav.slice(0, 2).map(item => (
            <a 
              key={item.label}
              href={item.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 ${isActive(item.path) ? 'text-canvas-primary scale-110' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <div className={isActive(item.path) ? "drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" : ""}>
                {item.icon}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-tighter ${isActive(item.path) ? 'opacity-100' : 'opacity-0 md:opacity-40'}`}>{item.label}</span>
            </a>
          ))}
        </div>

        {/* Center: THE CREATE BUTTON (The Core Action) */}
        <div className="relative -top-6">
          <button 
            type="button"
            onClick={toggleCapture}
            className="w-16 h-16 bg-white text-black rounded-[2rem] flex items-center justify-center shadow-[0_15px_35px_rgba(255,255,255,0.2)] border-4 border-[#0a0a0a] active:scale-90 transition-all hover:scale-105 group"
          >
            <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" />
            <div className="absolute -bottom-8 whitespace-nowrap text-[10px] font-bold text-white uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">Capture</div>
          </button>
        </div>

        {/* Right Side: Contemplate & Network */}
        <div className="flex flex-1 justify-around items-center h-full max-w-[40%]">
          {cycleNav.slice(2, 4).map(item => (
            <a 
              key={item.label}
              href={item.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 ${isActive(item.path) ? 'text-canvas-primary scale-110' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <div className={isActive(item.path) ? "drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" : ""}>
                {item.icon}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-tighter ${isActive(item.path) ? 'opacity-100' : 'opacity-0 md:opacity-40'}`}>{item.label}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* DRAWER MENU (Secondary Actions) */}
      <div 
        className={`fixed inset-0 z-[70] flex justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div 
          onClick={closeMenu}
          className="absolute inset-0 bg-canvas-bg-dark/60 backdrop-blur-md cursor-pointer"
        />

        <div 
          className={`relative w-full max-w-[280px] h-full bg-[#111111] border-l border-white/5 shadow-2xl flex flex-col p-8 overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-[10px] font-bold text-canvas-primary uppercase tracking-[0.3em]">System Menu</h2>
            <button type="button" onClick={closeMenu} className="p-2 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {secondaryNav.map(item => {
              const active = isActive(item.path);
              return (
                <a 
                  key={item.label}
                  href={item.path}
                  onClick={closeMenu}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-canvas-primary/10 text-canvas-primary border border-canvas-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                >
                  {item.icon}
                  <span className="text-sm font-bold tracking-tight">{item.label}</span>
                </a>
              );
            })}
          </nav>

          <div className="mt-auto pt-10 border-t border-white/5">
             <div className="bg-canvas-primary/5 rounded-3xl p-5 border border-canvas-primary/10">
                <p className="text-[10px] font-bold text-canvas-primary uppercase tracking-widest mb-2">Mirror Intelligence</p>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">Your semantic patterns are being analyzed in real-time.</p>
                <a href="/mirror" className="inline-flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest hover:gap-3 transition-all">
                  Open Insights <ChevronRight size={14} />
                </a>
             </div>
             <p className="mt-8 text-center text-[9px] font-bold text-gray-700 uppercase tracking-widest">Muse 2.0 • Secured</p>
          </div>
        </div>
      </div>
    </>
  );
}

