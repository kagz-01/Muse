import { signal } from "@preact/signals";
import { userSignal } from "./user.ts";
import { safeFetch } from "../utils/safeFetch.ts";
import { DEMO_JOURNALS } from "../utils/demo_data.ts";
import { registerIdSwapCallback } from "../utils/syncQueue.ts";

export type JournalMood =
  | "reflective"
  | "grounded"
  | "charged"
  | "anxious"
  | "custom";

export type StreakLevel = "Spark" | "Flame" | "Inferno" | "Phoenix";
export type EntryType = "reflection" | "synthesis";
export type VaultAccessLevel = "public" | "private" | "vault";

export interface LinkedArtifact {
  id: string;
  type: "room" | "thread";
  title: string;
  linkedAt: number;
}

export interface SynthesisData {
  sourceRoomIds: string[];
  sourceThreadIds: string[];
  keyInsights: string[];
  patterns: string[];
  nextActions: string[];
  synthesizedAt: number;
}

export const moodConfig: Record<
  JournalMood | "custom",
  { label: string; color: string; emoji: string; hex: string }
> = {
  reflective: {
    label: "Reflective",
    color: "blue-400",
    emoji: "💭",
    hex: "#60a5fa",
  },
  grounded: {
    label: "Grounded",
    color: "emerald-400",
    emoji: "🌱",
    hex: "#34d399",
  },
  charged: {
    label: "Charged",
    color: "amber-400",
    emoji: "⚡️",
    hex: "#fbbf24",
  },
  anxious: { label: "Anxious", color: "rose-400", emoji: "🌪", hex: "#fb7185" },
  custom: { label: "Custom", color: "#6b7280", emoji: "✨", hex: "#6b7280" },
};

export type MoodStat = {
  mood: string;
  label: string;
  emoji: string;
  color: string;
  count: number;
};
export type HeatmapDay = { date: Date; count: number };

export interface VaultConfig {
  isVaulted: boolean;
  passwordHash?: string;
  createdAt?: number;
}

export interface JournalEntry {
  id: string;
  body: string;
  mood: JournalMood;
  customMood?: string;
  tags: string[];
  linkedItemIds: string[];
  isFavorited: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
  // Phase 2 fields
  type?: EntryType;
  synthesis?: SynthesisData;
  vault?: VaultConfig;
  linkedArtifacts?: LinkedArtifact[];
  viewCount?: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  lastEntryDate: string;
  freezeCount: number;
  freezeResetMonth: number;
  milestonesUnlocked: number[];
  currentLevel: StreakLevel;
}

const STORAGE_KEY = "muse_journal_v2";
const STREAK_METADATA_KEY = "muse_streak_metadata_v1";

function loadStreakMetadata(): StreakData {
  if (typeof localStorage === "undefined") {
    return getDefaultStreakData();
  }
  try {
    const stored = localStorage.getItem(STREAK_METADATA_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore parse errors
  }
  return getDefaultStreakData();
}

function getDefaultStreakData(): StreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    totalDays: 0,
    lastEntryDate: "",
    freezeCount: 2,
    freezeResetMonth: new Date().getMonth(),
    milestonesUnlocked: [],
    currentLevel: "Spark",
  };
}

const JOURNAL_MOODS: JournalMood[] = [
  "reflective",
  "grounded",
  "charged",
  "anxious",
  "custom",
];

function isJournalMood(value: unknown): value is JournalMood {
  return typeof value === "string" &&
    JOURNAL_MOODS.includes(value as JournalMood);
}

