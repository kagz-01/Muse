import {
  Search,
  Menu as MenuIcon,
  Bell,
  Sparkles,
  Sun,
  Moon,
  Circle,
  CloudSun,
} from "lucide-preact";
import { useEffect, useRef } from "preact/hooks";
import { userSignal } from "../../signals/user.ts";
import {
  closeNotifications,
  initializeTheme,
  isNotificationsOpenSignal,
  markAllNotificationsRead,
  markNotificationRead,
  notificationsSignal,
  toggleMenu,
  toggleNotifications,
  toggleTheme,
  appThemeSignal,
  AppNotification
} from "../../signals/ui.ts";
import WalletConnectButton from "../WalletConnectButton.tsx";

export default function AppHeader({ _currentPath }: { _currentPath?: string }) {
  const isNotificationsOpen = isNotificationsOpenSignal.value;
  const currentTheme = appThemeSignal.value;
  const notifications = notificationsSignal.value;
  const unreadCount = notifications.filter((n: AppNotification) => !n.isRead).length;
  const notificationPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeTheme();
  }, []);

  useEffect(() => {
    if (!isNotificationsOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!notificationPanelRef.current?.contains(target)) {
        closeNotifications();
      }
    };

    globalThis.document?.addEventListener("mousedown", handleClickOutside);
    return () => {
      globalThis.document?.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationsOpen]);

  const user = userSignal.value;
  const isDemo = user?.email === "demo@muse.app";

  return (
    <header className={`fixed top-0 left-0 w-full z-50 bg-[var(--muse-overlay)] backdrop-blur-3xl border-b border-white/5 transition-all duration-500 ${isDemo ? 'pt-8' : ''}`}>
      {isDemo && (
        <div className="absolute top-0 left-0 w-full h-8 bg-canvas-primary/10 border-b border-canvas-primary/20 flex items-center justify-center gap-4 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-canvas-primary animate-pulse">Observer Mode: Limited Persistence</p>
          <div className="h-3 w-px bg-canvas-primary/20" />
          <button 
            type="button"
            onClick={() => globalThis.location.href = '/'}
            className="text-[9px] font-bold uppercase tracking-widest text-white hover:text-canvas-primary transition-colors cursor-pointer"
          >
            Register to Establish Soul Link
          </button>
        </div>
      )}
      <div className="flex items-center justify-between px-6 md:px-10 h-20">
        <div className="flex items-center gap-6">
          <a
            href="/dashboard"
            className="cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
               <Sparkles size={20} className="text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white leading-none">Muse</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-canvas-primary mt-1">Intelligence</span>
            </div>
          </a>

          <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/8 rounded-full text-gray-500 cursor-text hover:border-white/20 transition-all min-w-[320px]">
            <Search size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Search your collective consciousness...</span>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          {/* Mirror Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-canvas-primary/5 border border-canvas-primary/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-canvas-primary animate-pulse" />
            <span className="text-[9px] font-bold text-canvas-primary uppercase tracking-widest">Mirror Active</span>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-white/20 flex items-center justify-center transition-all text-gray-400 hover:text-white"
            title={`Switch to next theme (Current: ${currentTheme})`}
          >
            {currentTheme === 'dark' && <Moon size={16} />}
            {currentTheme === 'dim' && <Circle size={14} fill="currentColor" />}
            {currentTheme === 'tint' && <CloudSun size={16} />}
            {currentTheme === 'light' && <Sun size={16} fill="currentColor" />}
          </button>

          <div className="relative" ref={notificationPanelRef}>
            <button
              type="button"
              onClick={toggleNotifications}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative ${
                unreadCount > 0
                  ? "bg-canvas-primary/20 border border-canvas-primary/45"
                  : "bg-white/5 border border-white/10 hover:border-white/20"
              }`}
            >
              <Bell size={16} className={unreadCount > 0 ? "text-canvas-primary" : "text-gray-400"} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-canvas-primary border-2 border-[#0a0a0a]" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-4 w-[340px] rounded-[2.5rem] border border-white/10 bg-[#111111] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4">
                <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-canvas-primary">Signals</h4>
                  <button type="button" onClick={markAllNotificationsRead} className="text-[9px] font-bold uppercase text-gray-500 hover:text-white transition-colors">Dismiss All</button>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center text-gray-600 text-xs italic">No active signals.</div>
                  ) : notifications.map((n) => (
                    <button type="button" key={n.id} onClick={() => markNotificationRead(n.id)} className="w-full p-6 text-left border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <p className="text-sm font-bold text-white mb-1">{n.title}</p>
                      <p className="text-[11px] text-gray-500 leading-relaxed">{n.detail}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:block">
            <WalletConnectButton />
          </div>

          <button
            onClick={toggleMenu}
            type="button"
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-canvas-primary transition-all shadow-lg active:scale-95"
          >
            <MenuIcon size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
