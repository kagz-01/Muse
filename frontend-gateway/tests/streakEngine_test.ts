import { assertEquals } from "https://deno.land/std@0.216.0/assert/mod.ts";
import {
  buildSparkSummary,
  computeResonanceWeight,
  deriveNextStreakState,
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
