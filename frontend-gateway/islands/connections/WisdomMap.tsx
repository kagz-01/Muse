import { useMemo } from "preact/hooks";
import {
  activeWisdomFocusSignal,
  perspectivesSignal,
  setActiveWisdomFocus,
  wisdomNodesSignal,
} from "../../signals/connections.ts";
import * as Icons from "lucide-preact";
import SyncStatus from "../../components/connections/SyncStatus.tsx";
import { SharedThemeCluster } from "../../components/connections/index.ts";

export default function WisdomMap() {
  const nodes = wisdomNodesSignal.value;
  const activeFocus = activeWisdomFocusSignal.value;
  const allPerspectives = perspectivesSignal.value;

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
    <div className="flex flex-col xl:flex-row gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* MAP AREA */}
      <div className="flex-1 relative h-[600px] bg-[#0d0d0d] rounded-[4rem] border border-white/5 overflow-hidden group shadow-2xl">
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
            <linearGradient
              id="emergingGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
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
          {connections.slice(0, Math.ceil(connections.length / 2)).map((
            line,
          ) => (
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
          {nodes.map((node, idx) => {
            const isActive = activeFocus === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setActiveWisdomFocus(isActive ? null : node.id)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group/node transition-all duration-500 ${
                  isActive ? "scale-110 z-20" : "opacity-80 hover:opacity-100"
                }`}
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
                <div
                  className={`absolute -inset-1 rounded-full border transition-colors ${
                    isActive
                      ? "border-canvas-primary bg-canvas-primary/5"
                      : "border-indigo-500/10"
                  }`}
                />

                <div
                  className={`relative flex items-center justify-center rounded-full bg-black border shadow-2xl transition-all duration-500 hover:scale-110 hover:border-canvas-primary/40 group-hover/node:shadow-[0_0_40px_rgba(99,102,241,0.2)] ${
                    isActive
                      ? "border-canvas-primary shadow-[0_0_60px_rgba(99,102,241,0.4)]"
                      : "border-white/10"
                  }`}
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
            );
          })}

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
                <p className="text-[7px] text-amber-500/40 font-bold">
                  Emerging
                </p>
              </div>
            </>
          )}
        </div>

        {/* MAP OVERLAY INFO WITH ENHANCED LEGEND - REMOVED PER USER REQUEST */}

        <div className="absolute bottom-10 right-10 flex gap-4">
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all cursor-pointer"
          >
            Recenter Grid
          </button>
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-canvas-primary text-white text-[9px] font-bold uppercase tracking-widest shadow-xl hover:scale-105 transition-all cursor-pointer"
          >
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

      {/* RIGHT RAIL */}
      <div className="xl:w-96 space-y-12 shrink-0 relative animate-in slide-in-from-right-8 duration-500">
        <SyncStatus />

        {activeFocus
          ? (
            <div className="bg-canvas-primary/5 border border-canvas-primary/20 rounded-[3rem] p-10 backdrop-blur-3xl sticky top-24 shadow-[0_0_80px_rgba(99,102,241,0.1)]">
              {(() => {
                const focusNode = nodes.find((n) => n.id === activeFocus);
                if (!focusNode) return null;

                // Mock focused node perspectives logic (in real app, we'd filter the stream by theme)
                const topPerspectives = allPerspectives.slice(0, 3);

                return (
                  <div className="animate-in fade-in duration-500">
                    <div className="flex items-center justify-between mb-8">
                      <button
                        type="button"
                        onClick={() => setActiveWisdomFocus(null)}
                        className="text-[10px] font-bold uppercase tracking-widest text-canvas-primary hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Icons.ArrowLeft size={14} /> Back
                      </button>
                      <Icons.Aperture
                        size={20}
                        className="text-canvas-primary animate-pulse"
                      />
                    </div>

                    <div className="mb-10">
                      <h3 className="text-3xl font-bold text-white tracking-tight mb-2">
                        {focusNode.topic}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest px-2 py-1 bg-emerald-500/10 rounded-lg">
                          High Resonance
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          {focusNode.radius * 2} Active Nodes
                        </span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Icons.Waves size={14} /> Top Syntheses
                      </h4>

                      {topPerspectives.map((p) => (
                        <div
                          key={p.id}
                          className="p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors cursor-pointer group"
                        >
                          <p className="text-sm font-serif italic text-gray-300 leading-relaxed mb-4 group-hover:text-white transition-colors line-clamp-3">
                            "{p.content}"
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold border border-white/10"
                                style={{
                                  backgroundColor: `${p.author.aura}20`,
                                  color: p.author.aura,
                                }}
                              >
                                {p.author.name[0]}
                              </div>
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                {p.author.name}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold text-emerald-400">
                              {p.alignCount} ↑
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => (globalThis.location.href =
                        `/community?theme=${focusNode.id}`)}
                      className="w-full mt-10 py-5 bg-canvas-primary text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl cursor-pointer"
                    >
                      Enter the Ledger
                    </button>
                  </div>
                );
              })()}
            </div>
          )
          : (
            <div className="bg-white/2 border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl sticky top-24">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Pattern Clusters
                </h3>
                <Icons.Aperture size={24} className="text-canvas-primary" />
              </div>

              <SharedThemeCluster />

              <div className="mt-12 space-y-8">
                <div className="p-8 bg-canvas-primary/5 border border-canvas-primary/20 rounded-[2.5rem]">
                  <div className="flex items-start gap-4 mb-4">
                    <Icons.Zap
                      size={24}
                      className="text-canvas-primary shrink-0 mt-1"
                    />
                    <div>
                      <p className="text-lg font-bold text-white leading-tight">
                        Emerging: 'Digital Voids'
                      </p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                        Circle Forming
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6 font-serif italic">
                    David Chen and 5 others are currently synthesizing ideas
                    around digital emptiness.
                  </p>
                  <button
                    type="button"
                    onClick={() => (globalThis.location.href =
                      "/threads/c1?type=circle")}
                    className="w-full py-4 bg-canvas-primary text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group cursor-pointer shadow-xl"
                  >
                    Enter Dialogue{" "}
                    <Icons.ChevronRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
