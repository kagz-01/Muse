import { signal } from "@preact/signals";

export type StreakState = "ignition" | "resonance" | "fading" | "broken";

export interface UserStreak {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  count: number;
  lastActionAt: number; // timestamp of last cognitive interaction
  expiresAt: number; // timestamp when it breaks (usually lastActionAt + 24hrs)
}

// Mock data representing the 1-to-1 streaks
const MOCK_STREAKS: UserStreak[] = [
  {
    id: "str-1",
    partnerId: "u-2",
    partnerName: "Elena",
    count: 42,
    lastActionAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    expiresAt: Date.now() + 1000 * 60 * 60 * 22,
  },
  {
    id: "str-2",
    partnerId: "u-3",
    partnerName: "Marcus",
    count: 7,
    lastActionAt: Date.now() - 1000 * 60 * 60 * 23, // 23 hours ago (fading)
    expiresAt: Date.now() + 1000 * 60 * 60 * 1,
  },
  {
    id: "str-3",
    partnerId: "u-4",
    partnerName: "Sarah",
    count: 1,
    lastActionAt: Date.now() - 1000 * 60 * 60 * 5,
    expiresAt: Date.now() + 1000 * 60 * 60 * 19,
  }
];

export const streaksSignal = signal<UserStreak[]>(MOCK_STREAKS);

/**
 * Derives the visual state of the streak based on time and count.
 */
export function getStreakState(streak: UserStreak): StreakState {
  const now = Date.now();
  const timeRemaining = streak.expiresAt - now;

  if (timeRemaining <= 0) return "broken";
  
  // Fading if less than 4 hours remaining
  if (timeRemaining < 1000 * 60 * 60 * 4) return "fading";

  // Ignition if less than 3 days
  if (streak.count < 3) return "ignition";

  return "resonance";
}