function normalizeJournalEntry(raw: unknown): JournalEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const entry = raw as Partial<JournalEntry> & Record<string, unknown>;

  const body = typeof entry.body === "string" ? entry.body : "";
  const tags = Array.isArray(entry.tags)
    ? entry.tags.filter((tag): tag is string => typeof tag === "string")
    : [];
  const linkedItemIds = Array.isArray(entry.linkedItemIds)
    ? entry.linkedItemIds.filter((id): id is string => typeof id === "string")
    : [];

  const createdAt = typeof entry.createdAt === "number"
    ? entry.createdAt
    : Date.now();
  const updatedAt = typeof entry.updatedAt === "number"
    ? entry.updatedAt
    : createdAt;

  return {
    id: typeof entry.id === "string" && entry.id.length > 0
      ? entry.id
      : generateSafeId(),
    body,
    mood: isJournalMood(entry.mood) ? entry.mood : "reflective",
    customMood: typeof entry.customMood === "string"
      ? entry.customMood
      : undefined,
    tags,
    linkedItemIds,
    isFavorited: !!entry.isFavorited,
    isPinned: typeof entry.isPinned === "boolean" ? entry.isPinned : false,
    isArchived: typeof entry.isArchived === "boolean"
      ? entry.isArchived
      : false,
    isPublic: typeof entry.isPublic === "boolean" ? entry.isPublic : false,
    createdAt,
    updatedAt,
    wordCount: typeof entry.wordCount === "number"
      ? entry.wordCount
      : body.trim().split(/\s+/).filter(Boolean).length,
    type: entry.type === "reflection" || entry.type === "synthesis"
      ? entry.type
      : undefined,
    synthesis: typeof entry.synthesis === "object" && entry.synthesis !== null
      ? entry.synthesis as SynthesisData
      : undefined,
    vault: typeof entry.vault === "object" && entry.vault !== null
      ? entry.vault as VaultConfig
      : undefined,
    linkedArtifacts: Array.isArray(entry.linkedArtifacts)
      ? entry.linkedArtifacts as LinkedArtifact[]
      : undefined,
    viewCount: typeof entry.viewCount === "number"
      ? entry.viewCount
      : undefined,
  };
}

function getDemoJournalEntries(): JournalEntry[] {
  return DEMO_JOURNALS.map((entry) => ({
    id: entry.id,
    body: entry.body,
    mood: entry.mood as JournalMood,
    tags: entry.tags,
    linkedItemIds: entry.linkedItemIds,
    isFavorited: entry.isFavorited,
    isPublic: entry.isPublic,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    wordCount: entry.wordCount,
    type: entry.type as JournalEntry["type"],
    synthesis: entry.synthesis,
    linkedArtifacts: entry.linkedArtifacts,
    viewCount: entry.viewCount,
  })) as JournalEntry[];
}

function loadJournal(): JournalEntry[] {
  const isDemo = userSignal.value?.id === "__demo__";

  if (typeof localStorage === "undefined") {
    return isDemo ? getDemoJournalEntries() : [];
  }
  try {
    if (!isDemo) return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as unknown;
        if (!Array.isArray(parsed)) {
          return getDemoJournalEntries();
        }
        return parsed
          .map(normalizeJournalEntry)
          .filter((entry): entry is JournalEntry => entry !== null);
      } catch {
        return getDemoJournalEntries();
      }
    }
  } catch {
    return isDemo ? getDemoJournalEntries() : [];
  }

  return isDemo ? getDemoJournalEntries() : [];
}

export const journalSignal = signal<JournalEntry[]>(loadJournal());
export const streakMetadataSignal = signal<StreakData>(loadStreakMetadata());

// Persistence
if (typeof localStorage !== "undefined") {
  journalSignal.subscribe((entries: JournalEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // ignore write errors in restricted environments
    }
  });

  userSignal.subscribe((user) => {
    if (user?.id === "__demo__") {
      if (!journalSignal.value.some((entry) => entry.id.startsWith("demo-"))) {
        journalSignal.value = getDemoJournalEntries();
      }
    } else {
      journalSignal.value = [];
      localStorage.removeItem(STORAGE_KEY);
    }
  });

  streakMetadataSignal.subscribe((metadata: StreakData) => {
    try {
      localStorage.setItem(STREAK_METADATA_KEY, JSON.stringify(metadata));
    } catch {
      // ignore write errors
    }
  });
}

