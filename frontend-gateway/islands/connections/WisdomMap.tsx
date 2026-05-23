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

          {/* Emerging Connections Gradient */}
          <linearGradient id="emergingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              stop-color="rgba(34, 197, 94, 0.4)"
            />
            <stop
              offset="100%"
              stop-color="rgba(34, 197, 94, 0.1)"
            />
          </linearGradient>

          {/* Sync Strength Gradient */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Emerging Connections (stronger lines) */}
        {connections.slice(0, Math.ceil(connections.length / 2)).map((line) => (
          <line
            key={`emerging-${line.id}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="url(#emergingGrad)"
            stroke-width="3"
            stroke-dasharray="12 8"
            className="animate-[dash_15s_linear_infinite]"
            filter="url(#glow)"
          />
        ))}

        {/* Standard Connections */}
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
        {nodes.map((node, idx) => (
          <div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group/node"
            style={{ left: node.x, top: node.y }}
          >
            {/* Pulsing Activity Ring */}
            <div
              className="absolute -inset-4 rounded-full border border-emerald-500/20 animate-pulse"
              style={{
                animationDelay: `${idx * 200}ms`,
              }}
            />

            {/* Cluster Indicator (concentric circles) */}
            <div className="absolute -inset-1 rounded-full border border-indigo-500/10" />

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

        {/* Digital Voids (empty space indicators) */}
        {nodes.length > 0 && (
          <>
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-dashed border-red-500/20 flex items-center justify-center">
              <div className="text-center">
                <Icons.AlertCircle
                  size={16}
                  className="text-red-500/40 mx-auto mb-1"
                />
                <p className="text-[8px] text-red-500/40 font-bold">
                  Digital Void
                </p>
              </div>
            </div>
            <div className="absolute bottom-1/3 right-1/4 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-dashed border-amber-500/20 flex items-center justify-center">
              <p className="text-[7px] text-amber-500/40 font-bold">Emerging</p>
            </div>
          </>
        )}
      </div>

      {/* MAP OVERLAY INFO WITH ENHANCED LEGEND */}
      <div className="absolute top-10 left-10 p-6 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/5 space-y-4">
        <div className="flex items-center gap-3">
          <Icons.Aperture size={16} className="text-canvas-primary" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">
            Wisdom Map v3.0
          </h3>
        </div>
        <p className="text-[11px] text-gray-500 font-serif italic max-w-[220px]">
          Real-time visualization of cognitive resonance across 1,204 active
          thinkers.
        </p>

        {/* Enhanced Legend */}
        <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-canvas-primary" />
            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
              Pattern Cluster
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
              Emerging Connection
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 border border-red-500/50" />
            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
              Digital Void
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-px bg-gradient-to-r from-indigo-500 to-transparent" />
            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
              Sync Strength
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
