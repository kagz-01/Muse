import {
  AppAccentColor,
  appAccentSignal,
  closeMenu,
  isMenuOpenSignal,
  setAccentColor,
} from "../../signals/ui.ts";
import * as Icons from "lucide-preact";
import { userSignal } from "../../signals/user.ts";
import NotificationContainer from "../../components/notifications/NotificationContainer.tsx";

interface AppMenuProps {
  currentPath: string;
}

export default function AppMenu({ currentPath }: AppMenuProps) {
  const isOpen = isMenuOpenSignal.value;

  const user = userSignal.value;
  const isDemo = user?.email === "demo@muse.app";

  // Muse 2.0 Unified Lifecycle Flow
  const cycleNav = [
    {
      label: "Home",
      path: "/dashboard",
      icon: <Icons.Home size={24} />,
      desc: "Awareness",
    },
    {
      label: "Rooms",
      path: "/rooms",
      icon: <Icons.Layout size={24} />,
      desc: "Collection",
    },
    {
      label: "Threads",
      path: "/threads",
      icon: <Icons.GitCommit size={24} />,
      desc: "Synthesize",
    },
    {
      label: "Journal",
      path: "/journal",
      icon: <Icons.BookOpen size={24} />,
      desc: "Contemplate",
    },
    {
      label: "Community",
      path: "/connections",
      icon: <Icons.Users size={24} />,
      desc: "Collective",
    },
  ];

  const isActive = (path: string) => currentPath.startsWith(path);

  return (
    <>
      {/* UNIVERSAL BOTTOM NAVIGATION (Cycle Bar) */}
      <nav className="fixed bottom-0 left-0 w-full bg-[var(--muse-surface)]/90 backdrop-blur-3xl border-t border-[var(--muse-border)] flex justify-around items-center h-20 px-4 md:px-32 z-[60] pb-safe transition-all duration-300">
        {cycleNav.map((item) => (
          <a
            key={item.label}
            href={item.path}
            className={`group flex flex-col items-center gap-1.5 py-1 px-4 rounded-2xl transition-all duration-300 ${
              isActive(item.path)
                ? "text-[var(--muse-text)] scale-110"
                : "text-[var(--muse-muted)] hover:text-[var(--muse-text)]"
            }`}
          >
            <div
              className={isActive(item.path)
                ? "drop-shadow-[0_0_12px_rgba(var(--muse-accent-rgb),0.8)] text-canvas-primary transition-all duration-300"
                : "group-hover:drop-shadow-[0_0_8px_rgba(var(--muse-accent-rgb),0.4)] transition-all duration-300"}
            >
              {item.icon}
            </div>
            <span
              className={`text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${
                isActive(item.path)
                  ? "opacity-100 text-[var(--muse-text)] drop-shadow-[0_0_8px_rgba(var(--muse-accent-rgb),0.5)]"
                  : "opacity-60 group-hover:opacity-100"
              }`}
            >
              {item.label}
            </span>
          </a>
        ))}
      </nav>

      {/* DRAWER MENU (Secondary Actions) */}
      <div
        className={`fixed inset-0 z-[70] flex justify-end transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          onClick={closeMenu}
          className="absolute inset-0 bg-[var(--muse-bg)]/60 backdrop-blur-md cursor-pointer"
        />

        <div
          className={`relative w-full max-w-[280px] h-full bg-[var(--muse-surface)] border-l border-[var(--muse-border)] shadow-2xl flex flex-col p-8 overflow-y-auto transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-[10px] font-bold text-canvas-primary uppercase tracking-[0.3em]">
              System Menu
            </h2>
            <button
              type="button"
              onClick={closeMenu}
              className="p-2 bg-[var(--muse-surface-soft)] rounded-xl text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-all cursor-pointer duration-300"
            >
              <Icons.X size={20} />
            </button>
          </div>

          <div className="flex flex-col flex-1">
            {/* PROFILE HEAD */}
            <div className="flex items-center gap-4 mb-8 px-2">
              <img
                src={user?.avatarUrl}
                className="w-12 h-12 rounded-full object-cover border border-[var(--muse-border)]"
                alt=""
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[var(--muse-text)] tracking-tight truncate">
                  {user?.name}
                </h3>
                <p className="text-[10px] text-[var(--muse-muted)] font-bold uppercase tracking-widest truncate">
                  {user?.username}
                </p>
              </div>
            </div>

            {/* MAIN NAVIGATION LIST */}
            <div className="flex flex-col gap-1 space-y-1">
              <a
                href={isDemo ? "/" : "/profile"}
                onClick={closeMenu}
                className="flex items-center gap-4 p-3 rounded-2xl text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:bg-[var(--muse-surface-soft)] transition-colors"
              >
                <Icons.Users size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {isDemo ? "Establish Soul Link" : "Profile"}
                </span>
              </a>

              <a
                href={isDemo ? "/" : "/settings"}
                onClick={isDemo
                  ? (e) => {
                    e.preventDefault();
                    globalThis.location.href = "/";
                  }
                  : closeMenu}
                className="flex items-center gap-4 p-3 rounded-2xl text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:bg-[var(--muse-surface-soft)] transition-colors relative"
              >
                <Icons.Settings size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Settings
                </span>
                {isDemo && (
                  <Icons.Lock
                    size={12}
                    className="absolute right-4 opacity-50"
                  />
                )}
              </a>

              <button
                type="button"
                onClick={isDemo
                  ? () => globalThis.location.href = "/"
                  : undefined}
                className="flex items-center gap-4 p-3 w-full rounded-2xl text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:bg-[var(--muse-surface-soft)] transition-colors cursor-pointer relative"
              >
                <Icons.Shield size={20} />
                <span className="text-xs font-bold uppercase tracking-widest text-left flex-1">
                  Security & Ledger
                </span>
                {isDemo && (
                  <Icons.Lock
                    size={12}
                    className="absolute right-4 opacity-50"
                  />
                )}
              </button>

              <button
                type="button"
                onClick={isDemo
                  ? () => globalThis.location.href = "/"
                  : undefined}
                className="flex items-center gap-4 p-3 w-full rounded-2xl text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:bg-[var(--muse-surface-soft)] transition-colors cursor-pointer relative"
              >
                <Icons.Download size={20} />
                <span className="text-xs font-bold uppercase tracking-widest text-left flex-1">
                  Export Data
                </span>
                {isDemo && (
                  <Icons.Lock
                    size={12}
                    className="absolute right-4 opacity-50"
                  />
                )}
              </button>
            </div>

            {/* THEME SELECTOR MINI */}
            <div className="mt-8 px-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--muse-muted)] mb-3 block px-1">
                System Resonance
              </span>
              <div className="flex flex-wrap gap-2">
                {([
                  "cyan",
                  "blue",
                  "purple",
                  "pink",
                  "green",
                  "yellow",
                  "red",
                  "white",
                ] as AppAccentColor[]).map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={`w-5 h-5 rounded-full border transition-all hover:scale-110 active:scale-90 ${
                      appAccentSignal.value === color
                        ? "border-[var(--muse-text)] scale-110 shadow-md"
                        : "border-transparent"
                    }`}
                    style={{
                      backgroundColor: color === "white" ? "#f1f5f9" : color,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-auto pt-8 pb-4 px-2">
              <p className="text-center text-[8px] font-bold text-[var(--muse-muted)] opacity-50 uppercase tracking-[0.4em]">
                Muse v2.0 • Phase Alpha
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Container */}
      <NotificationContainer />
    </>
  );
}