export const dailyWordGoalSignal = signal(500);

// Safe ID generator that works even if crypto.randomUUID is not available (e.g. over local HTTP)
function generateSafeId(): string {
  if (
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

export async function addEntry(
  body = "",
  isPublic = false,
  mood?: JournalMood,
  tags: string[] = [],
): Promise<JournalEntry> {
  const isDemo = userSignal.value?.id === "__demo__";

  let newEntry: JournalEntry;
  let tempId: string | undefined;

  if (isDemo) {
    tempId = generateSafeId();
    newEntry = {
      id: tempId,
      body: body || "New reflection...",
      mood: mood || "reflective",
      tags: tags || [],
      linkedItemIds: [],
      isFavorited: false,
      isPinned: false,
      isArchived: false,
      isPublic,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      wordCount:
        (body || "New reflection...").trim().split(/\s+/).filter(Boolean)
          .length,
    };
  } else {
    tempId = generateSafeId();
    const response = await safeFetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rawThought: body || "New reflection...",
        isPublic,
        mood,
        tags,
      }),
      entity: "journal",
      tempId,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to capture journal entry: ${await response.text()}`,
      );
    }

    const data = await response.json();

    // If it was queued offline, we use our temp data
    if (data.queued) {
      newEntry = {
        id: tempId,
        body: body || "New reflection...",
        mood: mood || "reflective",
        tags: tags || [],
        linkedItemIds: [],
        isFavorited: false,
        isPinned: false,
        isArchived: false,
        isPublic,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        wordCount:
          (body || "New reflection...").trim().split(/\s+/).filter(Boolean)
            .length,
      };
    } else {
      const { entry } = data;
      newEntry = {
        id: entry.id,
        body: entry.raw_thought,
        mood: entry.mood || "reflective",
        tags: entry.tags || [],
        linkedItemIds: [],
        isFavorited: entry.is_favorited || false,
        isPinned: entry.is_pinned || false,
        isArchived: entry.is_archived || false,
        isPublic: entry.is_public || isPublic,
        createdAt: new Date(entry.created_at).getTime(),
        updatedAt: new Date(entry.updated_at).getTime(),
        wordCount: entry.raw_thought.trim().split(/\s+/).filter(Boolean).length,
        synthesis: entry.synthesized_context || undefined,
      };
    }
  }

  journalSignal.value = [newEntry, ...journalSignal.value];

  updateStreakOnNewEntry();

  return newEntry;
}

export async function updateJournalEntry(
  id: string,
  updates: Partial<JournalEntry>,
) {
  const isDemo = userSignal.value?.id === "__demo__";

  // Optimistic update
  journalSignal.value = journalSignal.value.map((e: JournalEntry) => {
    if (e.id === id) {
      const updated = { ...e, ...updates, updatedAt: Date.now() };
      if (updates.body !== undefined) {
        updated.wordCount =
          updates.body.trim().split(/\s+/).filter(Boolean).length;
      }
      return updated;
    }
    return e;
  });

  if (!isDemo && !id.startsWith("j")) {
    const apiUpdates = {
      rawThought: updates.body,
      mood: updates.mood,
      tags: updates.tags,
      isFavorited: updates.isFavorited,
      isPinned: updates.isPinned,
      isArchived: updates.isArchived,
      isPublic: updates.isPublic,
    };

    // Remove undefined
    Object.keys(apiUpdates).forEach((key) =>
      apiUpdates[key as keyof typeof apiUpdates] === undefined &&
      delete apiUpdates[key as keyof typeof apiUpdates]
    );

    try {
      await safeFetch(`/api/journal/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiUpdates),
        entity: "journal",
      });
    } catch (e) {
      console.error("Failed to update journal on backend", e);
    }
  }
}

