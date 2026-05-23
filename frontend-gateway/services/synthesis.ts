// Synthesis Logic Engine
// Analyzes signals from multiple rooms and generates coherent thesis

export interface SynthesisAnalysis {
  thesis: string;
  coherenceScore: number; // 0-100 - how well signals align
  patterns: string[]; // Common themes across signals
  tensions: string[]; // Contradictions or opposing views
  recommendations: string[];
  signalMap: Map<string, number>; // Signal ID -> resonance score
}

export interface Signal {
  id: string;
  content: string;
  roomId: string;
  type: "insight" | "challenge" | "question" | "artifact";
  resonance?: number;
}

/**
 * Analyzes signals from source rooms to generate synthesis thesis
 * This is a sophisticated pattern-matching algorithm that:
 * 1. Finds common themes across signals
 * 2. Measures coherence between different viewpoints
 * 3. Identifies creative tensions
 * 4. Generates coherence score
 */
export function analyzeSynthesis(
  signals: Signal[],
  thesis?: string,
): SynthesisAnalysis {
  if (!signals.length) {
    return {
      thesis: thesis || "No signals to analyze",
      coherenceScore: 0,
      patterns: [],
      tensions: [],
      recommendations: [],
      signalMap: new Map(),
    };
  }

  const patterns = extractPatterns(signals);
  const tensions = extractTensions(signals);
  const coherenceScore = calculateCoherence(signals, patterns);
  const recommendations = generateRecommendations(patterns, tensions);
  const signalMap = scoreSignals(signals, patterns);

  return {
    thesis: thesis ||
      `Synthesis of ${signals.length} signals across ${
        new Set(signals.map((s) => s.roomId)).size
      } rooms`,
    coherenceScore,
    patterns,
    tensions,
    recommendations,
    signalMap,
  };
}

/**
 * Extracts common themes/keywords from signals
 */
function extractPatterns(signals: Signal[]): string[] {
  const keywords = new Set<string>();

  // Common theme keywords
  const themeKeywords: Record<string, string[]> = {
    authenticity: ["raw", "honest", "real", "genuine", "true", "authentic"],
    sovereignty: [
      "autonomous",
      "independent",
      "sovereign",
      "control",
      "freedom",
    ],
    restraint: [
      "minimal",
      "sparse",
      "simple",
      "constraint",
      "discipline",
      "limitation",
    ],
    consciousness: [
      "aware",
      "conscious",
      "intelligence",
      "mind",
      "thought",
      "cognition",
    ],
    beauty: [
      "elegant",
      "beautiful",
      "aesthetic",
      "grace",
      "harmony",
      "refined",
    ],
    structure: [
      "architecture",
      "structure",
      "system",
      "framework",
      "organization",
      "order",
    ],
  };

  const contentLower = signals
    .map((s) => s.content.toLowerCase())
    .join(" ");

  for (const [theme, terms] of Object.entries(themeKeywords)) {
    const matches = terms.filter((term) => contentLower.includes(term));
    if (matches.length > 0) {
      keywords.add(theme);
    }
  }

  return Array.from(keywords);
}

/**
 * Identifies creative tensions between signals
 */
function extractTensions(signals: Signal[]): string[] {
  const tensions: string[] = [];

  // Check for opposing sentiment pairs
  const opposites = [
    { pos: ["minimal", "simple"], neg: ["complex", "elaborate", "rich"] },
    { pos: ["future", "forward"], neg: ["past", "backward", "history"] },
    { pos: ["order", "structure"], neg: ["chaos", "freedom", "wild"] },
    { pos: ["rational", "logic"], neg: ["intuition", "feeling", "emotion"] },
  ];

  const contentLower = signals
    .map((s) => s.content.toLowerCase())
    .join(" ");

  for (const pair of opposites) {
    const hasPos = pair.pos.some((word) => contentLower.includes(word));
    const hasNeg = pair.neg.some((word) => contentLower.includes(word));

    if (hasPos && hasNeg) {
      tensions.push(
        `${pair.pos[0]} vs ${pair.neg[0]} - balancing opposite forces`,
      );
    }
  }

  return tensions;
}

