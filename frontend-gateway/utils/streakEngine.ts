export type StreakContributionType =
  | "journal"
  | "artifact"
  | "synthesis"
  | "entanglement"
  | "recovery"
  | "network"
  | "room"
  | "thread"
  | "idea"
  | string;

export interface StreakStateInput {
  currentStreak: number;
  longestStreak: number;
  totalJournalDays: number;
  lastEntryDate: string;
  today: string;
  alreadyCountedToday?: boolean;
}

export interface NextStreakState {
  currentStreak: number;
  longestStreak: number;
  totalJournalDays: number;
  lastEntryDate: string;
  streakLevel: string;
  shouldCount: boolean;
}

const MILESTONES = [7, 30, 100, 365, 1000];

export function computeResonanceWeight(contributionType: StreakContributionType): number {
  switch (contributionType) {
    case "journal":
      return 1;
    case "artifact":
      return 1.5;
    case "synthesis":
      return 2;
    case "entanglement":
      return 2.5;
    case "recovery":
      return 1;
    case "network":
      return 1.5;
    case "room":
      return 1.5;
    case "thread":
      return 1.3;
    case "idea":
      return 1.2;
    default:
      return 1;
  }
}

export function buildSparkSummary(
  contributionType: StreakContributionType,
  content: string,
  destination: string,
): string {
  const cleaned = content.trim();
  if (!cleaned) {
    return `${getSparkLabel(contributionType)} spark started`;
  }

  const label = getSparkLabel(contributionType);
  const suffix = destination === "partner" || destination.startsWith("partner:") || destination === "thread" || destination.startsWith("thread:")
    ? ` via ${destination}`
    : "";
  return `${label} spark: ${cleaned}${suffix}`;
}

function getSparkLabel(contributionType: StreakContributionType): string {
  switch (contributionType) {
    case "journal":
      return "Reflection";
    case "artifact":
      return "Artifact";
    case "synthesis":
      return "Synthesis";
    case "entanglement":
      return "Entanglement";
    case "recovery":
      return "Recovery";
    case "network":
      return "Network";
    case "room":
      return "Room";
    case "thread":
      return "Thread";
    case "idea":
      return "Idea";
    default:
      return "Resonance";
  }
}

export function deriveNextStreakState(input: StreakStateInput): NextStreakState {
  const { currentStreak, longestStreak, totalJournalDays, lastEntryDate, today } = input;
  const alreadyCountedToday = input.alreadyCountedToday ?? false;
  const normalizedLastEntryDate = normalizeDateString(lastEntryDate);
  const normalizedToday = normalizeDateString(today);

  if (alreadyCountedToday) {
    return {
      currentStreak,
      longestStreak,
      totalJournalDays,
      lastEntryDate: normalizedToday,
      streakLevel: getStreakLevelForCount(currentStreak),
      shouldCount: false,
    };
  }

  if (normalizedLastEntryDate === normalizedToday) {
    return {
      currentStreak,
      longestStreak,
      totalJournalDays,
      lastEntryDate: normalizedToday,
      streakLevel: getStreakLevelForCount(currentStreak),
      shouldCount: false,
    };
  }

  const yesterday = getYesterdayDate(normalizedToday);
  let nextCurrentStreak = currentStreak;

  if (normalizedLastEntryDate === yesterday || currentStreak === 0) {
    nextCurrentStreak = currentStreak + 1;
  } else {
    nextCurrentStreak = 1;
  }

  const nextLongestStreak = Math.max(nextCurrentStreak, longestStreak);
  const nextTotalJournalDays = totalJournalDays + 1;

  return {
    currentStreak: nextCurrentStreak,
    longestStreak: nextLongestStreak,
    totalJournalDays: nextTotalJournalDays,
    lastEntryDate: normalizedToday,
    streakLevel: getStreakLevelForCount(nextCurrentStreak),
    shouldCount: true,
  };
}

function normalizeDateString(value: string): string {
  const date = coerceDate(value);
  return date.toDateString();
}

function getYesterdayDate(today: string): string {
  const date = coerceDate(today);
  if (Number.isNaN(date.getTime())) {
    return today;
  }
  date.setDate(date.getDate() - 1);
  return date.toDateString();
}

function coerceDate(value: string): Date {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T00:00:00Z`);
  }

  const friendlyMatch = value.match(/^([A-Za-z]{3})\s+([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})/);
  if (friendlyMatch) {
    const [, , monthName, day, year] = friendlyMatch;
    const monthIndex = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(monthName);
    if (monthIndex >= 0) {
      return new Date(Date.UTC(Number(year), monthIndex, Number(day)));
    }
  }

  return new Date(value);
}

export function getStreakLevelForCount(count: number): string {
  if (count >= 365) return "Phoenix";
  if (count >= 100) return "Inferno";
  if (count >= 30) return "Flame";
  return "Spark";
}

export function getUnlockedMilestones(currentStreak: number, alreadyUnlocked: number[]): number[] {
  const newUnlocked = [...alreadyUnlocked];
  for (const milestone of MILESTONES) {
    if (currentStreak >= milestone && !newUnlocked.includes(milestone)) {
      newUnlocked.push(milestone);
    }
  }
  return newUnlocked;
}
