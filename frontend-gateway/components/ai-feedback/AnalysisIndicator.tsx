import * as Icons from "lucide-preact";

interface AnalysisIndicatorProps {
  stage: "idle" | "processing" | "analyzing" | "complete";
  message?: string;
  progress?: number;
  animated?: boolean;
}

export default function AnalysisIndicator({
  stage,
  message,
  progress = 0,
  animated = true,
}: AnalysisIndicatorProps) {
  if (stage === "idle") return null;

  const stageConfig = {
    processing: {
      icon: Icons.Zap,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      label: message || "Processing...",
      showProgress: true,
    },
    analyzing: {
      icon: Icons.Brain,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      label: message || "Analyzing patterns...",
      showProgress: true,
    },
    complete: {
      icon: Icons.CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      label: message || "Analysis complete",
      showProgress: false,
    },
  };

  const config = stageConfig[stage];
  if (!config) return null;

  const IconComponent = config.icon;

  return (
    <div
      className={`${config.bg} border border-${config.color.split("-")[1]}-400/20 rounded-xl px-4 py-3 flex items-center gap-3 animate-in fade-in duration-300`}
    >
      <IconComponent
        size={16}
        className={`${config.color} ${
          animated && stage !== "complete" ? "animate-pulse" : ""
        }`}
      />

      <div className="flex-1">
        <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
        {config.showProgress && progress > 0 && (
          <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${
                stage === "analyzing"
                  ? "from-purple-400 to-pink-400"
                  : "from-blue-400 to-cyan-400"
              } transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {stage === "complete" && (
        <Icons.Check size={16} className="text-emerald-400" />
      )}
    </div>
  );
}
