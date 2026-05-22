import * as Icons from "lucide-preact";

interface ThreadGenerationIndicatorProps {
  isGenerating: boolean;
  progress?: number;
  threadCount?: number;
  animated?: boolean;
}

export default function ThreadGenerationIndicator({
  isGenerating,
  progress = 0,
  threadCount = 0,
  animated = true,
}: ThreadGenerationIndicatorProps) {
  if (!isGenerating && threadCount === 0) return null;

  return (
    <div
      className={`${
        isGenerating
          ? "bg-blue-500/10 border-blue-500/20"
          : "bg-emerald-500/10 border-emerald-500/20"
      } border rounded-xl px-4 py-3 flex items-center gap-3 animate-in fade-in duration-300`}
    >
      {isGenerating ? (
        <>
          <Icons.Zap
            size={16}
            className={`${animated ? "animate-pulse" : ""} text-blue-400`}
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-400">
              Generating threads from patterns...
            </p>
            {progress > 0 && (
              <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <Icons.CheckCircle2 size={16} className="text-emerald-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-400">
              {threadCount} new thread{threadCount !== 1 ? "s" : ""} created
            </p>
          </div>
        </>
      )}
    </div>
  );
}
