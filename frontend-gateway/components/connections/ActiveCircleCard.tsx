import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import ActiveCircleGatewayModal from "./ActiveCircleGatewayModal.tsx";

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
  const [showGateway, setShowGateway] = useState(false);

  return (
    <>
      <div
        className="group relative bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-8 transition-all duration-500 hover:border-indigo-500/30 shadow-2xl flex flex-col h-[400px] overflow-hidden cursor-pointer"
        onClick={() => setShowGateway(true)}
        style={{ boxShadow: `0 20px 60px rgba(99,102,241,0.12)` }}
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
              <Icons.MessageSquare size={12} className="text-gray-500" />{" "}
              {circle.recentActivity}
            </span>
          </div>
          <h3 className="text-3xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors duration-300">
            {circle.name}
          </h3>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Resonance Score Badge */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-lg">
            <Icons.Zap size={14} className="text-purple-400" />
            <span className="text-[10px] font-bold text-purple-300">
              92 Resonance
            </span>
          </div>

          {/* Enter Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowGateway(true);
            }}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-500 hover:border-indigo-500 transition-all active:scale-90 shadow-lg cursor-pointer"
          >
            <Icons.LogIn size={20} />
          </button>
        </div>
      </div>

      <p className="text-gray-400 font-serif italic text-lg leading-relaxed mb-6 flex-1 line-clamp-3">
        "{circle.description}"
      </p>

      {/* Emerging Topics */}
      <div className="mb-6">
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2.5">
          Trending Topics
        </p>
        <div className="flex flex-wrap gap-2">
          {["Consciousness", "Emergence", "Synthesis"].map((topic) => (
            <span
              key={topic}
              className="text-[9px] font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:border-emerald-500/60 transition-all cursor-default"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <span className="text-[10px] font-bold text-gray-500 border border-white/5 bg-white/[0.02] px-4 py-2 rounded-xl uppercase tracking-widest hover:border-white/20 hover:text-white transition-all cursor-default flex items-center gap-2">
          <Icons.Globe size={12} /> {circle.theme}
        </span>

        {/* Live Indicator */}
        <span className="text-[10px] font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 rounded-xl uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          New thought 3m ago
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
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white leading-none mb-1">
                {circle.memberCount} Members
              </p>
              <Icons.TrendingUp size={12} className="text-emerald-400" />
            </div>
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
              +3 this week
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400 group-hover:text-white transition-colors">
          Enter Dialogue{" "}
          <Icons.ArrowRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>
      </div>
      
      {showGateway && (
        <ActiveCircleGatewayModal
          circle={circle}
          onClose={() => setShowGateway(false)}
        />
      )}
    </>
  );
}
