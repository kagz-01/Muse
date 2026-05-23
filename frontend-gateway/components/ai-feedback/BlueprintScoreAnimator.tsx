import { useEffect, useState } from "preact/hooks";

interface BlueprintScoreAnimatorProps {
  targetScore: number;
  duration?: number;
  onComplete?: () => void;
}

export default function BlueprintScoreAnimator({
  targetScore,
  duration = 1500,
  onComplete,
}: BlueprintScoreAnimatorProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!isAnimating) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const newScore = Math.round(easeProgress * targetScore);
      setDisplayScore(newScore);

      if (progress >= 1) {
        setDisplayScore(targetScore);
        setIsAnimating(false);
        clearInterval(interval);
        onComplete?.();
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [targetScore, duration, isAnimating, onComplete]);

  return (
    <div className="inline-flex items-center gap-2 text-2xl font-bold">
      <span
        className={`tabular-nums transition-colors duration-300 ${
          displayScore > 75
            ? "text-emerald-400"
            : displayScore > 50
            ? "text-amber-400"
            : "text-gray-400"
        }`}
      >
        {displayScore}
        <span className="text-base text-gray-500">%</span>
      </span>
      {isAnimating && (
        <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" />
      )}
    </div>
  );
}
