import { syncStatusSignal } from "../../signals/connections.ts";
import * as Icons from "lucide-preact";

export default function SyncStatus() {
  const status = syncStatusSignal.value;

  return (
    <div className="bg-black/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${
              status.health === "Optimal"
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                : "bg-amber-500"
            } animate-pulse`}
          />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">
            Parallel Sync Engine
          </h3>
        </div>
        <Icons.ShieldCheck size={14} className="text-emerald-500" />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide">
        <div className="min-w-[150px] flex-1 snap-start p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Icons.Cpu size={12} className="text-canvas-primary" />
            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
              Active Nodes
            </span>
          </div>
          <p className="text-sm font-bold text-white font-mono">
            {status.nodesActive}
          </p>
        </div>
        <div className="min-w-[150px] flex-1 snap-start p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Icons.Activity size={12} className="text-emerald-500" />
            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
              Latency
            </span>
          </div>
          <p className="text-sm font-bold text-white font-mono">
            {status.latency}
          </p>
        </div>
        <div className="min-w-[220px] flex-[2] snap-start p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Icons.Zap size={12} className="text-amber-500" />
            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
              Throughput
            </span>
          </div>
          <p className="text-sm font-bold text-white font-mono">
            {status.throughput}
          </p>
        </div>
        
        {/* Pattern Discovery Rate */}
        <div className="min-w-[160px] flex-1 snap-start p-4 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-2xl border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Icons.Sparkles size={12} className="text-indigo-400 animate-pulse" />
            <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">
              Pattern Discovery
            </span>
          </div>
          <p className="text-sm font-bold text-indigo-300 font-mono">
            +8/min
          </p>
        </div>

        {/* Cluster Formation */}
        <div className="min-w-[160px] flex-1 snap-start p-4 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-2xl border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Icons.GitBranch size={12} className="text-emerald-400" />
            <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">
              Clusters Formed
            </span>
          </div>
          <p className="text-sm font-bold text-emerald-300 font-mono">
            47
          </p>
        </div>

        {/* Void Detection */}
        <div className="min-w-[160px] flex-1 snap-start p-4 bg-gradient-to-br from-red-500/10 to-transparent rounded-2xl border border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Icons.AlertCircle size={12} className="text-red-400" />
            <span className="text-[8px] font-bold text-red-400 uppercase tracking-widest">
              Voids Detected
            </span>
          </div>
          <p className="text-sm font-bold text-red-300 font-mono">
            3
          </p>
        </div>
      </div>

      <div className="pt-2">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
              Sync Progress
            </span>
            <span className="text-[9px] font-bold text-white">67%</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-canvas-primary via-emerald-500 to-transparent w-2/3 animate-[progress_5s_infinite] shadow-lg" />
          </div>
        </div>
        <p className="mt-3 text-[9px] text-gray-600 font-serif italic text-center">
          Broadcasting ledger-backed state across 12 distributed nodes. Filling digital voids...
        </p>
      </div>

      <style>
        {`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}
      </style>
    </div>
  );
}
