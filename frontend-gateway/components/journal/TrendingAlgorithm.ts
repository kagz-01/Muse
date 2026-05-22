import { JournalEntry } from "../../signals/journal.ts";

export interface TrendMetrics {
  viewScore: number;
  engagementScore: number;
  recencyScore: number;
  totalScore: number;
  rank: number;
}

export function calculateTrendScore(entry: JournalEntry): number {
  const now = Date.now();
  const ageMs = now - entry.createdAt;
  const ageHours = ageMs / 3600000;

  // View score: 0-30 points
  const viewScore = Math.min(30, (entry.viewCount || 0) * 2);

  // Engagement score: 0-40 points
  const engagementScore = (entry.isFavorited ? 20 : 0) + (entry.tags.length * 5);

  // Recency score: 100 points fresh, decays over 72 hours
  const recencyScore = Math.max(0, 100 * Math.exp(-ageHours / 24));

  // Synthesis bonus: +30 points
  const synthesisBonus = entry.type === "synthesis" ? 30 : 0;

  return viewScore + engagementScore + recencyScore + synthesisBonus;
}

export function getTrendingEntries(
  entries: JournalEntry[],
  limit = 10
): Array<JournalEntry & { trendScore: number }> {
  return entries
    .filter((e) => e.isPublic && (!e.vault || !e.vault.isVaulted))
    .map((entry) => ({
      ...entry,
      trendScore: calculateTrendScore(entry),
    }))
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, limit);
}

export function getHotEntries(entries: JournalEntry[]): JournalEntry[] {
  // Hot: High views + recent
  return entries
    .filter((e) => e.isPublic && !e.vault?.isVaulted && (e.viewCount || 0) > 5)
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5);
}

export function getFreshEntries(entries: JournalEntry[]): JournalEntry[] {
  // Fresh: Created in last 24 hours
  const dayAgo = Date.now() - 86400000;
  return entries
    .filter((e) => e.isPublic && !e.vault?.isVaulted && e.createdAt > dayAgo)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);
}

export function getUpcomingEntries(entries: JournalEntry[]): JournalEntry[] {
  // Upcoming: Rising trend (views increasing over time)
  // Simplified: Recent + some views
  const weekAgo = Date.now() - 604800000;
  return entries
    .filter(
      (e) => e.isPublic && !e.vault?.isVaulted && e.createdAt > weekAgo && (e.viewCount || 0) > 0
    )
    .sort((a, b) => calculateTrendScore(b) - calculateTrendScore(a))
    .slice(0, 5);
}

export function getMoodTrends(
  entries: JournalEntry[]
): Array<{ mood: string; count: number; trendScore: number }> {
  const moodMap = new Map<
    string,
    { count: number; totalScore: number }
  >();

  for (const entry of entries) {
    if (!entry.isPublic || entry.vault?.isVaulted) continue;

    const mood = entry.customMood || entry.mood;
    const current = moodMap.get(mood) || { count: 0, totalScore: 0 };
    moodMap.set(mood, {
      count: current.count + 1,
      totalScore: current.totalScore + calculateTrendScore(entry),
    });
  }

  return Array.from(moodMap.entries())
    .map(([mood, { count, totalScore }]) => ({
      mood,
      count,
      trendScore: totalScore / count,
    }))
    .sort((a, b) => b.trendScore - a.trendScore);
}

export function getTagTrends(
  entries: JournalEntry[]
): Array<{ tag: string; count: number; trendScore: number }> {
  const tagMap = new Map<string, { count: number; totalScore: number }>();

  for (const entry of entries) {
    if (!entry.isPublic || entry.vault?.isVaulted) continue;

    for (const tag of entry.tags) {
      const current = tagMap.get(tag) || { count: 0, totalScore: 0 };
      tagMap.set(tag, {
        count: current.count + 1,
        totalScore: current.totalScore + calculateTrendScore(entry),
      });
    }
  }

  return Array.from(tagMap.entries())
    .map(([tag, { count, totalScore }]) => ({
      tag,
      count,
      trendScore: totalScore / count,
    }))
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 10);
}

export function getAuthorTrends(
  entries: JournalEntry[]
): Array<{
  authorId: string;
  entryCount: number;
  avgTrendScore: number;
  totalViews: number;
}> {
  // Simplified: Group by partial ID (in real app, would have userId)
  const authorMap = new Map<
    string,
    { count: number; totalScore: number; totalViews: number }
  >();

  for (const entry of entries) {
    if (!entry.isPublic || entry.vault?.isVaulted) continue;

    const authorId = entry.id.slice(0, 4);
    const current = authorMap.get(authorId) || {
      count: 0,
      totalScore: 0,
      totalViews: 0,
    };
    authorMap.set(authorId, {
      count: current.count + 1,
      totalScore: current.totalScore + calculateTrendScore(entry),
      totalViews: current.totalViews + (entry.viewCount || 0),
    });
  }

  return Array.from(authorMap.entries())
    .map(([authorId, { count, totalScore, totalViews }]) => ({
      authorId,
      entryCount: count,
      avgTrendScore: totalScore / count,
      totalViews,
    }))
    .sort((a, b) => b.avgTrendScore - a.avgTrendScore)
    .slice(0, 10);
}

export function getSearchResults(
  entries: JournalEntry[],
  query: string,
  limit = 20
): JournalEntry[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  return entries
    .filter((e) => {
      if (!e.isPublic || e.vault?.isVaulted) return false;
      return (
        e.body.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)) ||
        e.mood.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => calculateTrendScore(b) - calculateTrendScore(a))
    .slice(0, limit);
}
