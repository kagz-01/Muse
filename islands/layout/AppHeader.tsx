import {
  Search,
  Menu as MenuIcon,
  Bell,
  Home,
  Layout as LayoutIcon,
  BookOpen,
  Layers,
  Sparkles,
  PenTool,
  Compass,
  Settings,
  User,
} from "lucide-preact";
import { userSignal } from "../../signals/user.ts";
import { toggleMenu } from "../../signals/ui.ts";
import { PrivacyBadge } from "../../components/profile/index.ts";

interface AppHeaderProps {
  currentPath: string;
}

export default function AppHeader({ currentPath }: AppHeaderProps) {
  const user = userSignal.value;

  const tabs = [
    { label: "Home", path: "/dashboard", icon: <Home size={14} /> },
    { label: "Create", path: "/create", icon: <PenTool size={14} /> },
    { label: "Rooms", path: "/rooms", icon: <LayoutIcon size={14} /> },
    { label: "Threads", path: "/threads", icon: <Layers size={14} /> },
    { label: "Journal", path: "/journal", icon: <BookOpen size={14} /> },
    { label: "Community", path: "/connections", icon: <Compass size={14} /> },
    { label: "Quick Actions", path: "/actions", icon: <Compass size={14} /> },
    { label: "AI Insights", path: "/mirror", icon: <Sparkles size={14} /> },
    { label: "Profile", path: "/profile", icon: <User size={14} /> },
    { label: "Settings", path: "/settings", icon: <Settings size={14} /> },
  ];

  const isActive = (path: string) => currentPath.startsWith(path);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-canvas-bg-dark/90 backdrop-blur-2xl border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between px-6 md:px-10 py-4 h-20">
        <div className="flex items-center gap-4 md:gap-8">
          <button
            onClick={toggleMenu}
            type="button"
            className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-canvas-primary/40 transition-all outline-none"
          >
            <MenuIcon size={20} className="text-gray-300" />
          </button>

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

          <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/8 rounded-full text-gray-500 cursor-text hover:border-white/20 transition-all min-w-[260px]">
            <Search size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Search deep artifacts...</span>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <button
            type="button"
            className="hidden sm:flex p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all relative"
          >
            <Bell size={16} className="text-gray-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-canvas-primary" />
          </button>

          <div className="hidden sm:block">
            <PrivacyBadge />
          </div>

          <a
            href="/profile"
            className="relative group p-0.5 rounded-full border border-white/10 hover:border-canvas-primary transition-all active:scale-95 outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center font-serif text-gray-400">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                : user?.name?.charAt(0) || "U"}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-canvas-primary rounded-full border-2 border-canvas-bg-dark group-hover:scale-110 transition-transform shadow-lg" />
          </a>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-2 px-6 md:px-10 pb-3 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <a
            key={tab.label}
            href={tab.path}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${
              isActive(tab.path)
                ? "bg-canvas-primary/15 border-canvas-primary/40 text-canvas-primary"
                : "bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/25"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </a>
        ))}
      </nav>
    </header>
  );
}
