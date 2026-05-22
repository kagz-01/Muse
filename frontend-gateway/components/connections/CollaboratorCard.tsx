import * as Icons from "lucide-preact";

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: "Online" | "Reflecting" | "Deep Focus" | "Offline";
  bio: string;
  sharedThemes: string[];
}

interface Props {
  collaborator: Collaborator;
}

export default function CollaboratorCard({ collaborator }: Props) {
  const statusColors = {
    "Online": "bg-emerald-500",
    "Reflecting": "bg-amber-500",
    "Deep Focus": "bg-canvas-primary",
    "Offline": "bg-gray-600",
  };

  return (
    <div className="group relative bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-8 transition-all duration-500 hover:bg-white/[0.04] hover:border-indigo-500/30 shadow-2xl overflow-hidden"
      style={{ boxShadow: `0 20px 60px rgba(99,102,241,0.12)` }}
    >
      <div className="relative z-10 flex items-start justify-between mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 group-hover:border-indigo-500/40 transition-colors shadow-2xl">
            <img
              src={collaborator.avatar}
              alt={collaborator.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          <div
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0d0d0d] ${
              statusColors[collaborator.status]
            } shadow-lg shadow-black/50`}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all cursor-pointer"
          >
            <Icons.MessageCircle size={18} />
          </button>
          <button
            type="button"
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <Icons.ExternalLink size={18} />
          </button>
        </div>
      </div>

      <div className="relative z-10 mb-6">
        <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors tracking-tight">
          {collaborator.name}
        </h4>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Icons.Shield size={12} className="text-indigo-400" />
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">
            {collaborator.role}
          </p>
          
          {/* Alignment Score */}
          <div className="flex items-center gap-1.5 ml-auto px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <Icons.Zap size={10} className="text-purple-400" />
            <span className="text-[8px] font-bold text-purple-300 uppercase tracking-widest">89% Aligned</span>
          </div>
        </div>
        <p className="text-gray-400 font-serif italic text-base leading-relaxed line-clamp-2">
          "{collaborator.bio}"
        </p>
      </div>

      {/* Connection Metrics */}
      <div className="relative z-10 mb-6 grid grid-cols-3 gap-3 py-4 px-3 bg-white/[0.02] border border-white/5 rounded-2xl">
        <div className="text-center">
          <p className="text-sm font-bold text-white">3</p>
          <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">Shared Circles</p>
        </div>
        <div className="text-center border-x border-white/5">
          <p className="text-sm font-bold text-emerald-400">12</p>
          <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">Collaborations</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-amber-400">7</p>
          <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">Shared Insights</p>
        </div>
      </div>

      <div className="relative z-10 pt-4 border-t border-white/5">
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3">Shared Wavelength</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {collaborator.sharedThemes.map((theme, idx) => (
            <span
              key={theme}
              className={`text-[9px] font-bold ${
                idx === 0
                  ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                  : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
              } px-3 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-2`}
            >
              <Icons.Aperture size={8} /> {idx === 0 ? "⭐ " : ""}{theme}
            </span>
          ))}
        </div>
        
        {/* Mutual Circles */}
        <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
          <Icons.Users size={12} className="text-indigo-400" />
          <span>In 3 circles together</span>
        </div>
      </div>

      {collaborator.status === "Deep Focus" && (
        <div className="absolute inset-0 bg-[#0a0a0a]/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="bg-[#111] border border-white/10 rounded-full px-6 py-2.5 flex items-center gap-3 shadow-2xl">
            <Icons.Zap size={12} className="text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
              In Deep Flow
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
