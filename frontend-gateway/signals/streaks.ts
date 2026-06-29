import { signal } from "@preact/signals";
import { userSignal } from "./user.ts";
import { safeFetch } from "../utils/safeFetch.ts";
import { buildSparkSummary, deriveNextStreakState } from "../utils/streakEngine.ts";

export type StreakState = "ignition" | "resonance" | "fading" | "broken";

const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24;
const FOUR_HOURS = 1000 * 60 * 60 * 4;
const STORAGE_KEY = "muse-streaks";

export interface StreakHistory {
  timestamp: number;
  action: string; // e.g. "shared artifact", "extended thought", "journal reflection"
}

export interface UserStreak {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  count: number;
  lastActionAt: number;
  expiresAt: number;
  history: StreakHistory[];
  createdAt: number;
}

export interface StreakPermissions {
  show_active: boolean;
  show_mood: boolean;
  show_room_titles: boolean;
  show_journal_previews: boolean;
}

export interface MomentumFeedItem {
  type: string;
  created_at: string;
  content: string;
}

export interface GlobalStreak {
  currentStreak: number;
  longestStreak: number;
  totalJournalDays: number;
  lastEntryDate: string;
  streakLevel: string;
  freezeCount: number;
  milestonesUnlocked: number[];
  permissions: StreakPermissions;
}

export const globalStreakSignal = signal<GlobalStreak | null>(null);
export const momentumFeedSignal = signal<MomentumFeedItem[]>([]);

// Seed data so the feature isn't empty on first visit
const SEED_STREAKS: UserStreak[] = [
  {
    id: "str-1",
    partnerId: "u-2",
    partnerName: "Elena",
    count: 42,
    lastActionAt: Date.now() - 1000 * 60 * 60 * 2,
    expiresAt: Date.now() + 1000 * 60 * 60 * 22,
    createdAt: Date.now() - TWENTY_FOUR_HOURS * 42,
    history: [
      {
        timestamp: Date.now() - 1000 * 60 * 60 * 2,
        action: "Shared an artifact in Philosophy",
      },
      {
        timestamp: Date.now() - TWENTY_FOUR_HOURS,
        action: "Extended thought on consciousness",
      },
      {
        timestamp: Date.now() - TWENTY_FOUR_HOURS * 2,
        action: "Journal reflection exchange",
      },
    ],
  },
  {
    id: "str-2",
    partnerId: "u-3",
    partnerName: "Marcus",
    count: 7,
    lastActionAt: Date.now() - 1000 * 60 * 60 * 21,
    expiresAt: Date.now() + 1000 * 60 * 60 * 3, // fading
    createdAt: Date.now() - TWENTY_FOUR_HOURS * 7,
    history: [
      {
        timestamp: Date.now() - 1000 * 60 * 60 * 21,
        action: "Added artifact to shared room",
      },
    ],
  },
  {
    id: "str-3",
    partnerId: "u-4",
    partnerName: "Sarah",
    count: 1,
    lastActionAt: Date.now() - 1000 * 60 * 60 * 5,
    expiresAt: Date.now() + 1000 * 60 * 60 * 19,
    createdAt: Date.now() - TWENTY_FOUR_HOURS,
    history: [
      {
        timestamp: Date.now() - 1000 * 60 * 60 * 5,
        action: "Started a new synthesis chain",
      },
    ],
  },
];

function loadStreaks(): UserStreak[] {
  if (typeof localStorage === "undefined") return SEED_STREAKS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as UserStreak[];
      return parsed.length > 0 ? parsed : SEED_STREAKS;
    }
    return SEED_STREAKS;
  } catch {
    return SEED_STREAKS;
  }
}

export const streaksSignal = signal<UserStreak[]>(loadStreaks());

// Auto-persist on change
if (typeof localStorage !== "undefined") {
  streaksSignal.subscribe((streaks) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(streaks));
    } catch { /* quota exceeded fallback */ }
  });
}

/** Derives the visual state of a streak based on time and count. */
export function getStreakState(streak: UserStreak): StreakState {
  const now = Date.now();
  const timeRemaining = streak.expiresAt - now;

  if (timeRemaining <= 0) return "broken";
  if (timeRemaining < FOUR_HOURS) return "fading";
  if (streak.count < 3) return "ignition";
  return "resonance";
}

/** Extend a streak — resets the 24-hour timer and increments the count. */
export function extendStreak(streakId: string, action = "Extended thought") {
  const now = Date.now();
  streaksSignal.value = streaksSignal.value.map((s) => {
    if (s.id !== streakId) return s;
    return {
      ...s,
      count: s.count + 1,
      lastActionAt: now,
      expiresAt: now + TWENTY_FOUR_HOURS,
      history: [{ timestamp: now, action }, ...s.history].slice(0, 50), // keep last 50
    };
  });
}

