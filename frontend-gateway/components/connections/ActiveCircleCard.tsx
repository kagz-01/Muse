import { ArrowRight, Globe, MessageSquare, Plus } from "lucide-preact";

export interface ActiveCircle {
  id: string;
  name: string;
  description: string;
  theme: string;
  memberCount: number;
  recentActivity: string;
  members: { avatar: string }[];
}

interface Props {
  circle: ActiveCircle;
  onJoin?: () => void;
}

export default function ActiveCircleCard({ circle, onJoin }: Props) {
  return (
    <div
      className="group relative bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-8 transition-all duration-500 hover:border-indigo-500/30 card-glow glow-indigo shadow-2xl flex flex-col h-[400px] overflow-hidden cursor-pointer"
      onClick={() => {
        globalThis.location.href = `/threads/${circle.id}?type=circle`;
      }}
    >
      <div className="flex justify-between items-start gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.2em]">
                Active Circle
              </span>
            </div>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={12} className="text-gray-500" />{" "}
              {circle.recentActivity}
            </span>
          </div>
          <h3 className="text-3xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors duration-300">
            {circle.name}
          </h3>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onJoin?.();
          }}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-500 hover:border-indigo-500 transition-all active:scale-90 shadow-lg cursor-pointer"
        >
          <Plus size={22} />
        </button>
      </div>

      <p className="text-gray-400 font-serif italic text-lg leading-relaxed mb-8 flex-1 line-clamp-3">
        "{circle.description}"
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        <span className="text-[10px] font-bold text-gray-500 border border-white/5 bg-white/[0.02] px-4 py-2 rounded-xl uppercase tracking-widest hover:border-white/20 hover:text-white transition-all cursor-default flex items-center gap-2">
          <Globe size={12} /> {circle.theme}
        </span>
      </div>

      <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {circle.members.slice(0, 3).map((_, i) => (
              <div
                key={i}
                className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-[#0d0d0d] shadow-xl bg-[#151515] flex items-center justify-center"
              >
                <img
                  src={`https://i.pravatar.cc/100?u=${circle.id}${i}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {circle.memberCount > 3 && (
              <div className="w-11 h-11 rounded-2xl bg-[#151515] border-2 border-[#0d0d0d] flex items-center justify-center text-[10px] font-bold text-gray-400 shadow-xl">
                +{circle.memberCount - 3}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none mb-1">
              {circle.memberCount} Members
            </p>
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
              Active Pulse
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400 group-hover:text-white transition-colors">
          Enter Dialogue{" "}
          <ArrowRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>
    </div>
  );
}
