/**
 * Context-specific Prompts and States
 * 
 * Uses personality-driven humor for various UI states:
 * - Empty states
 * - Error states
 * - Loading states
 * - Success states
 * - Setup/onboarding
 */

import { generateDynamicHumor, type GreetingPeriod, type UserContext } from "./dynamicHumor.ts";

export type { UserContext };

export interface PersonalityPromptPayload {
  context: UIContext;
  period: GreetingPeriod;
  streak: number;
  resonanceScore: number;
  entries: number;
  rooms: number;
  threads: number;
}

export type UIContext = 
  | "empty_journal" 
  | "empty_rooms" 
  | "empty_threads" 
  | "empty_community"
  | "error_sync"
  | "error_network"
  | "loading_deep"
  | "success_journal"
  | "success_synthesis"
  | "setup_profile"
  | "setup_first_journal"
  | "setup_first_room";

/**
 * Generate contextual prompt for UI states
 */
export function getContextualPrompt(
  context: UIContext,
  period: GreetingPeriod,
  userContext?: Partial<UserContext>,
): string {
  const baseHumor = generateDynamicHumor(period, userContext);

  const prompts: Record<UIContext, () => string> = {
    empty_journal: () =>
      "Your journal is empty. The blank page is waiting—it's the most honest moment before thought becomes pattern.",
    
    empty_rooms: () =>
      "No rooms yet. Create your first sanctuary—a space where your ideas can resonate and crystallize.",
    
    empty_threads: () =>
      "No threads woven yet. When you connect artifacts, that's when the real synthesis begins.",
    
    empty_community: () =>
      "You haven't joined any communities yet. Other minds are building wisdom in the rooms waiting for you.",
    
    error_sync: () =>
      "Sync failed. The platform stumbled—refresh and we'll try again. Even systems need to reset sometimes.",
    
    error_network: () =>
      "Network error. Muse can't reach out right now. Grab coffee; we'll be back when the connection settles.",
    
    loading_deep: () =>
      "Deepening your synthesis... The patterns are aligning in the background.",
    
    success_journal: () =>
      "Captured. Your reflection is now part of your wisdom thread.",
    
    success_synthesis: () =>
      "Synthesis complete. The threads are woven, the signal is clear.",
    
    setup_profile: () =>
      "Finish your profile. A name, a bio, a corner of the web that's yours. Then we begin.",
    
    setup_first_journal: () =>
      "Write your first reflection. Not a tweet, not a status—a real thought, fully formed.",
    
    setup_first_room: () =>
      "Create your first room. This is where your artifacts will live and grow.",
  };

  return prompts[context]();
}

export async function fetchPersonalityPrompt(
  context: UIContext,
  period: GreetingPeriod,
  userContext: Partial<UserContext> = {},
): Promise<string> {
  if (typeof window === "undefined") {
    return getContextualPrompt(context, period, userContext);
  }

  const payload: PersonalityPromptPayload = {
    context,
    period,
    streak: userContext.currentStreak ?? 0,
    resonanceScore: userContext.resonanceScore ?? 0,
    entries: userContext.journalEntryCount ?? 0,
    rooms: userContext.roomsJoined ?? 0,
    threads: userContext.threadsActive ?? 0,
  };

  try {
    const response = await fetch("/api/personality/greeting", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Personality greeting request failed: ${response.status}`);
    }

    const data = await response.json();
    if (typeof data.greeting === "string" && data.greeting.trim().length > 0) {
      return data.greeting.trim();
    }
  } catch (error) {
    console.error("[Personality] fetchPersonalityPrompt failed:", error);
  }

  return getContextualPrompt(context, period, userContext);
}

/**
 * Empty state messages with personality
 */
export const emptyStateMessages = {
  journal: {
    title: "No reflections yet",
    description: "Begin collecting your thoughts. Each entry builds the map of your thinking.",
    cta: "Write your first entry",
  },
  rooms: {
    title: "No rooms created",
    description: "Rooms are where your ideas crystallize. Start one when you're ready.",
    cta: "Create a room",
  },
  threads: {
    title: "No threads woven",
    description: "Threads connect your artifacts into patterns. The weaving begins with your first link.",
    cta: "Create a thread",
  },
  community: {
    title: "No communities joined",
    description: "Connect with other synthesizers. Their wisdom sharpens yours.",
    cta: "Explore communities",
  },
};

/**
 * Error messages with personality
 */
export const errorMessages = {
  sync: {
    title: "Sync interrupted",
    description: "Muse couldn't reach your profile. Your work is safe—refresh and we'll reconnect.",
  },
  network: {
    title: "Connection lost",
    description: "The internet is having a moment. Try again when the signal returns.",
  },
  permission: {
    title: "Permission denied",
    description: "You don't have access to this yet. Ask the room owner or try another path.",
  },
  notFound: {
    title: "Not found",
    description: "This room, thread, or artifact has moved or disappeared. The journey continues elsewhere.",
  },
};

/**
 * Loading state messages
 */
export const loadingMessages = [
  "Synthesizing your patterns...",
  "Connecting your threads...",
  "Deepening your resonance...",
  "Aligning your insights...",
  "Building your wisdom map...",
  "The platform is listening...",
];

export function getRandomLoadingMessage(): string {
  return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
}
