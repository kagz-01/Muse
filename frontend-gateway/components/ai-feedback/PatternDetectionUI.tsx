import * as Icons from "lucide-preact";
import { useEffect, useState } from "preact/hooks";

export interface DetectedPattern {
  id: string;
  name: string;
  confidence: number;
  category: "theme" | "topic" | "sentiment" | "connection";
  timestamp: number;
}

interface PatternDetectionUIProps {
  patterns: DetectedPattern[];
  isAnalyzing?: boolean;
}

const categoryColors: Record<string, { bg: string; text: string; icon: any }> =
  {
    theme: {
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      icon: Icons.Sparkles,
    },
    topic: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      icon: Icons.Tag,
    },
    sentiment: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      icon: Icons.Heart,
    },
    connection: {
      bg: "bg-pink-500/10",
      text: "text-pink-400",
      icon: Icons.GitBranch,
    },
  };

export default function PatternDetectionUI({
  patterns,
  isAnalyzing = false,
}: PatternDetectionUIProps) {
  const [visiblePatterns, setVisiblePatterns] = useState<DetectedPattern[]>([]);

  useEffect(() => {
    // Animate patterns appearing
    if (patterns.length > visiblePatterns.length) {
      const timer = setTimeout(() => {
        setVisiblePatterns(patterns);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [patterns, visiblePatterns.length]);

  if (patterns.length === 0 && !isAnalyzing) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
        <Icons.Zap size={14} className="text-amber-400 animate-pulse" />
        Real-time Pattern Detection
      </div>

      <div className="grid grid-cols-2 gap-3">
        {visiblePatterns.map((pattern, idx) => {
          const config =
            categoryColors[pattern.category] || categoryColors.theme;
          const IconComponent = config.icon;

          return (
            <div
              key={pattern.id}
              className={`${config.bg} border border-white/10 rounded-lg px-3 py-2 animate-in fade-in slide-in-from-right-2 duration-500`}
              style={{
                animationDelay: `${idx * 75}ms`,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <IconComponent size={12} className={config.text} />
                <p className={`text-xs font-semibold ${config.text}`}>
                  {pattern.name}
                </p>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${config.text.replace("text-", "from-")} to-transparent`}
                  style={{
                    width: `${pattern.confidence}%`,
                    transition: "width 0.6s ease-out",
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {pattern.confidence}% confidence
              </p>
            </div>
          );
        })}

        {isAnalyzing && (
          <div className="bg-white/5 border border-dashed border-white/10 rounded-lg px-3 py-2 flex items-center justify-center h-full min-h-[76px] animate-pulse">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-white/20 border-t-canvas-primary rounded-full animate-spin mx-auto mb-2" />
              <p className="text-[10px] text-gray-500">Detecting...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
