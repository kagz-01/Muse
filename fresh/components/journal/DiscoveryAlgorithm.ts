import { JournalEntry } from "../../signals/journal.ts";

export interface RecommendationEntry extends JournalEntry {
  recommendationScore?: number;
  reason?: string;
  similarityTags?: string[];
}

export interface UserInterests {
  favoredMoods: string[];
  commonTags: string[];
  averageSynthesisRate: number;
  exploreNess: number; // 0-1 score for exploration preference
}

export interface DiscoveryMetrics {
  relevance: number; // 0-100, how relevant to user interests
  novelty: number; // 0-100, how different from user's typical content
  engagement: number; // 0-100, based on community engagement
  freshness: number; // 0-100, based on recency
}

export function getUserInterests(userEntries: JournalEntry[]): UserInterests {
  if (userEntries.length === 0) {
    return {
      favoredMoods: [],
      commonTags: [],
      averageSynthesisRate: 0.1,
      exploreNess: 0.5,
    };
  }

  // Calculate favored moods
  const moodCount = new Map<string, number>();
  userEntries.forEach((e) => {
    moodCount.set(e.mood, (moodCount.get(e.mood) || 0) + 1);
  });
  const favoredMoods = Array.from(moodCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([mood]) => mood);

  // Calculate common tags
  const tagCount = new Map<string, number>();
  userEntries.forEach((e) => {
    e.tags?.forEach((tag) => {
      tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
    });
  });
  const commonTags = Array.from(tagCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  // Calculate synthesis rate
  const synthesisCount = userEntries.filter((e) => !!e.synthesis).length;
  const averageSynthesisRate = synthesisCount / userEntries.length;

  // Calculate exploreNess (higher if user engages with diverse content)
  const uniqueMoods = new Set(userEntries.map((e) => e.mood)).size;
  const uniqueTags = new Set(userEntries.flatMap((e) => e.tags || [])).size;
  const exploreNess = Math.min(
    1,
    (uniqueMoods / 12) * 0.5 + (uniqueTags / 50) * 0.5,
  );

  return {
    favoredMoods,
    commonTags,
    averageSynthesisRate,
    exploreNess,
  };
}

export function calculateDiscoveryMetrics(
  entry: JournalEntry,
  userInterests: UserInterests,
): DiscoveryMetrics {
  // Relevance: match with user's moods and tags
  const moodRelevance = userInterests.favoredMoods.includes(entry.mood)
    ? 30
    : 0;
  const tagRelevance = entry.tags
    ?.filter((tag) => userInterests.commonTags.includes(tag))
    .length || 0;
  const relevance = Math.min(
    100,
    moodRelevance + Math.min(tagRelevance * 10, 70),
  );

  // Novelty: opposite moods/tags are more novel
  const novelMood = userInterests.favoredMoods.includes(entry.mood) ? 20 : 60;
  const novelTags = (entry.tags?.length || 0) > 3 ? 30 : 10;
  const novelty = Math.min(100, novelMood + novelTags);

  // Engagement: views + favorites (mock data for now)
  const views = entry.viewCount || 0;
  const engagement = Math.min(100, views / 10);

  // Freshness: recency exponential decay (half-life = 7 days)
  const ageMs = Date.now() - entry.createdAt;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const freshness = Math.max(0, 100 * Math.pow(0.5, ageDays / 7));

  return { relevance, novelty, engagement, freshness };
}

export function getDiscoveryScore(
  entry: JournalEntry,
  userInterests: UserInterests,
  weights = {
    relevance: 0.35,
    novelty: 0.25,
    engagement: 0.2,
    freshness: 0.2,
  },
): number {
  const metrics = calculateDiscoveryMetrics(entry, userInterests);
  return (
    metrics.relevance * weights.relevance +
    metrics.novelty * weights.novelty +
    metrics.engagement * weights.engagement +
    metrics.freshness * weights.freshness
  );
}

export function getDiscoveryEntries(
  allEntries: JournalEntry[],
  userEntries: JournalEntry[],
  limit = 20,
): RecommendationEntry[] {
  const userInterests = getUserInterests(userEntries);

  // Filter: public, non-vaulted, not from user
  const publicEntries = allEntries.filter(
    (e) => e.isPublic && !e.vault && !userEntries.some((ue) => ue.id === e.id),
  );

  // Score and sort
  const scored = publicEntries.map((e) => {
    const score = getDiscoveryScore(e, userInterests);
    return {
      ...e,
      recommendationScore: score,
    };
  });

  return scored
    .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0))
    .slice(0, limit);
}