export async function deleteJournalEntry(id: string) {
  const isDemo = userSignal.value?.id === "__demo__";

  journalSignal.value = journalSignal.value.filter((e: JournalEntry) =>
    e.id !== id
  );

  if (!isDemo && !id.startsWith("j")) {
    try {
      await safeFetch(`/api/journal/${id}`, {
        method: "DELETE",
        entity: "journal",
      });
    } catch (e) {
      console.error("Failed to delete journal on backend", e);
    }
  }
}

export async function toggleFavoriteJournal(id: string) {
  const entry = journalSignal.value.find((e) => e.id === id);
  if (entry) {
    await updateJournalEntry(id, { isFavorited: !entry.isFavorited });
  }
}

export async function togglePinJournal(id: string) {
  const entry = journalSignal.value.find((e) => e.id === id);
  if (entry) {
    await updateJournalEntry(id, { isPinned: !entry.isPinned });
  }
}

export async function toggleArchiveJournal(id: string) {
  const entry = journalSignal.value.find((e) => e.id === id);
  if (entry) {
    await updateJournalEntry(id, { isArchived: !entry.isArchived });
  }
}

export function getJournalStreak(): number {
  return streakMetadataSignal.value.currentStreak;
}

function updateStreakOnNewEntry(): void {
  const metadata = streakMetadataSignal.value;
  const today = new Date().toDateString();

  // Already wrote today, don't update
  if (metadata.lastEntryDate === today) {
    return;
  }

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  let newStreak = metadata.currentStreak;

  // If wrote yesterday or today is first entry
  if (metadata.lastEntryDate === yesterday || metadata.currentStreak === 0) {
    newStreak = metadata.currentStreak + 1;
  } else {
    // Streak broken, reset to 1
    newStreak = 1;
  }

  // Update longest streak if current > longest
  const newLongest = Math.max(newStreak, metadata.longestStreak);

  // Check for milestone unlock
  const unlockedMilestones = getUnlockedMilestones(
    newStreak,
    metadata.milestonesUnlocked,
  );

  // Calculate streak level
  const level = getStreakLevelForCount(newStreak);

  const updated: StreakData = {
    ...metadata,
    currentStreak: newStreak,
    longestStreak: newLongest,
    totalDays: metadata.totalDays + 1,
    lastEntryDate: today,
    currentLevel: level,
    milestonesUnlocked: unlockedMilestones,
  };

  streakMetadataSignal.value = updated;
}

function getUnlockedMilestones(
  currentStreak: number,
  alreadyUnlocked: number[],
): number[] {
  const milestones = [7, 30, 100, 365, 1000];
  const newUnlocked = [...alreadyUnlocked];

  for (const milestone of milestones) {
    if (currentStreak === milestone && !newUnlocked.includes(milestone)) {
      newUnlocked.push(milestone);
    }
  }

  return newUnlocked;
}

function getStreakLevelForCount(count: number): StreakLevel {
  if (count >= 365) return "Phoenix";
  if (count >= 100) return "Inferno";
  if (count >= 30) return "Flame";
  return "Spark";
}

export function getStreakData(): StreakData {
  return streakMetadataSignal.value;
}

export function freezeStreak(): boolean {
  const metadata = streakMetadataSignal.value;
  const currentMonth = new Date().getMonth();

  // Reset freeze count if month changed
  if (metadata.freezeResetMonth !== currentMonth) {
    metadata.freezeResetMonth = currentMonth;
    metadata.freezeCount = 2;
  }

  // Can't freeze if no freezes left
  if (metadata.freezeCount <= 0) {
    return false;
  }

  const updated: StreakData = {
    ...metadata,
    freezeCount: metadata.freezeCount - 1,
  };

  streakMetadataSignal.value = updated;
  return true;
}

