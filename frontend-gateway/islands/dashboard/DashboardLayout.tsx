import { ComponentChildren } from "preact";
import * as Icons from "lucide-preact";
import { appThemeSignal, toggleTheme } from "../../../signals/ui.ts";

interface DashboardLayoutProps {
  children: ComponentChildren;
  user: {
    username: string;
    email: string;
  };
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const currentTheme = appThemeSignal.value;

  return (
    <div className="flex h-screen bg-[var(--muse-bg)] text-[var(--muse-text)] overflow-hidden transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-[var(--muse-border)] bg-[var(--muse-surface)] flex flex-col transition-colors duration-300">
        
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-[var(--muse-border)] gap-3 cursor-default">
          <div className="w-8 h-8 rounded-lg bg-[var(--muse-text)] text-[var(--muse-bg)] flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <Icons.Infinity size={18} strokeWidth={2.5} />
          </div>
          <span className="font-bold tracking-tight text-lg">MUSE</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)] px-3 mb-3">
            Ecosystem
          </div>
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 text-[var(--muse-text)] transition-colors">
            <Icons.LayoutGrid size={18} />
            <span className="font-medium text-sm">Sovereign Rooms</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--muse-muted)] hover:bg-white/5 hover:text-[var(--muse-text)] transition-colors">
            <Icons.BrainCircuit size={18} />
            <span className="font-medium text-sm">Threads</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--muse-muted)] hover:bg-white/5 hover:text-[var(--muse-text)] transition-colors">
            <Icons.BookOpen size={18} />
            <span className="font-medium text-sm">Journal</span>
          </a>

          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)] px-3 mt-8 mb-3">
            Network
          </div>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--muse-muted)] hover:bg-white/5 hover:text-[var(--muse-text)] transition-colors">
            <Icons.Globe size={18} />
            <span className="font-medium text-sm">Mirror</span>
          </a>
        </nav>

        {/* Global Mirror Widget */}
        <div className="p-4 mx-4 mb-4 rounded-xl border border-[var(--muse-border)] bg-[var(--muse-bg)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--muse-muted)]">Resonance</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono">0.0</span>
            <span className="text-xs text-[var(--muse-muted)] uppercase tracking-wider">HZ</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-[var(--muse-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-canvas-primary/20 flex items-center justify-center text-canvas-primary font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.username}</span>
              <span className="text-xs text-[var(--muse-muted)]">{user.email}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col bg-[var(--muse-bg)] relative">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-canvas-primary/5 blur-[100px] pointer-events-none" />

        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-[var(--muse-border)]/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icons.Search size={16} className="text-[var(--muse-muted)]" />
              </div>
              <input 
                type="text" 
                placeholder="Search across your cognitive ledger..."
                className="w-full pl-10 pr-4 py-1.5 bg-[var(--muse-surface)] border border-[var(--muse-border)] rounded-full text-sm text-[var(--muse-text)] placeholder-[var(--muse-muted)] focus:outline-none focus:border-canvas-primary/50 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:bg-[var(--muse-surface)] transition-all"
            >
              {currentTheme === "dark" && <Icons.Moon size={16} />}
              {currentTheme === "dim" && <Icons.Circle size={14} fill="currentColor" />}
              {currentTheme === "tint" && <Icons.CloudSun size={16} />}
              {currentTheme === "light" && <Icons.Sun size={16} fill="currentColor" />}
            </button>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          {children}
        </div>
      </main>

    </div>
  );
}
