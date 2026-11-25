import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { Perspective } from "../../signals/connections.ts";

interface LineageMapModalProps {
  perspective: Perspective;
  onClose: () => void;
}

export default function LineageMapModal({
  perspective,
  onClose,
}: LineageMapModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-in fade-in duration-500">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors z-50"
      >
        <Icons.X size={32} />
      </button>

      <div className="absolute top-8 left-8 flex items-center gap-4 text-white z-50">
        <Icons.Network size={24} className="text-canvas-primary" />
        <div>
          <h2 className="text-[12px] font-bold uppercase tracking-[0.4em]">
            Synthesis Lineage
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
            Root Node: {perspective.txId || "Genesis"}
          </p>
        </div>
      </div>

      {/* GRAPH VISUALIZATION */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Background Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient
              id="lineageLine"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stop-color="var(--muse-accent-rgb)"
                stop-opacity="0.4"
              />
              <stop
                offset="100%"
                stop-color="var(--muse-accent-rgb)"
                stop-opacity="0"
              />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Simulated Lines */}
          <line
            x1="50%"
            y1="50%"
            x2="20%"
            y2="30%"
            stroke="url(#lineageLine)"
            stroke-width="2"
            stroke-dasharray="8 8"
            className="animate-[dash_20s_linear_infinite]"
          />
          <line
            x1="50%"
            y1="50%"
            x2="80%"
            y2="30%"
            stroke="url(#lineageLine)"
            stroke-width="2"
            stroke-dasharray="8 8"
            className="animate-[dash_20s_linear_infinite]"
          />
          <line
            x1="50%"
            y1="50%"
            x2="50%"
            y2="80%"
            stroke="url(#lineageLine)"
            stroke-width="4"
            className="animate-pulse"
            filter="url(#glow)"
          />
        </svg>

        {/* Nodes */}
        <div
          className={`relative transition-all duration-1000 ${
            mounted ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          {/* Target Node (Center) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-64 p-6 bg-black border border-canvas-primary/40 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.15)] flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-full border border-white/10 mb-4 flex items-center justify-center text-xl font-bold"
                style={{
                  backgroundColor: `${perspective.author.aura}20`,
                  color: perspective.author.aura,
                  boxShadow: `0 0 20px ${perspective.author.aura}40`,
                }}
              >
                {perspective.author.name.charAt(0)}
              </div>
              <p className="text-[10px] font-bold text-white uppercase tracking-widest mb-2">
                {perspective.author.name}
              </p>
              <p className="text-sm font-serif italic text-gray-400 line-clamp-3">
                "{perspective.content}"
              </p>
            </div>
          </div>

          {/* Parent Node 1 */}
          <div className="absolute top-[30%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-10 opacity-60">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Icons.GitBranch size={20} className="text-gray-500" />
            </div>
          </div>

          {/* Parent Node 2 */}
          <div className="absolute top-[30%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-10 opacity-60">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Icons.GitBranch size={20} className="text-gray-500" />
            </div>
          </div>

          {/* Child Node (Synthesis) */}
          <div className="absolute top-[80%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-48 p-4 bg-white/5 border border-emerald-500/30 rounded-2xl flex flex-col items-center text-center animate-pulse">
              <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
                Active Branch
              </p>
              <p className="text-xs font-serif italic text-gray-300">
                Currently being synthesized...
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
        @keyframes dash {
          to { stroke-dashoffset: -1000; }
        }
      `}
      </style>
    </div>
  );
}
