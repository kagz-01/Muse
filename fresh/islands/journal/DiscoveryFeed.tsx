import { useMemo, useState } from "preact/hooks";
import { Eye, Filter, Heart, Sparkles, TrendingUp } from "lucide-preact";
import { journalSignal } from "../../signals/journal.ts";
import {
  getDiscoveryByMood,
  getDiscoveryByTag,
  getDiscoveryEntries,
  getTrendingDiscovery,
  getUserInterests,
  type RecommendationEntry,
} from "../../components/journal/DiscoveryAlgorithm.ts";
import { CommunityCard } from "./CommunityCard.tsx";

type FilterTab = "for-you" | "trending" | "moods" | "tags";

interface DiscoveryFeedProps {
  maxItems?: number;
}

export function DiscoveryFeed({ maxItems = 20 }: DiscoveryFeedProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("for-you");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const entries = journalSignal.value;
  const userEntries = useMemo(
    () => entries.filter((e) => !e.isPublic), // Mock: assume non-public are user's
    [entries],
  );

  const recommendations = useMemo(() => {
    switch (activeTab) {
      case "for-you":
        return getDiscoveryEntries(entries, userEntries, maxItems);

      case "trending":
        return getTrendingDiscovery(entries, 7, maxItems);

      case "moods":
        if (!selectedMood) {
          const moods = [
            "inspired",
            "reflective",
            "grateful",
            "focused",
            "alive",
          ];
          const all: RecommendationEntry[] = [];
          moods.forEach((mood) => {
            all.push(...getDiscoveryByMood(entries, mood, 3));
          });
          return all.slice(0, maxItems);
        }
        return getDiscoveryByMood(entries, selectedMood, maxItems);

      case "tags":
        if (!selectedTag) {
          const tags = ["growth", "learning", "reflection", "synthesis"];
          const all: RecommendationEntry[] = [];
          tags.forEach((tag) => {
            all.push(...getDiscoveryByTag(entries, tag, 3));
          });
          return all.slice(0, maxItems);
        }
        return getDiscoveryByTag(entries, selectedTag, maxItems);

      default:
        return [];
    }
  }, [activeTab, entries, userEntries, selectedMood, selectedTag, maxItems]);

  const userInterests = useMemo(() => getUserInterests(userEntries), [
    userEntries,
  ]);

  const allMoods = [
    "inspired",
    "reflective",
    "grateful",
    "focused",
    "alive",
    "charged",
  ];
  const topTags = userInterests.commonTags.slice(0, 8);

  return (
    <div class="space-y-8">
      {/* Hero Section */}
      <div
        class="relative rounded-3xl overflow-hidden"
        style={{
          background: "var(--muse-surface)",
          border: "1px solid var(--muse-border)",
          boxShadow: "0 10px 30px rgba(var(--muse-accent-rgb),0.04)",
        }}
      >
        <div class="relative p-8 md:p-12">
          <div class="flex items-start justify-between mb-6">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                  <Sparkles size={20} class="text-white" />
                </div>
                <span class="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                  Discovery Feed
                </span>
              </div>
              <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
                Explore & Connect
              </h1>
              <p class="text-white/70 text-lg italic max-w-2xl">
                Discover insights from your community. Personalized to your
                interests, curated for your growth.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div
            class="grid grid-cols-3 md:grid-cols-3 gap-4 pt-6 border-t"
            style={{ borderColor: "var(--muse-border)" }}
          >
            <div>
              <p class="text-white/60 text-sm mb-1">Recommendations</p>
              <p class="text-2xl font-bold text-cyan-400">
                {recommendations.length}
              </p>
            </div>
            <div>
              <p class="text-white/60 text-sm mb-1">Your Interests</p>
              <p class="text-2xl font-bold text-purple-400">
                {userInterests.favoredMoods.length}
              </p>
            </div>
            <div>
              <p class="text-white/60 text-sm mb-1">Community</p>
              <p class="text-2xl font-bold text-emerald-400">
                {entries.filter((e) => e.isPublic).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div class="space-y-4">
        <div class="flex items-center gap-2 mb-4">
          <Filter size={18} class="text-canvas-primary" />
          <span class="text-sm font-semibold text-white">Filters</span>
        </div>

        {/* Tab Buttons */}
        <div class="flex flex-wrap gap-2">
          {(["for-you", "trending", "moods", "tags"] as FilterTab[]).map((
            tab,
          ) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedMood(null);
                setSelectedTag(null);
              }}
              class={`px-4 py-2 rounded-full font-semibold transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/20"
              }`}
            >
              {tab === "for-you" && "For You"}
              {tab === "trending" && "Trending"}
              {tab === "moods" && "By Mood"}
              {tab === "tags" && "By Tag"}
            </button>
          ))}
        </div>

        {/* Mood Filter */}
        {activeTab === "moods" && (
          <div class="space-y-2">
            <p class="text-xs text-white/60 uppercase tracking-wider font-semibold">
              Select Mood
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedMood(null)}
                class={`px-3 py-1 rounded-full text-sm transition-all ${
                  selectedMood === null
                    ? "bg-canvas-primary/30 text-canvas-primary border border-canvas-primary/50"
                    : "bg-white/5 text-white/60 border border-white/10"
                }`}
              >
                All Moods
              </button>
              {allMoods.map((mood) => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  class={`px-3 py-1 rounded-full text-sm capitalize transition-all ${
                    selectedMood === mood
                      ? "bg-canvas-primary/30 text-canvas-primary border border-canvas-primary/50"
                      : "bg-white/5 text-white/60 border border-white/10"
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tag Filter */}
        {activeTab === "tags" && (
          <div class="space-y-2">
            <p class="text-xs text-white/60 uppercase tracking-wider font-semibold">
              Select Tag
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                class={`px-3 py-1 rounded-full text-sm transition-all ${
                  selectedTag === null
                    ? "bg-canvas-primary/30 text-canvas-primary border border-canvas-primary/50"
                    : "bg-white/5 text-white/60 border border-white/10"
                }`}
              >
                All Tags
              </button>
              {topTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  class={`px-3 py-1 rounded-full text-sm transition-all ${
                    selectedTag === tag
                      ? "bg-canvas-primary/30 text-canvas-primary border border-canvas-primary/50"
                      : "bg-white/5 text-white/60 border border-white/10"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Grid */}
      {recommendations.length > 0
        ? (
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((entry) => (
              <div key={entry.id} class="group relative">
                {/* Recommendation Badge */}
                {entry.reason && (
                  <div class="absolute -top-3 left-4 z-10 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs font-semibold flex items-center gap-1 shadow-lg">
                    <TrendingUp size={12} />
                    {entry.reason}
                  </div>
                )}

                {/* Score Badge */}
                {entry.recommendationScore && (
                  <div class="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-black/50 backdrop-blur text-white text-xs font-bold">
                    {Math.round(entry.recommendationScore)}%
                  </div>
                )}

                <CommunityCard entry={entry} />
              </div>
            ))}
          </div>
        )
        : (
          <div class="text-center py-16">
            <div class="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={32} class="text-white/30" />
            </div>
            <p class="text-white/70 text-lg">No recommendations yet</p>
            <p class="text-white/50 text-sm">
              Check back soon as you explore more content
            </p>
          </div>
        )}

      {/* Info Panel */}
      <div class="grid md:grid-cols-2 gap-4 pt-8 border-t border-white/10">
        <div class="bg-white/5 border border-white/10 rounded-xl p-6">
          <p class="text-xs text-white/60 uppercase tracking-wider font-semibold mb-2">
            Your Preferences
          </p>
          <div class="space-y-2">
            <p class="text-sm text-white/80">
              <span class="text-canvas-primary font-semibold">Moods:</span>{" "}
              {userInterests.favoredMoods.slice(0, 3).join(", ") ||
                "Not determined"}
            </p>
            <p class="text-sm text-white/80">
              <span class="text-canvas-primary font-semibold">Tags:</span>{" "}
              {userInterests.commonTags.slice(0, 3).join(", ") ||
                "Not determined"}
            </p>
            <p class="text-sm text-white/80">
              <span class="text-canvas-primary font-semibold">
                Exploration Level:
              </span>{" "}
              {Math.round(userInterests.exploreNess * 100)}%
            </p>
          </div>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-6">
          <p class="text-xs text-white/60 uppercase tracking-wider font-semibold mb-2">
            Discovery Stats
          </p>
          <div class="space-y-2">
            <p class="text-sm text-white/80 flex items-center gap-2">
              <Eye size={16} class="text-emerald-400" />
              <span>
                {entries.filter((e) => e.isPublic).length} public entries
              </span>
            </p>
            <p class="text-sm text-white/80 flex items-center gap-2">
              <Heart size={16} class="text-rose-400" />
              <span>
                {entries.filter((e) => e.isFavorited && e.isPublic).length}{" "}
                favorited
              </span>
            </p>
            <p class="text-sm text-white/80 flex items-center gap-2">
              <TrendingUp size={16} class="text-cyan-400" />
              <span>
                {Math.round(userInterests.averageSynthesisRate * 100)}%
                synthesis rate
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
