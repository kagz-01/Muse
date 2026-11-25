import { signal } from "@preact/signals";

export interface AnalysisProgress {
  stage: "idle" | "processing" | "analyzing" | "complete";
  percentage: number;
  message: string;
  patterns: string[];
  blueprints: Array<{
    id: string;
    name: string;
    score: number;
    matches: number;
  }>;
}

export interface AIRecommendation {
  id: string;
  type: "question" | "suggestion" | "insight" | "warning";
  title: string;
  message: string;
  action?: {
    label: string;
    handler: () => void;
  };
  priority: "low" | "medium" | "high";
}

export interface AIFeedbackState {
  analysisProgress: AnalysisProgress;
  recommendations: AIRecommendation[];
  isAnalyzing: boolean;
  error: string | null;
}

const initialState: AIFeedbackState = {
  analysisProgress: {
    stage: "idle",
    percentage: 0,
    message: "Ready for analysis",
    patterns: [],
    blueprints: [],
  },
  recommendations: [],
  isAnalyzing: false,
  error: null,
};

export const aiFeedbackSignal = signal<AIFeedbackState>(initialState);

export const startAnalysis = async (contentId: string) => {
  aiFeedbackSignal.value = {
    ...aiFeedbackSignal.value,
    isAnalyzing: true,
    error: null,
    analysisProgress: {
      ...aiFeedbackSignal.value.analysisProgress,
      stage: "processing",
      percentage: 0,
      message: "Starting analysis...",
    },
  };

  try {
    // Simulate analysis stages
    const stages = [
      {
        percentage: 25,
        message: "Extracting patterns...",
        patterns: ["AI Consciousness", "Digital Ethics", "AGI Development"],
      },
      {
        percentage: 50,
        message: "Building blueprints...",
        patterns: ["AI Consciousness", "Digital Ethics"],
      },
      {
        percentage: 75,
        message: "Calculating resonance scores...",
        patterns: ["AI Consciousness"],
      },
      {
        percentage: 100,
        message: "Analysis complete!",
        patterns: ["AI Consciousness"],
      },
    ];

    for (const stage of stages) {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      aiFeedbackSignal.value = {
        ...aiFeedbackSignal.value,
        analysisProgress: {
          stage: stage.percentage === 100 ? "complete" : "analyzing",
          percentage: stage.percentage,
          message: stage.message,
          patterns: stage.patterns,
          blueprints: stage.percentage >= 50
            ? [
              {
                id: "blueprint-1",
                name: "AI Consciousness Framework",
                score: 89,
                matches: 3,
              },
              {
                id: "blueprint-2",
                name: "Ethics in AI Systems",
                score: 76,
                matches: 2,
              },
            ]
            : [],
        },
      };
    }

    // Generate recommendations after analysis
    const recommendations: AIRecommendation[] = [
      {
        id: "rec-1",
        type: "question",
        title: "Deepen Your Exploration",
        message:
          "Have you considered the implications of consciousness in distributed systems?",
        priority: "high",
        action: {
          label: "Explore",
          handler: () => console.log("Exploring concept"),
        },
      },
      {
        id: "rec-2",
        type: "suggestion",
        title: "Connect Related Circles",
        message:
          "Your content resonates with the 'Philosophy of Mind' circle. Join to collaborate?",
        priority: "medium",
        action: {
          label: "Join Circle",
          handler: () => console.log("Joining circle"),
        },
      },
      {
        id: "rec-3",
        type: "insight",
        title: "Pattern Detected",
        message:
          "You've explored AI ethics in 3 separate thoughts. Consider synthesizing them into a comprehensive thread.",
        priority: "medium",
      },
    ];

    aiFeedbackSignal.value = {
      ...aiFeedbackSignal.value,
      recommendations,
      isAnalyzing: false,
    };
  } catch (err) {
    aiFeedbackSignal.value = {
      ...aiFeedbackSignal.value,
      error: err instanceof Error ? err.message : "Analysis failed",
      isAnalyzing: false,
      analysisProgress: {
        ...aiFeedbackSignal.value.analysisProgress,
        stage: "idle",
      },
    };
  }
};

export const dismissRecommendation = (id: string) => {
  const recommendations = aiFeedbackSignal.value.recommendations.filter(
    (r) => r.id !== id,
  );
  aiFeedbackSignal.value = {
    ...aiFeedbackSignal.value,
    recommendations,
  };
};

export const resetAnalysis = () => {
  aiFeedbackSignal.value = initialState;
};
