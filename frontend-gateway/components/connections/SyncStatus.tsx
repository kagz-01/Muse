import { syncStatusSignal } from "../../signals/connections.ts";
import { Activity, Cpu, ShieldCheck, Zap } from "lucide-preact";

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
        <ShieldCheck size={14} className="text-emerald-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Cpu size={12} className="text-canvas-primary" />
            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
              Active Nodes
            </span>
          </div>
          <p className="text-sm font-bold text-white font-mono">
            {status.nodesActive}
          </p>
        </div>
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={12} className="text-emerald-500" />
            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
              Latency
            </span>
          </div>
          <p className="text-sm font-bold text-white font-mono">
            {status.latency}
          </p>
        </div>
        <div className="col-span-2 p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={12} className="text-amber-500" />
            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
              Throughput
            </span>
          </div>
          <p className="text-sm font-bold text-white font-mono">
            {status.throughput}
          </p>
        </div>
      </div>

      <div className="pt-2">
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-canvas-primary w-2/3 animate-[progress_5s_infinite]" />
        </div>
        <p className="mt-3 text-[9px] text-gray-600 font-serif italic text-center">
          Broadcasting ledger-backed state across 12 distributed nodes.
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