export function getDiscoveryByMood(
  allEntries: JournalEntry[],
  targetMood: string,
  limit = 10,
): RecommendationEntry[] {
  const publicEntries = allEntries.filter((e) =>
    e.isPublic && !e.vault && e.mood === targetMood
  );

  return publicEntries
    .sort((a, b) => {
      // Sort by views (as proxy for quality)
      const aViews = a.viewCount || 0;
      const bViews = b.viewCount || 0;
      if (aViews !== bViews) return bViews - aViews;
      // Then by recency
      return b.createdAt - a.createdAt;
    })
    .slice(0, limit)
    .map((e) => ({
      ...e,
      reason: `Popular in ${targetMood} mood`,
    }));
}

export function getDiscoveryByTag(
  allEntries: JournalEntry[],
  targetTag: string,
  limit = 10,
): RecommendationEntry[] {
  const publicEntries = allEntries.filter(
    (e) => e.isPublic && !e.vault && e.tags?.includes(targetTag),
  );

  return publicEntries
    .sort((a, b) => {
      const aViews = a.viewCount || 0;
      const bViews = b.viewCount || 0;
      if (aViews !== bViews) return bViews - aViews;
      return b.createdAt - a.createdAt;
    })
    .slice(0, limit)
    .map((e) => ({
      ...e,
      reason: `Active in #${targetTag}`,
    }));
}

export function getTrendingDiscovery(
  allEntries: JournalEntry[],
  timeWindowDays = 7,
  limit = 15,
): RecommendationEntry[] {
  const cutoffTime = Date.now() - timeWindowDays * 24 * 60 * 60 * 1000;

  const recentPublic = allEntries.filter(
    (e) => e.isPublic && !e.vault && e.createdAt > cutoffTime,
  );

  return recentPublic
    .sort((a, b) => {
      const aScore = (a.viewCount || 0) * 2 + (a.isFavorited ? 50 : 0);
      const bScore = (b.viewCount || 0) * 2 + (b.isFavorited ? 50 : 0);
      return bScore - aScore;
    })
    .slice(0, limit)
    .map((e) => ({
      ...e,
      reason: `Trending this week`,
      recommendationScore: (e.viewCount || 0) + (e.isFavorited ? 50 : 0),
    }));
}

export function getSimilarEntries(
  targetEntry: JournalEntry,
  allEntries: JournalEntry[],
  limit = 5,
): RecommendationEntry[] {
  const targetTags = new Set(targetEntry.tags || []);
  const targetMood = targetEntry.mood;

  const candidates = allEntries.filter(
    (e) =>
      e.isPublic &&
      !e.vault &&
      e.id !== targetEntry.id &&
      (e.mood === targetMood ||
        (e.tags || []).some((tag) => targetTags.has(tag))),
  );

  return candidates
    .map((e) => {
      const tagMatches = e.tags?.filter((tag) => targetTags.has(tag)).length ||
        0;
      const moodMatch = e.mood === targetMood ? 30 : 0;
      const score = moodMatch + tagMatches * 15;
      return {
        ...e,
        recommendationScore: score,
        reason: `Similar to "${targetEntry.body.substring(0, 30)}..."`,
        similarityTags: e.tags?.filter((tag) => targetTags.has(tag)),
      };
    })
    .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0))
    .slice(0, limit);
}
