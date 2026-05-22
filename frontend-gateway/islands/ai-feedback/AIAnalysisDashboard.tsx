import { useEffect } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  aiFeedbackSignal,
  startAnalysis,
  resetAnalysis,
} from "../../signals/ai-feedback.ts";
import AnalysisProgress from "../../components/ai-feedback/AnalysisProgress.tsx";
import AIRecommendations from "../../components/ai-feedback/AIRecommendations.tsx";

export default function AIAnalysisDashboard() {
  const feedback = aiFeedbackSignal.value;

  const handleStartAnalysis = () => {
    startAnalysis("content-123");
  };

  const handleReset = () => {
    resetAnalysis();
  };

  return (
    <div className="min-h-screen bg-[var(--muse-background)] pb-32 md:pb-28">
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6 md:pt-8">
        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--muse-accent)] to-[var(--muse-accent-dark)] flex items-center justify-center">
              <Icons.Zap size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--muse-text)]">
                AI Analysis
              </h1>
              <p className="text-[var(--muse-text-muted)] mt-2">
                Real-time pattern detection and intelligent recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Analysis Progress */}
        <div className="mb-8">
          <AnalysisProgress
            progress={feedback.analysisProgress}
            isAnalyzing={feedback.isAnalyzing}
          />
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={handleStartAnalysis}
            disabled={feedback.isAnalyzing}
            className="px-6 py-3 rounded-lg bg-[var(--muse-accent)] text-white font-medium hover:bg-[var(--muse-accent-bright)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {feedback.isAnalyzing ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Icons.Play size={18} />
                {feedback.analysisProgress.stage === "idle"
                  ? "Start Analysis"
                  : "Run Again"}
              </>
            )}
          </button>

          {feedback.analysisProgress.stage !== "idle" && (
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-lg border border-[var(--muse-border-light)] text-[var(--muse-text-muted)] hover:bg-[var(--muse-surface-soft)] transition-colors flex items-center gap-2"
            >
              <Icons.RotateCcw size={18} />
              Reset
            </button>
          )}
        </div>

        {/* Analysis Results */}
        {feedback.analysisProgress.stage !== "idle" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Patterns */}
            <div className="bg-[var(--muse-surface-bright)] rounded-2xl p-6 border border-[var(--muse-border-light)]">
              <div className="flex items-center gap-2 mb-4">
                <Icons.Sparkles size={20} className="text-[var(--muse-accent)]" />
                <h3 className="font-semibold text-[var(--muse-text)]">
                  Patterns Found
                </h3>
              </div>
              <p className="text-3xl font-bold text-[var(--muse-text)] mb-2">
                {feedback.analysisProgress.patterns.length}
              </p>
              <div className="space-y-2">
                {feedback.analysisProgress.patterns.map((pattern) => (
                  <div
                    key={pattern}
                    className="flex items-center gap-2 text-xs text-[var(--muse-text-muted)]"
                  >
                    <div className="w-2 h-2 rounded-full bg-[var(--muse-accent)]" />
                    {pattern}
                  </div>
                ))}
              </div>
            </div>

            {/* Blueprints */}
            <div className="bg-[var(--muse-surface-bright)] rounded-2xl p-6 border border-[var(--muse-border-light)]">
              <div className="flex items-center gap-2 mb-4">
                <Icons.Lightbulb size={20} className="text-yellow-500" />
                <h3 className="font-semibold text-[var(--muse-text)]">
                  Blueprints Matched
                </h3>
              </div>
              <p className="text-3xl font-bold text-[var(--muse-text)] mb-2">
                {feedback.analysisProgress.blueprints.length}
              </p>
              <div className="space-y-2">
                {feedback.analysisProgress.blueprints.map((bp) => (
                  <div
                    key={bp.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-[var(--muse-text-muted)]">
                      {bp.name.substring(0, 20)}...
                    </span>
                    <span className="font-bold text-[var(--muse-accent)]">
                      {bp.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-[var(--muse-surface-bright)] rounded-2xl p-6 border border-[var(--muse-border-light)]">
              <div className="flex items-center gap-2 mb-4">
                <Icons.Brain size={20} className="text-purple-500" />
                <h3 className="font-semibold text-[var(--muse-text)]">
                  AI Insights
                </h3>
              </div>
              <p className="text-3xl font-bold text-[var(--muse-text)] mb-2">
                {feedback.recommendations.length}
              </p>
              <div className="space-y-1">
                {feedback.recommendations.slice(0, 3).map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center gap-2 text-xs text-[var(--muse-text-muted)]"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        rec.priority === "high"
                          ? "bg-red-500"
                          : rec.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                    />
                    {rec.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-10 p-6 bg-[var(--muse-accent)]/10 border border-[var(--muse-accent)]/20 rounded-2xl">
          <div className="flex gap-4">
            <Icons.Info size={24} className="text-[var(--muse-accent)] flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-[var(--muse-text)] mb-2">
                How AI Analysis Works
              </h4>
              <ul className="space-y-2 text-sm text-[var(--muse-text-muted)]">
                <li className="flex gap-2">
                  <span className="text-[var(--muse-accent)]">•</span>
                  <span>
                    Real-time pattern recognition detects themes and concepts
                    in your content
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--muse-accent)]">•</span>
                  <span>
                    Blueprint matching connects your thoughts to established
                    frameworks
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--muse-accent)]">•</span>
                  <span>
                    Intelligent recommendations suggest next steps and
                    connections
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--muse-accent)]">•</span>
                  <span>
                    Resonance scoring ensures you find the most relevant
                    collaborators
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Recommendations */}
      <AIRecommendations
        recommendations={feedback.recommendations}
        isVisible={feedback.recommendations.length > 0}
      />
    </div>
  );
}