/**
 * Calculates how well signals align (0-100)
 * Higher score = more coherent synthesis
 */
function calculateCoherence(signals: Signal[], patterns: string[]): number {
  if (!signals.length) return 0;
  if (!patterns.length) return 20; // Some base coherence

  // Factors that increase coherence:
  // 1. Signal alignment with patterns
  // 2. Diversity of source rooms (more diversity = more interesting synthesis)
  // 3. Rich content (longer signals tend to have more depth)

  let alignmentScore = 0;
  const roomDiversity = new Set(signals.map((s) => s.roomId)).size;
  const avgContentLength =
    signals.reduce((sum, s) => sum + s.content.length, 0) / signals.length;

  // Pattern alignment: how many signals contain pattern keywords
  for (const signal of signals) {
    const signalContent = signal.content.toLowerCase();
    for (const pattern of patterns) {
      if (signalContent.includes(pattern)) {
        alignmentScore++;
      }
    }
  }

  // Normalize and combine factors
  const normalizedAlignment =
    (alignmentScore / (signals.length * patterns.length)) * 100;
  const diversityBonus = Math.min(roomDiversity * 10, 25);
  const lengthBonus = Math.min((avgContentLength / 200) * 15, 15);

  return Math.min(
    100,
    Math.round(normalizedAlignment + diversityBonus + lengthBonus),
  );
}

/**
 * Generates recommendations for deepening the synthesis
 */
function generateRecommendations(
  patterns: string[],
  tensions: string[],
): string[] {
  const recommendations: string[] = [];

  if (patterns.length > 0) {
    recommendations.push(
      `Explore the theme of "${patterns[0]}" more deeply across your rooms`,
    );
  }

  if (tensions.length > 0) {
    recommendations.push(`Address the tension: ${tensions[0]}`);
  }

  if (patterns.length > 2) {
    recommendations.push(
      `Consider how these patterns interconnect: ${
        patterns.slice(0, 3).join(", ")
      }`,
    );
  }

  if (!recommendations.length) {
    recommendations.push("Add more signals to strengthen your synthesis");
    recommendations.push("Look for unexpected connections between rooms");
  }

  return recommendations;
}

/**
 * Scores individual signals based on their relevance to patterns
 */
function scoreSignals(
  signals: Signal[],
  patterns: string[],
): Map<string, number> {
  const scoreMap = new Map<string, number>();

  for (const signal of signals) {
    let score = 50; // Base score
    const content = signal.content.toLowerCase();

    // Bonus for pattern matches
    for (const pattern of patterns) {
      if (content.includes(pattern)) {
        score += 15;
      }
    }

    // Bonus for content depth (longer signals often have more substance)
    if (signal.content.length > 300) score += 15;
    if (signal.content.length > 600) score += 10;

    // Bonus for signal type diversity
    if (signal.type === "insight") score += 10;
    if (signal.type === "challenge") score += 15;

    scoreMap.set(signal.id, Math.min(100, score));
  }

  return scoreMap;
}

/**
 * Generates a coherent thesis statement from analysis
 */
export function generateThesisStatement(
  analysis: SynthesisAnalysis,
  _roomNames: string[],
): string {
  const { patterns, coherenceScore } = analysis;

  if (!patterns.length) {
    return "A synthesis waiting for deeper coherence.";
  }

  const mainPattern = patterns[0];
  const strength = coherenceScore > 80
    ? "powerfully"
    : coherenceScore > 60
    ? "compellingly"
    : "exploratorily";

  return `${
    strength.charAt(0).toUpperCase() + strength.slice(1)
  } synthesizing the theme of ${mainPattern} across your collected signals.`;
}

/**
 * Calculates synthesis quality metrics
 */
export function calculateSynthesisMetrics(analysis: SynthesisAnalysis) {
  return {
    coherence: analysis.coherenceScore,
    depth: Math.min(100, analysis.patterns.length * 25),
    complexity: analysis.tensions.length * 20,
    completeness: Math.round(
      (analysis.signalMap.size / Math.max(1, analysis.signalMap.size)) * 100,
    ),
  };
}
