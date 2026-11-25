import { assertEquals } from "https://deno.land/std@0.216.0/assert/mod.ts";
import {
  buildSparkSummary,
  computeResonanceWeight,
  deriveNextStreakState,
  isContributionStreakable,
  normalizeEnabledStreakTypes,
} from "../utils/streakEngine.ts";

Deno.test("computeResonanceWeight rewards deeper contributions", () => {
  assertEquals(computeResonanceWeight("journal"), 1);
  assertEquals(computeResonanceWeight("synthesis"), 2);
  assertEquals(computeResonanceWeight("entanglement"), 2.5);
});

Deno.test("buildSparkSummary generates a concise human-readable summary", () => {
  assertEquals(
    buildSparkSummary("journal", "Wrote about attention", "journal"),
    "Reflection spark: Wrote about attention",
  );
  assertEquals(
    buildSparkSummary("synthesis", "Connected memory and ritual", "network"),
    "Synthesis spark: Connected memory and ritual",
  );
});

Deno.test("deriveNextStreakState increments on a fresh resonance day", () => {
  const next = deriveNextStreakState({
    currentStreak: 4,
    longestStreak: 7,
    totalJournalDays: 10,
    lastEntryDate: "Mon Jun 24 2026",
    today: "Tue Jun 25 2026",
    alreadyCountedToday: false,
  });

  assertEquals(next.currentStreak, 5);
  assertEquals(next.longestStreak, 7);
  assertEquals(next.totalJournalDays, 11);
});

Deno.test("isContributionStreakable respects the curated streak list", () => {
  assertEquals(isContributionStreakable("artifact", ["artifact", "room", "synthesis"]), true);
  assertEquals(isContributionStreakable("journal", ["artifact", "room", "synthesis"]), false);
  assertEquals(isContributionStreakable("thread", []), false);
});

Deno.test("normalizeEnabledStreakTypes cleans and defaults curated types", () => {
  assertEquals(normalizeEnabledStreakTypes(["Artifact", "room", "room", "thread"]), ["artifact", "room", "thread"]);
  assertEquals(normalizeEnabledStreakTypes("Artifact, room , synthesis"), ["artifact", "room", "synthesis"]);
  assertEquals(normalizeEnabledStreakTypes(undefined), ["artifact", "room", "thread", "synthesis", "idea"]);
});
