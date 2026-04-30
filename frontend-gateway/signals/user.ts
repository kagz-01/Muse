import { signal } from "@preact/signals";

export interface User {
  id: string;
  name: string;
  auraType: 'Architect' | 'Synthesizer' | 'Visionary' | 'Guardian';
  auraColor: string;
  cognitiveStreak: number;
  weeklyInsights: {
    resonanceScore: number;
    topThemes: string[];
    synthesisCount: number;
  };
  customStyling?: {
    journalWallpaper?: string;
    fontFamily?: string;
  };
}

export const userSignal = signal<User>({
  id: 'u1',
  name: 'Kagz',
  auraType: 'Synthesizer',
  auraColor: '#6366f1',
  cognitiveStreak: 12,
  weeklyInsights: {
    resonanceScore: 88,
    topThemes: ['Brutalism', 'Sovereignty', 'Stoicism'],
    synthesisCount: 5
  }
});

export const soloModeSignal = signal(false);

export function updateUserAura(type: User['auraType'], color: string) {
  userSignal.value = { ...userSignal.value, auraType: type, auraColor: color };
}

export function updateWeeklyInsights(insights: User['weeklyInsights']) {
  userSignal.value = { ...userSignal.value, weeklyInsights: insights };
}

export function incrementStreak() {
  userSignal.value = { ...userSignal.value, cognitiveStreak: userSignal.value.cognitiveStreak + 1 };
}
