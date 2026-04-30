import { isMenuOpenSignal, closeMenu, toggleCapture, setAccentColor, appAccentSignal, AppAccentColor } from "../../signals/ui.ts";
import { BookOpen, Plus, X, Network, Layout as LayoutIcon, ChevronRight, Sparkles, Activity, Shield, Wallet, Download, Settings as SettingsIcon } from "lucide-preact";
import { userSignal } from "../../signals/user.ts";

interface AppMenuProps {
  currentPath: string;
}

export default function AppMenu({ currentPath }: AppMenuProps) {
  const isOpen = isMenuOpenSignal.value;

  const user = userSignal.value;

  // Muse 2.0 Unified Lifecycle Flow
  const cycleNav = [
    { label: 'Pulse', path: '/dashboard', icon: <Sparkles size={24} />, desc: 'Awareness' },
    { label: 'Vault', path: '/rooms', icon: <LayoutIcon size={24} />, desc: 'Collection' },
    { label: 'Journal', path: '/journal', icon: <BookOpen size={24} />, desc: 'Contemplate' },
    { label: 'Network', path: '/connections', icon: <Network size={24} />, desc: 'Collective' },
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

        {/* Center: THE SYNTHESIS ENGINE */}
        <div className="relative -top-8">
          <div className="absolute inset-0 bg-canvas-primary/20 blur-2xl rounded-full animate-pulse" />
          <button 
            type="button"
            onClick={toggleCapture}
            className="relative w-16 h-16 bg-white text-black rounded-[2rem] flex items-center justify-center shadow-[0_20px_40px_rgba(255,255,255,0.2)] border-4 border-[#0a0a0a] active:scale-90 transition-all hover:scale-105 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-canvas-primary/5 group-hover:bg-canvas-primary/10 transition-colors" />
            <Plus size={32} className="relative z-10 group-hover:rotate-90 transition-transform duration-500" />
            <div className="absolute -bottom-8 whitespace-nowrap text-[9px] font-bold text-white uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">Synthesize</div>
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

          <div className="space-y-6">
            {/* PROFILE WIDGET */}
            <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10">
              <div className="flex items-center gap-4 mb-5">
                <img src={user?.avatarUrl} className="w-14 h-14 rounded-2xl object-cover border border-white/10" alt="" />
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{user?.name}</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user?.username}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <a href="/profile" onClick={closeMenu} className="flex items-center justify-between p-3 rounded-xl bg-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all">
                  Manage Persona <ChevronRight size={14} />
                </a>
              </div>
            </div>

            {/* LEDGER & PRIVACY WIDGET */}
            <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield size={16} className="text-canvas-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Visibility</span>
                </div>
                <span className="text-[9px] font-bold px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg uppercase tracking-widest border border-emerald-500/20">Public</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet size={16} className="text-canvas-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ledger Status</span>
                </div>
                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Secured</span>
              </div>
            </div>

            {/* AURA WIDGET */}
            <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">System Aura</span>
                <span className="text-[9px] font-bold text-canvas-primary uppercase tracking-widest">Resonance</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {(['cyan', 'blue', 'purple', 'pink', 'green', 'yellow', 'red', 'white'] as AppAccentColor[]).map(color => (
                  <button 
                    type="button"
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={`w-6 h-6 rounded-full border transition-all hover:scale-110 active:scale-90 ${appAccentSignal.value === color ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'border-white/10'}`}
                    style={{ backgroundColor: color === 'white' ? '#f1f5f9' : color }}
                  />
                ))}
              </div>
            </div>

            {/* SYSTEM CONTROLS */}
            <div className="grid grid-cols-2 gap-3">
              <a href="/settings" onClick={closeMenu} className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-white/20 transition-all text-gray-400 hover:text-white">
                <SettingsIcon size={20} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Settings</span>
              </a>
              <button type="button" className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-white/20 transition-all text-gray-400 hover:text-white cursor-pointer">
                <Download size={20} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Export Soul</span>
              </button>
            </div>
          </div>

          <div className="mt-auto pt-8">
             <div className="bg-gradient-to-br from-canvas-primary/10 to-transparent rounded-3xl p-6 border border-canvas-primary/20">
                <p className="text-[10px] font-bold text-canvas-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <Activity size={12} /> Mirror Sync
                </p>
                <p className="text-[11px] text-gray-400 leading-relaxed mb-4 font-serif italic">Your digital soul is synchronizing with the collective consciousness.</p>
                <a href="/mirror" onClick={closeMenu} className="text-[9px] font-bold text-white uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                  Deep Intelligence <ChevronRight size={14} />
                </a>
             </div>
             <p className="mt-8 text-center text-[8px] font-bold text-gray-800 uppercase tracking-[0.4em]">Muse v2.0 • Phase Alpha</p>
          </div>
        </div>
      </div>
    </>
  );
}

