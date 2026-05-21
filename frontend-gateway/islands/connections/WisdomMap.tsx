import { useMemo } from "preact/hooks";
import { WisdomNode, wisdomNodesSignal } from "../../signals/connections.ts";
import * as Icons from "lucide-preact";

export default function WisdomMap() {
  const nodes = wisdomNodesSignal.value;

  const connections = useMemo(() => {
    const lines: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      id: string;
    }[] = [];
    nodes.forEach((node) => {
      node.connectedTo.forEach((targetId) => {
        const target = nodes.find((n) => n.id === targetId);
        if (target) {
          lines.push({
            x1: node.x,
            y1: node.y,
            x2: target.x,
            y2: target.y,
            id: `${node.id}-${target.id}`,
          });
        }
      });
    });
    return lines;
  }, [nodes]);

  return (
    <div className="relative w-full h-[600px] bg-[#0d0d0d] rounded-[4rem] border border-white/5 overflow-hidden group shadow-2xl">
      {/* BACKGROUND GRID */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* SVG LAYER FOR CONNECTIONS */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              stop-color="var(--muse-accent-rgb)"
              stop-opacity="0.2"
            />
            <stop
              offset="100%"
              stop-color="var(--muse-accent-rgb)"
              stop-opacity="0.1"
            />
          </linearGradient>
        </defs>
        {connections.map((line) => (
          <line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="url(#lineGrad)"
            stroke-width="2"
            stroke-dasharray="8 8"
            className="animate-[dash_20s_linear_infinite]"
          />
        ))}
      </svg>

      {/* NODES LAYER */}
      <div className="absolute inset-0">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group/node"
            style={{ left: node.x, top: node.y }}
          >
            <div
              className="relative flex items-center justify-center rounded-full bg-black border border-white/10 shadow-2xl transition-all duration-500 hover:scale-110 hover:border-canvas-primary/40 group-hover/node:shadow-[0_0_40px_rgba(99,102,241,0.2)]"
              style={{ width: node.radius * 2, height: node.radius * 2 }}
            >
              <div className="absolute inset-2 rounded-full bg-canvas-primary/5 group-hover/node:bg-canvas-primary/10 transition-colors" />
              <div className="relative z-10 text-center px-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white group-hover/node:text-canvas-primary transition-colors">
                  {node.topic}
                </p>
                <p className="text-[8px] font-bold text-gray-600 mt-1 uppercase tracking-tighter opacity-0 group-hover/node:opacity-100 transition-opacity">
                  Connect
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MAP OVERLAY INFO */}
      <div className="absolute top-10 left-10 p-6 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/5 space-y-4">
        <div className="flex items-center gap-3">
          <Icons.Aperture size={16} className="text-canvas-primary" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">
            Wisdom Map v3.0
          </h3>
        </div>
        <p className="text-[11px] text-gray-500 font-serif italic max-w-[200px]">
          Visualizing the cognitive resonance of 1,204 active thinkers.
        </p>
        <div className="flex items-center gap-4 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-canvas-primary" />
            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
              Active Node
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
              High Resonance
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 flex gap-4">
        <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all">
          Recenter Grid
        </button>
        <button className="px-5 py-2.5 rounded-xl bg-canvas-primary text-white text-[9px] font-bold uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
          Global Perspective
        </button>
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
