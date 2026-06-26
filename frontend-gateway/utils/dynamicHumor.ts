/**
 * Dynamic Humor Generation System
 * 
 * Generates contextual, personalized humor based on:
 * - User engagement (streak, resonance score, activity level)
 * - Time of day (morning/afternoon/evening)
 * - Platform context (journaling, wisdom synthesis, community)
 * 
 * This system is designed to keep greetings fresh, relevant, and encouraging
 * while reflecting the user's connection to the Muse platform.
 */

export type GreetingPeriod = "morning" | "afternoon" | "evening";

export interface UserContext {
  currentStreak: number;
  resonanceScore: number;
  journalEntryCount: number;
  roomsJoined: number;
  threadsActive: number;
  hasUsername: boolean;
}

/**
 * Generate a humor message based on user engagement metrics and time period.
 * Falls back to period-based defaults if user context is unavailable.
 */
export function generateDynamicHumor(
  period: GreetingPeriod,
  userContext?: Partial<UserContext>,
): string {
  if (!userContext) {
    return getDefaultHumor(period);
  }

  const streak = userContext.currentStreak ?? 0;
  const resonance = userContext.resonanceScore ?? 0;
  const entries = userContext.journalEntryCount ?? 0;
  const rooms = userContext.roomsJoined ?? 0;
  const threads = userContext.threadsActive ?? 0;
  const hasUsername = userContext.hasUsername ?? false;

  // High engagement (all metrics strong)
  if (streak >= 7 && resonance > 500 && entries >= 10) {
    return getHighEngagementHumor(period);
  }

  // Building momentum (streak active, growing engagement)
  if (streak >= 3 && resonance > 200) {
    return getBuildingMomentumHumor(period, streak);
  }

  // Community active (interacting with rooms/threads)
  if (rooms >= 3 || threads >= 5) {
    return getCommunityActiveHumor(period);
  }

  // Early stages (low entry count, building habits)
  if (entries < 5) {
    return getEarlyStagesHumor(period);
  }

  // Returning user (has activity but streak might have reset)
  if (entries >= 5 && streak === 0) {
    return getReturningUserHumor(period);
  }

  return getDefaultHumor(period);
}

function getHighEngagementHumor(period: GreetingPeriod): string {
  const messages = {
    morning: [
      "The synthesis engine is firing on all cylinders. Let's keep the momentum.",
      "You're building something here. The patterns are getting clearer.",
      "High resonance detected. Your wisdom is connecting deeply.",
    ],
    afternoon: [
      "You've built a streak for a reason. Keep the signal strong.",
      "The threads you've woven are creating real resonance. What's next?",
      "Your engagement is teaching the system. It's learning from your depth.",
    ],
    evening: [
      "A day of quality synthesis. Rest knowing your contributions matter.",
      "The resonance you've built is no accident. You've earned this platform's trust.",
      "Your patterns are becoming part of the collective wisdom.",
    ],
  };

  const lines = messages[period];
  return lines[Math.floor(Math.random() * lines.length)];
}

function getBuildingMomentumHumor(
  period: GreetingPeriod,
  streak: number,
): string {
  const streakText =
    streak === 3
      ? "three days straight"
      : streak === 5
      ? "five days strong"
      : streak === 7
      ? "a week of consistency"
      : `${streak} days running`;

  const messages = {
    morning: [
      `You've got ${streakText}. The momentum is real. Don't break it.`,
      `${streakText}—your habits are becoming your identity. Keep going.`,
      `Day ${streak} of building something. The foundation is solid.`,
    ],
    afternoon: [
      `Still going strong. ${streakText} means something. Prove it matters.`,
      `The streak is alive. Feed it with something real today.`,
      `${streakText}. You're past the "maybe I'll do this" phase.`,
    ],
    evening: [
      `${streakText}. Your consistency is becoming part of you.`,
      `The habit is setting in. One more good day before sleep?`,
      `${streakText}—not luck, discipline. Tomorrow starts here.`,
    ],
  };

  const lines = messages[period];
  return lines[Math.floor(Math.random() * lines.length)];
}