export function getMoodStats(): MoodStat[] {
  const entries = journalSignal.value;
  const stats: Record<string, number> = {};
  entries.forEach((entry: JournalEntry) => {
    const m = entry.mood === "custom" && entry.customMood
      ? entry.customMood
      : entry.mood;
    stats[m] = (stats[m] || 0) + 1;
  });
  return Object.entries(stats)
    .map(([mood, count]) => {
      const isDefault = mood in moodConfig && mood !== "custom";
      const cfg = isDefault
        ? moodConfig[mood as JournalMood]
        : moodConfig["custom"];
      return {
        mood,
        label: isDefault ? cfg.label : mood,
        emoji: isDefault ? cfg.emoji : "✨",
        color: cfg.hex,
        count: count || 0,
      };
    })
    .sort((a, b) => b.count - a.count);
}

export function getActivityHeatmap(): HeatmapDay[] {
  const entries = journalSignal.value;
  const days = [...Array(31)].map((_, i): HeatmapDay => {
    const d = new Date();
    d.setDate(d.getDate() - (30 - i));
    const dateStr = d.toDateString();
    const count = entries
      .filter((entry: JournalEntry) =>
        new Date(entry.createdAt).toDateString() === dateStr
      )
      .reduce((sum: number, entry: JournalEntry) => sum + entry.wordCount, 0);
    return { date: d, count };
  });
  return days;
}

export function getMilestoneUnlocked(): number | null {
  const metadata = streakMetadataSignal.value;
  const streak = metadata.currentStreak;
  const unlocked = metadata.milestonesUnlocked;

  const milestones = [7, 30, 100, 365, 1000];
  for (const milestone of milestones) {
    if (streak === milestone && unlocked.includes(milestone)) {
      return milestone;
    }
  }

  return null;
}

export function getTodayWordCount(): number {
  const today = new Date().toDateString();
  return journalSignal.value
    .filter((e: JournalEntry) => new Date(e.createdAt).toDateString() === today)
    .reduce((sum: number, e: JournalEntry) => sum + e.wordCount, 0);
}

export function getJournalTitle(entry: JournalEntry): string {
  if (entry.body.startsWith("#")) {
    return entry.body.split("\n")[0].replace("#", "").trim();
  }
  const firstLine = entry.body.split("\n")[0].trim();
  return firstLine.length > 40 ? firstLine.slice(0, 40) + "..." : firstLine;
}

export function resetJournalEntries() {
  journalSignal.value = [];
}

// ============ PHASE 2: VAULT & SECURITY ============

function hashPassword(password: string): string {
  // Simple djb2 hash - for local encryption only, not production-grade
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) + hash) + password.charCodeAt(i);
    hash = hash & 0xffffffff;
  }
  return Math.abs(hash).toString(16);
}

export function createVaultEntry(
  entry: JournalEntry,
  password: string,
): JournalEntry {
  const updated = { ...entry };
  updated.vault = {
    isVaulted: true,
    passwordHash: hashPassword(password),
    createdAt: Date.now(),
  };
  updated.isPublic = false;
  updateJournalEntry(entry.id, updated);
  return updated;
}

export function verifyVaultPassword(
  entry: JournalEntry,
  password: string,
): boolean {
  if (!entry.vault || !entry.vault.passwordHash) return false;
  return entry.vault.passwordHash === hashPassword(password);
}

export function unlockVaultEntry(entry: JournalEntry): JournalEntry {
  return { ...entry };
}

// ============ PHASE 2: CONNECTIONS ============

export function addLinkedArtifact(
  entryId: string,
  artifact: LinkedArtifact,
): void {
  journalSignal.value = journalSignal.value.map((e: JournalEntry) => {
    if (e.id === entryId) {
      const artifacts = e.linkedArtifacts || [];
      if (!artifacts.find((a) => a.id === artifact.id)) {
        return {
          ...e,
          linkedArtifacts: [...artifacts, artifact],
          updatedAt: Date.now(),
        };
      }
    }
    return e;
  });
}

export function removeLinkedArtifact(
  entryId: string,
  artifactId: string,
): void {
  journalSignal.value = journalSignal.value.map((e: JournalEntry) => {
    if (e.id === entryId && e.linkedArtifacts) {
      return {
        ...e,
        linkedArtifacts: e.linkedArtifacts.filter((a) => a.id !== artifactId),
        updatedAt: Date.now(),
      };
    }
    return e;
  });
}

