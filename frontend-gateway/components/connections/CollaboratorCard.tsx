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
        <div className="flex items-center gap-2 mb-4">
          <Icons.Shield size={12} className="text-indigo-400" />
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">
            {collaborator.role}
          </p>
        </div>
        <p className="text-gray-400 font-serif italic text-base leading-relaxed line-clamp-2">
          "{collaborator.bio}"
        </p>
      </div>

      <div className="relative z-10 pt-6 border-t border-white/5 flex flex-wrap gap-2">
        {collaborator.sharedThemes.map((theme) => (
          <span
            key={theme}
            className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-2"
          >
            <Icons.Aperture size={8} /> {theme}
          </span>
        ))}
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