function getCommunityActiveHumor(period: GreetingPeriod): string {
  const messages = {
    morning: [
      "You're woven into the community's fabric now. What new threads will you create?",
      "The wisdom network is waiting. Your perspective matters in these rooms.",
      "Early hour, active mind. The community thrives on your voice.",
    ],
    afternoon: [
      "Your threads are connecting others' wisdom. Keep building those bridges.",
      "The rooms you've joined are warmer because you're there. Show up for them.",
      "Collaboration is the signal. Noise is just people talking alone.",
    ],
    evening: [
      "The collective wisdom grows as you contribute. Rest in that knowledge.",
      "You're not synthesizing alone anymore. That changes everything.",
      "The threads you've woven today will support tomorrow's insights.",
    ],
  };

  const lines = messages[period];
  return lines[Math.floor(Math.random() * lines.length)];
}

function getEarlyStagesHumor(period: GreetingPeriod): string {
  const messages = {
    morning: [
      "Starting fresh. The first entries are always the most honest.",
      "New habits need consistency. This is where it begins.",
      "The blank page is your sandbox. What will you build?",
    ],
    afternoon: [
      "You're early in the synthesis. Every entry trains your thinking.",
      "Small entries compound into deep patterns. Start now.",
      "The platform learns as you do. Each thought matters.",
    ],
    evening: [
      "Building a habit takes time. You're on day one of something real.",
      "The quiet reflections early on become your foundation.",
      "Every stream starts small. Yours is starting here.",
    ],
  };

  const lines = messages[period];
  return lines[Math.floor(Math.random() * lines.length)];
}

function getReturningUserHumor(period: GreetingPeriod): string {
  const messages = {
    morning: [
      "Welcome back. The momentum resets, but your wisdom doesn't. Let's rebuild.",
      "You've been here before. You know what this platform can do.",
      "Returning means you found something worth coming back for.",
    ],
    afternoon: [
      "The system remembers you. Time to remind it why you matter.",
      "Consistency breaks, but growth doesn't. Pick it up again.",
      "You know the path. The question is: are you ready to walk it again?",
    ],
    evening: [
      "Streaks end, but the practice remains. Start a new one.",
      "Welcome home. Let's get back to building.",
      "The platform keeps evolving. So do you. Pick up where you left off.",
    ],
  };

  const lines = messages[period];
  return lines[Math.floor(Math.random() * lines.length)];
}

function getDefaultHumor(period: GreetingPeriod): string {
  const messages = {
    morning: [
      "A fresh canvas awaits your thoughts.",
      "The dawn carries new patterns. What will you synthesize?",
      "Begin with intention. End with clarity.",
    ],
    afternoon: [
      "You're in the flow. Keep the synthesis going.",
      "Momentum builds. Your threads are weaving something.",
      "The afternoon is yours. What deserves your attention?",
    ],
    evening: [
      "Reflect on the patterns that emerged today.",
      "The quiet hours are for deep contemplation.",
      "Let the day's noise settle. What remains is signal.",
    ],
  };

  const lines = messages[period];
  return lines[Math.floor(Math.random() * lines.length)];
}

/**
 * AI System Prompt for Future Enhancement
 * 
 * Use this prompt if integrating with an LLM API for even more dynamic humor:
 * 
 * "You are Muse's personality engine. Generate a single, witty greeting prompt (1-2 sentences max)
 * that is:
 * - Encouraging but not saccharine (keep it real)
 * - Specific to the user's engagement level and time of day
 * - Relevant to journaling, wisdom synthesis, and community connection
 * - Uses platform terminology (synthesis, resonance, threads, wisdom, signal)
 * - Tone: thoughtful mentor who gets the user's journey, slightly philosophical, occasionally humorous
 * 
 * User context:
 * - Streak: {streak} days
 * - Resonance score: {resonanceScore} (0-1000 scale)
 * - Journal entries: {entries}
 * - Active rooms: {rooms}
 * - Time of day: {period}
 * 
 * Avoid:
 * - Generic motivational speaker phrases
 * - Emojis or exclamation marks
 * - References to other platforms
 * - Anything that breaks the Muse aesthetic
 * "
 */
