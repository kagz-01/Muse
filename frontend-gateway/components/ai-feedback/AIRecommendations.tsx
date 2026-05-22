import * as Icons from "lucide-preact";
import { AIRecommendation, dismissRecommendation } from "../../signals/ai-feedback.ts";

interface AIRecommendationsProps {
  recommendations: AIRecommendation[];
  isVisible?: boolean;
}

export default function AIRecommendations({
  recommendations,
  isVisible = true,
}: AIRecommendationsProps) {
  const getTypeIcon = (type: AIRecommendation["type"]) => {
    switch (type) {
      case "question":
        return <Icons.HelpCircle size={18} />;
      case "suggestion":
        return <Icons.Lightbulb size={18} />;
      case "insight":
        return <Icons.Brain size={18} />;
      case "warning":
        return <Icons.AlertCircle size={18} />;
      default:
        return <Icons.MessageSquare size={18} />;
    }
  };

  const getTypeColor = (type: AIRecommendation["type"]) => {
    switch (type) {
      case "question":
        return "text-blue-500 bg-blue-500/10";
      case "suggestion":
        return "text-yellow-500 bg-yellow-500/10";
      case "insight":
        return "text-purple-500 bg-purple-500/10";
      case "warning":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-slate-500 bg-slate-500/10";
    }
  };

  const getPriorityIndicator = (priority: AIRecommendation["priority"]) => {
    switch (priority) {
      case "high":
        return <div className="w-2 h-2 rounded-full bg-red-500" />;
      case "medium":
        return <div className="w-2 h-2 rounded-full bg-yellow-500" />;
      case "low":
        return <div className="w-2 h-2 rounded-full bg-green-500" />;
    }
  };

  if (!isVisible || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-28 right-4 md:right-6 max-w-sm z-40 space-y-3">
      {recommendations.map((rec) => (
        <div
          key={rec.id}
          className="bg-[var(--muse-surface)] border border-[var(--muse-border-light)] rounded-xl p-4 shadow-lg backdrop-blur-sm hover:shadow-xl transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className={`p-2 rounded-lg ${getTypeColor(rec.type)}`}>
              {getTypeIcon(rec.type)}
            </div>
            <button
              onClick={() => dismissRecommendation(rec.id)}
              className="p-1 hover:bg-[var(--muse-surface-soft)] rounded-lg transition-colors flex-shrink-0"
            >
              <Icons.X size={16} className="text-[var(--muse-text-muted)]" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-3">
            <h4 className="font-semibold text-[var(--muse-text)] text-sm mb-1 flex items-center gap-2">
              {rec.title}
              {getPriorityIndicator(rec.priority)}
            </h4>
            <p className="text-xs text-[var(--muse-text-muted)] leading-relaxed">
              {rec.message}
            </p>
          </div>

          {/* Action */}
          {rec.action && (
            <button
              onClick={rec.action.handler}
              className="w-full px-3 py-2 bg-[var(--muse-accent)] text-white text-xs font-medium rounded-lg hover:bg-[var(--muse-accent-bright)] transition-colors"
            >
              {rec.action.label}
            </button>
          )}

          {/* Type Badge */}
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--muse-border-light)]">
            <span className="text-[10px] font-bold uppercase text-[var(--muse-text-muted)] tracking-wider">
              {rec.type}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