/** Start a new streak with a connection. */
export function startStreak(
  partnerId: string,
  partnerName: string,
  partnerAvatar?: string,
) {
  const now = Date.now();
  const newStreak: UserStreak = {
    id: `str-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    partnerId,
    partnerName,
    partnerAvatar,
    count: 1,
    lastActionAt: now,
    expiresAt: now + TWENTY_FOUR_HOURS,
    createdAt: now,
    history: [{ timestamp: now, action: "Started a new synthesis chain" }],
  };
  streaksSignal.value = [...streaksSignal.value, newStreak];
  return newStreak;
}

/** Remove a broken streak permanently. */
export function removeStreak(streakId: string) {
  streaksSignal.value = streaksSignal.value.filter((s) => s.id !== streakId);
}

/** Prune all broken streaks. Returns number removed. */
export function pruneBrokenStreaks(): number {
  const before = streaksSignal.value.length;
  streaksSignal.value = streaksSignal.value.filter((s) =>
    getStreakState(s) !== "broken"
  );
  return before - streaksSignal.value.length;
}

/** Load global streak from backend */
export async function loadGlobalStreak() {
  const isDemo = userSignal.value?.id === "__demo__";
  if (isDemo) {
    globalStreakSignal.value = {
      currentStreak: 12,
      longestStreak: 45,
      totalJournalDays: 120,
      lastEntryDate: new Date().toISOString().split("T")[0],
      streakLevel: "Aura",
      freezeCount: 2,
      milestonesUnlocked: [],
      permissions: {
        show_active: true,
        show_mood: true,
        show_room_titles: false,
        show_journal_previews: false,
      },
    };
    return;
  }

  try {
    const res = await safeFetch("/api/user/streaks", { entity: "streak" });
    if (res.ok) {
      const data = await res.json();
      globalStreakSignal.value = {
        currentStreak: data.streak.current_streak,
        longestStreak: data.streak.longest_streak,
        totalJournalDays: data.streak.total_journal_days,
        lastEntryDate: data.streak.last_entry_date,
        streakLevel: data.streak.streak_level,
        freezeCount: data.streak.freeze_count,
        milestonesUnlocked: data.streak.milestones_unlocked || [],
        permissions: data.streak.permissions,
      };
      if (data.feed) {
        momentumFeedSignal.value = data.feed;
      }
    }
  } catch (e) {
    console.error("Failed to load global streak", e);
  }
}

/** Update the streak privacy permissions */
export async function setSparkPermissions(permissions: Partial<StreakPermissions>) {
  const isDemo = userSignal.value?.id === "__demo__";
  
  const updatedPermissions = {
    ...(globalStreakSignal.value?.permissions || {
      show_active: true,
      show_mood: false,
      show_room_titles: false,
      show_journal_previews: false
    }),
    ...permissions
  };

  if (isDemo) {
    if (globalStreakSignal.value) {
      globalStreakSignal.value = {
        ...globalStreakSignal.value,
        permissions: updatedPermissions,
      };
    }
    return true;
  }

  try {
    const res = await safeFetch("/api/user/streaks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set_permissions", permissions: updatedPermissions }),
      entity: "settings",
    });

    if (res.ok) {
      if (globalStreakSignal.value) {
        globalStreakSignal.value = {
          ...globalStreakSignal.value,
          permissions: updatedPermissions,
        };
      }
      return true;
    }
  } catch (e) {
    console.error("Failed to set spark permissions", e);
  }
  return false;
}

/** Capture Momentum (Log a real action to extend streak) */
export async function captureMomentum(type: string, content: string, destination: string = "journal") {
  const isDemo = userSignal.value?.id === "__demo__";
  
  if (isDemo) {
    if (globalStreakSignal.value) {
      const today = new Date().toDateString();
      const nextState = deriveNextStreakState({
        currentStreak: globalStreakSignal.value.currentStreak,
        longestStreak: globalStreakSignal.value.longestStreak,
        totalJournalDays: globalStreakSignal.value.totalJournalDays,
        lastEntryDate: globalStreakSignal.value.lastEntryDate || "",
        today,
      });

      const sparkSummary = buildSparkSummary(type, content, destination);

      globalStreakSignal.value = {
        ...globalStreakSignal.value,
        currentStreak: nextState.shouldCount ? nextState.currentStreak : globalStreakSignal.value.currentStreak,
        longestStreak: nextState.shouldCount ? nextState.longestStreak : globalStreakSignal.value.longestStreak,
        totalJournalDays: nextState.shouldCount ? nextState.totalJournalDays : globalStreakSignal.value.totalJournalDays,
        lastEntryDate: nextState.shouldCount ? nextState.lastEntryDate : globalStreakSignal.value.lastEntryDate,
        streakLevel: nextState.shouldCount ? nextState.streakLevel : globalStreakSignal.value.streakLevel,
      };
      
      momentumFeedSignal.value = [
        { type, created_at: new Date().toISOString(), content: sparkSummary },
        ...momentumFeedSignal.value
      ];
    }
    return true;
  }

  try {
    const res = await safeFetch("/api/user/streaks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "capture_momentum", type, content, destination }),
      entity: "streak",
    });

    if (res.ok) {
      const data = await res.json();
      if (globalStreakSignal.value) {
        globalStreakSignal.value = {
          ...globalStreakSignal.value,
          currentStreak: data.newStreak ?? globalStreakSignal.value.currentStreak,
          longestStreak: data.longestStreak ?? globalStreakSignal.value.longestStreak,
          totalJournalDays: data.totalJournalDays ?? globalStreakSignal.value.totalJournalDays,
          lastEntryDate: data.lastEntryDate ?? globalStreakSignal.value.lastEntryDate,
          streakLevel: data.streakLevel ?? globalStreakSignal.value.streakLevel,
        };
      }
      
      momentumFeedSignal.value = [
        { type, created_at: new Date().toISOString(), content: data.summary || buildSparkSummary(type, content, destination) },
        ...momentumFeedSignal.value
      ];
      return true;
    }
  } catch (e) {
    console.error("Failed to capture momentum", e);
  }
  return false;
}
