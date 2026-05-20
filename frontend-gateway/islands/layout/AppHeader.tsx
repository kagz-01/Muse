import {
  Bell,
  Circle,
  CloudSun,
  Menu as MenuIcon,
  Moon,
  Search,
  Sun,
} from "lucide-preact";
import { useEffect, useRef } from "preact/hooks";
import { userSignal } from "../../signals/user.ts";
import {
  AppNotification,
  appThemeSignal,
  closeNotifications,
  initializeTheme,
  isNotificationsOpenSignal,
  markAllNotificationsRead,
  markNotificationRead,
  notificationsSignal,
  toggleMenu,
  toggleNotifications,
  toggleTheme,
} from "../../signals/ui.ts";
import WalletConnectButton from "../WalletConnectButton.tsx";

export default function AppHeader(
  { currentPath: _currentPath }: { currentPath?: string },
) {
  const isNotificationsOpen = isNotificationsOpenSignal.value;
  const currentTheme = appThemeSignal.value;
  const notifications = notificationsSignal.value;
  const unreadCount =
    notifications.filter((n: AppNotification) => !n.isRead).length;
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
    <header
      className={`fixed top-0 left-0 w-full z-50 bg-[var(--muse-overlay)] backdrop-blur-3xl border-b border-[var(--muse-border)] transition-all duration-500 ${
        isDemo ? "pt-8" : ""
      }`}
    >
      {isDemo && (
        <div className="absolute top-0 left-0 w-full h-8 bg-canvas-primary/10 border-b border-canvas-primary/20 flex items-center justify-center gap-4 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-canvas-primary animate-pulse">
            Observer Mode: Limited Persistence
          </p>
          <div className="h-3 w-px bg-canvas-primary/20" />
          <button
            type="button"
            onClick={() => globalThis.location.href = "/"}
            className="text-[9px] font-bold uppercase tracking-widest text-[var(--muse-text)] hover:text-canvas-primary transition-colors cursor-pointer"
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
            <div className="w-10 h-10 bg-[var(--muse-surface)] rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all duration-500 shadow-2xl border border-[var(--muse-border)] overflow-hidden p-1.5">
              <img
                src="/assets/muse-logo.png"
                alt="Muse Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[var(--muse-text)] leading-none transition-colors duration-300">
                Muse
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-canvas-primary mt-1">
                Intelligence
              </span>
            </div>
          </a>

          <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 bg-[var(--muse-surface)] border border-[var(--muse-border)] rounded-full text-[var(--muse-muted)] cursor-text hover:border-[var(--muse-text)]/20 transition-all duration-300 min-w-[320px]">
            <Search size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Search your collective consciousness...
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          {/* Mirror Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-canvas-primary/5 border border-canvas-primary/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-canvas-primary animate-pulse" />
            <span className="text-[9px] font-bold text-canvas-primary uppercase tracking-widest">
              Mirror Active
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-[var(--muse-surface)] border border-[var(--muse-border)] hover:border-[var(--muse-text)]/20 flex items-center justify-center transition-all text-[var(--muse-muted)] hover:text-[var(--muse-text)] duration-300"
            title={`Switch to next theme (Current: ${currentTheme})`}
          >
            {currentTheme === "dark" && <Moon size={16} />}
            {currentTheme === "dim" && <Circle size={14} fill="currentColor" />}
            {currentTheme === "tint" && <CloudSun size={16} />}
            {currentTheme === "light" && <Sun size={16} fill="currentColor" />}
          </button>

          <div className="relative" ref={notificationPanelRef}>
            <button
              type="button"
              onClick={toggleNotifications}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative ${
                unreadCount > 0
                  ? "bg-canvas-primary/20 border border-canvas-primary/45"
                  : "bg-[var(--muse-surface)] border border-[var(--muse-border)] hover:border-[var(--muse-text)]/20 duration-300"
              }`}
            >
              <Bell
                size={16}
                className={unreadCount > 0
                  ? "text-canvas-primary"
                  : "text-[var(--muse-muted)]"}
              />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-canvas-primary border-2 border-[var(--muse-bg)]" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-4 w-[340px] rounded-[2.5rem] border border-[var(--muse-border)] bg-[var(--muse-surface)] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 transition-colors duration-300">
                <div className="px-6 py-5 border-b border-[var(--muse-border)] flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-canvas-primary">
                    Signals
                  </h4>
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-[9px] font-bold uppercase text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-colors duration-300"
                  >
                    Dismiss All
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0
                    ? (
                      <div className="p-10 text-center text-[var(--muse-muted)] text-xs italic">
                        No active signals.
                      </div>
                    )
                    : notifications.map((n) => (
                      <button
                        type="button"
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className="w-full p-6 text-left border-b border-[var(--muse-border)] hover:bg-[var(--muse-surface-soft)] transition-colors duration-300"
                      >
                        <p className="text-sm font-bold text-[var(--muse-text)] mb-1">
                          {n.title}
                        </p>
                        <p className="text-[11px] text-[var(--muse-muted)] leading-relaxed">
                          {n.detail}
                        </p>
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
            className="w-10 h-10 rounded-full bg-[var(--muse-surface)] border border-[var(--muse-border)] flex items-center justify-center text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:border-canvas-primary transition-all shadow-lg active:scale-95 duration-300"
          >
            <MenuIcon size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
