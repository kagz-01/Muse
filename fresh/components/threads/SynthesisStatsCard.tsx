import { h } from "preact";
import * as Icons from "lucide-preact";

interface SynthesisStatsCardProps {
  coherenceScore: number;
  patternCount: number;
  tensionCount: number;
  signalCount: number;
}

export default function SynthesisStatsCard({
  coherenceScore,
  patternCount,
  tensionCount,
  signalCount,
}: SynthesisStatsCardProps) {
  const coherenceColor = coherenceScore > 80
    ? "text-emerald-400"
    : coherenceScore > 60
    ? "text-amber-400"
    : "text-rose-400";

  const coherenceBg = coherenceScore > 80
    ? "bg-emerald-500/10"
    : coherenceScore > 60
    ? "bg-amber-500/10"
    : "bg-rose-500/10";

  const coherenceBorder = coherenceScore > 80
    ? "border-emerald-500/20"
    : coherenceScore > 60
    ? "border-amber-500/20"
    : "border-rose-500/20";

  return (
    <div
      className={`rounded-2xl border ${coherenceBorder} ${coherenceBg} p-5 space-y-4`}
    >
      {/* Coherence Score */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
            Coherence
          </span>
          <span className={`text-lg font-bold ${coherenceColor}`}>
            {coherenceScore}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${coherenceColor}`}
            style={{ width: `${coherenceScore}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <div className="text-center">
          <div className="text-lg font-bold text-white mb-1">
            {patternCount}
          </div>
          <div className="text-[8px] font-bold uppercase tracking-widest text-gray-500">
            Patterns
          </div>
        </div>
        <div className="text-center border-l border-r border-white/5">
          <div className="text-lg font-bold text-white mb-1">
            {tensionCount}
          </div>
          <div className="text-[8px] font-bold uppercase tracking-widest text-gray-500">
            Tensions
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white mb-1">
            {signalCount}
          </div>
          <div className="text-[8px] font-bold uppercase tracking-widest text-gray-500">
            Signals
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 pt-2">
        <div
          className={`w-2 h-2 rounded-full ${coherenceColor} animate-pulse`}
        />
        <span className="text-xs text-gray-400">
          {coherenceScore > 80
            ? "Strong synthesis"
            : coherenceScore > 60
            ? "Good alignment"
            : "Emerging patterns"}
        </span>
      </div>
    </div>
  );
}
