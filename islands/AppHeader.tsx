import { Search, Menu as MenuIcon } from "lucide-preact";
import { userSignal } from "../signals/user.ts";
import { toggleMenu, toggleProfile } from "../signals/ui.ts";
import PrivacyBadge from "./PrivacyBadge.tsx";

export default function AppHeader() {
  const user = userSignal.value;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-canvas-bg-dark/90 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-6 md:px-10 py-4 h-20 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-8">
        <a 
          href="/dashboard"
          className="cursor-pointer flex items-center gap-2 group" 
        >
          <img 
            src="/assets/muse-logo.png" 
            alt="Muse" 
            className="h-9 w-9 object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
          />
          <span className="text-xl font-bold tracking-tight group-hover:text-canvas-primary transition-colors">Muse</span>
        </a>

        {/* Desktop Quick Search Placeholder */}
        <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/8 rounded-full text-gray-500 cursor-text hover:border-white/20 transition-all">
           <Search size={16} />
           <span className="text-xs font-bold uppercase tracking-widest">Search deep artifacts...</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Privacy Switcher */}
        <div className="hidden sm:block">
           <PrivacyBadge />
        </div>

        <div className="flex items-center gap-4">
          {/* Clickable Profile Avatar */}
          <button 
            onClick={toggleProfile}
            type="button"
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
            onClick={toggleMenu}
            type="button"
            className="group p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-canvas-primary/40 transition-all outline-none"
          >
             <MenuIcon size={22} className="text-gray-300 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
}