export function getLinkedArtifacts(entryId: string): LinkedArtifact[] {
  const entry = journalSignal.value.find((e) => e.id === entryId);
  return entry?.linkedArtifacts || [];
}

// ============ PHASE 2: SYNTHESIS ============

export function createSynthesisEntry(
  body: string,
  synthesis: SynthesisData,
  isPublic = false,
): JournalEntry {
  const newEntry: JournalEntry = {
    id: crypto.randomUUID(),
    body,
    mood: "reflective",
    tags: ["synthesis"],
    linkedItemIds: [],
    isFavorited: false,
    isPublic,
    type: "synthesis",
    synthesis,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    wordCount: body.trim().split(/\s+/).filter(Boolean).length,
  };

  journalSignal.value = [newEntry, ...journalSignal.value];
  updateStreakOnNewEntry();
  return newEntry;
}

export function getSynthesisEntries(): JournalEntry[] {
  return journalSignal.value.filter((e) => e.type === "synthesis");
}

export function getReflectionEntries(): JournalEntry[] {
  return journalSignal.value.filter((e) => !e.type || e.type === "reflection");
}

// ============ PHASE 2: COMMUNITY MODE ============

export function incrementViewCount(entryId: string): void {
  journalSignal.value = journalSignal.value.map((e: JournalEntry) => {
    if (e.id === entryId) {
      return {
        ...e,
        viewCount: (e.viewCount || 0) + 1,
      };
    }
    return e;
  });
}

export function getPublicEntries(): JournalEntry[] {
  return journalSignal.value.filter((e) =>
    e.isPublic && (!e.vault || !e.vault.isVaulted)
  );
}

export function getTrendingEntries(limit = 10): JournalEntry[] {
  return getPublicEntries()
    .sort((a, b) => {
      const aScore = calculateTrendScore(a);
      const bScore = calculateTrendScore(b);
      return bScore - aScore;
    })
    .slice(0, limit);
}

function calculateTrendScore(entry: JournalEntry): number {
  const viewWeight = (entry.viewCount || 0) * 2;
  const favoriteWeight = entry.isFavorited ? 10 : 0;
  const recencyWeight = Math.max(
    0,
    100 - (Date.now() - entry.createdAt) / 3600000,
  ); // 100 points fresh, decays over hours
  return viewWeight + favoriteWeight + recencyWeight;
}

export function getMoodDistribution(
  entries: JournalEntry[],
): Record<JournalMood, number> {
  const distribution: Record<string, number> = {};

  for (
    const mood of [
      "reflective",
      "grounded",
      "charged",
      "anxious",
      "custom",
    ]
  ) {
    distribution[mood] = 0;
  }

  for (const entry of entries) {
    const mood = entry.mood || "reflective";
    distribution[mood] = (distribution[mood] || 0) + 1;
  }

  return distribution as Record<JournalMood, number>;
}

// ============ PHASE 2: MIRROR INSIGHTS ============

export function getActivityTimeline(
  days = 30,
): Array<{ date: string; entries: number }> {
  const timeline: Map<string, number> = new Map();
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 86400000).toDateString();
    timeline.set(date, 0);
  }

  for (const entry of journalSignal.value) {
    const date = new Date(entry.createdAt).toDateString();
    if (timeline.has(date)) {
      timeline.set(date, (timeline.get(date) || 0) + 1);
    }
  }

  return Array.from(timeline.entries()).map(([date, entries]) => ({
    date,
    entries,
  }));
}

// ─── Offline Sync Callback ───────────────────────────────────────────────
registerIdSwapCallback("journal", (tempId, realId) => {
  journalSignal.value = journalSignal.value.map((e) =>
    e.id === tempId ? { ...e, id: realId } : e
  );
});
