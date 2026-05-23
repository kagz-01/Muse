import * as Icons from "lucide-preact";
import type { AnalysisProgress } from "../../signals/ai-feedback.ts";
import BlueprintScoreAnimator from "./BlueprintScoreAnimator.tsx";

interface AnalysisProgressProps {
  progress: AnalysisProgress;
  isAnalyzing: boolean;
}

export default function AnalysisProgress({
  progress,
  isAnalyzing,
}: AnalysisProgressProps) {
  const getStageIcon = () => {
    switch (progress.stage) {
      case "processing":
        return <Icons.Loader size={20} className="animate-spin" />;
      case "analyzing":
        return <Icons.Zap size={20} className="animate-pulse" />;
      case "complete":
        return <Icons.CheckCircle2 size={20} className="text-green-500" />;
      default:
        return <Icons.Brain size={20} />;
    }
  };

  const getStageColor = () => {
    switch (progress.stage) {
      case "processing":
      case "analyzing":
        return "from-blue-500 to-purple-500";
      case "complete":
        return "from-green-500 to-emerald-500";
      default:
        return "from-slate-500 to-slate-600";
    }
  };

  return (
    <div className="bg-[var(--muse-surface-bright)] rounded-2xl p-6 border border-[var(--muse-border-light)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 bg-gradient-to-br ${getStageColor()} rounded-lg text-white`}
          >
            {getStageIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-[var(--muse-text)] capitalize">
              {progress.stage === "idle" ? "Ready" : progress.message}
            </h3>
            <p className="text-xs text-[var(--muse-text-muted)]">
              {isAnalyzing
                ? "AI is analyzing your content in real-time"
                : "Analysis complete"}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {progress.stage !== "idle" && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[var(--muse-text-muted)]">
                Analysis Progress
              </span>
              <span className="text-xs font-bold text-[var(--muse-accent)]">
                {progress.percentage}%
              </span>
            </div>
            <div className="w-full h-2 bg-[var(--muse-surface-soft)] rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getStageColor()} transition-all duration-500`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* Patterns */}
          {progress.patterns.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-[var(--muse-text-muted)] mb-2">
                Detected Patterns
              </p>
              <div className="flex flex-wrap gap-2">
                {progress.patterns.map((pattern) => (
                  <span
                    key={pattern}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--muse-accent)]/10 text-[var(--muse-accent)] text-xs font-medium rounded-full"
                  >
                    <Icons.Sparkles size={12} />
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Blueprints */}
          {progress.blueprints.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[var(--muse-text-muted)] mb-2">
                Matching Blueprints
              </p>
              <div className="space-y-2">
                {progress.blueprints.map((blueprint) => (
                  <div
                    key={blueprint.id}
                    className="p-3 bg-[var(--muse-surface-soft)] rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-[var(--muse-text)]">
                        {blueprint.name}
                      </h4>
                      <BlueprintScoreAnimator
                        targetScore={blueprint.score}
                        duration={1200}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--muse-text-muted)]">
                      <Icons.Check size={14} />
                      <span>{blueprint.matches} matches</span>
                    </div>
                    <div className="w-full h-1 bg-[var(--muse-border-light)] rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--muse-accent)] to-[var(--muse-accent-bright)]"
                        style={{ width: `${blueprint.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {progress.stage === "idle" && !isAnalyzing && progress.percentage === 0 &&
        (
          <p className="text-sm text-[var(--muse-text-muted)] text-center py-4">
            Start analyzing your content to discover patterns and blueprints
          </p>
        )}
    </div>
  );
}
