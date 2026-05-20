import {
  AppAccentColor,
  appAccentSignal,
  closeMenu,
  isMenuOpenSignal,
  setAccentColor,
} from "../../signals/ui.ts";
import {
  Activity,
  BookOpen,
  ChevronRight,
  Download,
  GitCommit,
  Home as HomeIcon,
  Layout as LayoutIcon,
  Lock,
  Settings as SettingsIcon,
  Shield,
  Users as UsersIcon,
  Wallet,
  X,
} from "lucide-preact";
import { userSignal } from "../../signals/user.ts";

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
      icon: <HomeIcon size={24} />,
      desc: "Awareness",
    },
    {
      label: "Rooms",
      path: "/rooms",
      icon: <LayoutIcon size={24} />,
      desc: "Collection",
    },
    {
      label: "Threads",
      path: "/threads",
      icon: <GitCommit size={24} />,
      desc: "Synthesize",
    },
    {
      label: "Journal",
      path: "/journal",
      icon: <BookOpen size={24} />,
      desc: "Contemplate",
    },
    {
      label: "Community",
      path: "/connections",
      icon: <UsersIcon size={24} />,
      desc: "Collective",
    },
  ];

  const isActive = (path: string) => currentPath.startsWith(path);

  return (
    <>
      {/* UNIVERSAL BOTTOM NAVIGATION (Cycle Bar) */}
      <nav className="fixed bottom-0 left-0 w-full bg-[var(--muse-overlay)] backdrop-blur-3xl border-t border-[var(--muse-border)] flex justify-around items-center h-20 px-4 md:px-32 z-[60] pb-safe transition-all duration-300">
        {cycleNav.map((item) => (
          <a
            key={item.label}
            href={item.path}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all duration-300 ${
              isActive(item.path)
                ? "text-canvas-primary scale-110"
                : "text-[var(--muse-muted)] hover:text-[var(--muse-text)]"
            }`}
          >
            <div
              className={isActive(item.path)
                ? "drop-shadow-[0_0_8px_rgba(212,168,83,0.35)]"
                : ""}
            >
              {item.icon}
            </div>
            <span
              className={`text-[9px] font-bold uppercase tracking-widest ${
                isActive(item.path)
                  ? "opacity-100 text-canvas-primary"
                  : "opacity-40 hover:opacity-100"
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
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* PROFILE WIDGET */}
            <div className="bg-[var(--muse-surface-soft)] rounded-[2rem] p-6 border border-[var(--muse-border)] transition-all duration-300">
              <div className="flex items-center gap-4 mb-5">
                <img
                  src={user?.avatarUrl}
                  className="w-14 h-14 rounded-2xl object-cover border border-[var(--muse-border)] transition-all duration-300"
                  alt=""
                />
                <div>
                  <h3 className="text-sm font-bold text-[var(--muse-text)] tracking-tight transition-colors duration-300">
                    {user?.name}
                  </h3>
                  <p className="text-[10px] text-[var(--muse-muted)] font-bold uppercase tracking-widest transition-colors duration-300">
                    {user?.username}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={isDemo ? "/" : "/profile"}
                  onClick={closeMenu}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--muse-surface)] text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-all duration-300"
                >
                  {isDemo ? "Establish Soul Link" : "Manage Persona"}{" "}
                  <ChevronRight size={14} />
                </a>
              </div>
            </div>

            {isDemo && (
              <div className="bg-canvas-primary/5 border border-canvas-primary/20 rounded-[2rem] p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Activity size={16} className="text-canvas-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-canvas-primary">
                    Observer Mode
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muse-muted)] leading-relaxed font-serif italic transition-colors duration-300">
                  You are observing a sample consciousness. Actions are
                  temporary.
                </p>
                <button
                  type="button"
                  onClick={() => globalThis.location.href = "/"}
                  className="w-full py-3 bg-canvas-primary text-white text-[9px] font-bold uppercase tracking-widest rounded-xl shadow-lg hover:shadow-canvas-primary/20 transition-all cursor-pointer"
                >
                  Register to Save
                </button>
              </div>
            )}

            {/* LEDGER & PRIVACY WIDGET */}
            <div className="bg-[var(--muse-surface-soft)] rounded-[2rem] p-6 border border-[var(--muse-border)] space-y-5 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield size={16} className="text-canvas-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)] transition-colors duration-300">
                    Visibility
                  </span>
                </div>
                <span className="text-[9px] font-bold px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg uppercase tracking-widest border border-emerald-500/20">
                  Public
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet size={16} className="text-canvas-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)] transition-colors duration-300">
                    Ledger Status
                  </span>
                </div>
                <span className="text-[9px] font-bold text-[var(--muse-muted)] uppercase tracking-widest transition-colors duration-300">
                  Secured
                </span>
              </div>
            </div>

            {/* AURA WIDGET */}
            <div className="bg-[var(--muse-surface-soft)] rounded-[2rem] p-6 border border-[var(--muse-border)] transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)] transition-colors duration-300">
                  System Aura
                </span>
                <span className="text-[9px] font-bold text-canvas-primary uppercase tracking-widest">
                  Resonance
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
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
                    className={`w-6 h-6 rounded-full border transition-all hover:scale-110 active:scale-90 ${
                      appAccentSignal.value === color
                        ? "border-[var(--muse-text)] scale-110 shadow-2xl"
                        : "border-[var(--muse-border)]"
                    }`}
                    style={{
                      backgroundColor: color === "white" ? "#f1f5f9" : color,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* SYSTEM CONTROLS */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={isDemo ? "/" : "/settings"}
                onClick={isDemo
                  ? (e) => {
                    e.preventDefault();
                    globalThis.location.href = "/";
                  }
                  : closeMenu}
                className={`relative flex flex-col items-center gap-3 p-5 rounded-3xl border transition-all duration-300 ${
                  isDemo
                    ? "bg-[var(--muse-surface-soft)]/20 border-[var(--muse-border)] text-[var(--muse-muted)] opacity-60"
                    : "bg-[var(--muse-surface-soft)] border border-[var(--muse-border)] hover:border-[var(--muse-text)]/20 text-[var(--muse-muted)] hover:text-[var(--muse-text)]"
                }`}
              >
                {isDemo && (
                  <Lock
                    size={12}
                    className="absolute top-4 right-4 text-[var(--muse-muted)]"
                  />
                )}
                <SettingsIcon size={20} />
                <span className="text-[9px] font-bold uppercase tracking-widest">
                  {isDemo ? "Unlock" : "Settings"}
                </span>
              </a>
              <button
                type="button"
                onClick={isDemo
                  ? () => globalThis.location.href = "/"
                  : undefined}
                className={`relative flex flex-col items-center gap-3 p-5 rounded-3xl border transition-all cursor-pointer duration-300 ${
                  isDemo
                    ? "bg-[var(--muse-surface-soft)]/20 border-[var(--muse-border)] text-[var(--muse-muted)] opacity-60"
                    : "bg-[var(--muse-surface-soft)] border border-[var(--muse-border)] hover:border-[var(--muse-text)]/20 text-[var(--muse-muted)] hover:text-[var(--muse-text)]"
                }`}
              >
                {isDemo && (
                  <Lock
                    size={12}
                    className="absolute top-4 right-4 text-[var(--muse-muted)]"
                  />
                )}
                <Download size={20} />
                <span className="text-[9px] font-bold uppercase tracking-widest">
                  {isDemo ? "Unlock" : "Export Soul"}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <div className="bg-gradient-to-br from-canvas-primary/10 to-transparent rounded-3xl p-6 border border-canvas-primary/20">
              <p className="text-[10px] font-bold text-canvas-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <Activity size={12} /> Mirror Sync
              </p>
              <p className="text-[11px] text-[var(--muse-muted)] leading-relaxed mb-4 font-serif italic transition-colors duration-300">
                Your digital soul is synchronizing with the collective
                consciousness.
              </p>
              <a
                href="/mirror"
                onClick={closeMenu}
                className="text-[9px] font-bold text-[var(--muse-text)] uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
              >
                Deep Intelligence <ChevronRight size={14} />
              </a>
            </div>
            <p className="mt-8 text-center text-[8px] font-bold text-[var(--muse-muted)] opacity-50 uppercase tracking-[0.4em] transition-colors duration-300">
              Muse v2.0 • Phase Alpha
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
