import { PageProps } from "$fresh/server.ts";
import { CommunityFeed } from "../../islands/journal/CommunityCard.tsx";
import { getPublicEntries } from "../../signals/journal.ts";
import { getTrendingEntries } from "../../components/journal/TrendingAlgorithm.ts";
import { Flame, Sparkles, TrendingUp, Zap } from "lucide-preact";

export default function CommunityPage(props: PageProps) {
  const entries = getPublicEntries();
  const trendingEntries = getTrendingEntries(entries, 12);

  return (
    <div class="min-h-screen bg-gradient-to-b from-white/5 via-transparent to-white/5">
      {/* Hero Section */}
      <div class="relative px-6 md:px-10 py-16 md:py-24">
        {/* Background */}
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-canvas-primary/20 via-transparent to-purple-500/20" />
          <div class="absolute top-20 right-0 w-96 h-96 rounded-full bg-canvas-primary/10 blur-3xl opacity-40" />
          <div class="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl opacity-40" />
        </div>

        {/* Dot Pattern Overlay */}
        <div class="absolute inset-0 opacity-20">
          <div
            class="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Content */}
        <div class="relative z-10 max-w-6xl mx-auto">
          {/* Badge */}
          <div class="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
            <Sparkles size={16} class="text-canvas-primary" />
            <span class="text-sm font-medium text-canvas-primary">
              Community Feed
            </span>
          </div>

          {/* Title */}
          <h1 class="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Discover Insights
          </h1>
          <p class="text-lg text-white/60 max-w-2xl leading-relaxed italic font-serif">
            Explore trending reflections, emerging patterns, and shared wisdom
            from the Muse community
          </p>

          {/* Stats Grid */}
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div class="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p class="text-sm text-white/60 mb-2">Public Entries</p>
              <p class="text-3xl font-bold text-white">{entries.length}</p>
            </div>
            <div class="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p class="text-sm text-white/60 mb-2">Total Views</p>
              <p class="text-3xl font-bold text-white">
                {entries.reduce((sum, e) => sum + (e.viewCount || 0), 0)}
              </p>
            </div>
            <div class="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p class="text-sm text-white/60 mb-2">This Week</p>
              <p class="text-3xl font-bold text-white">
                {entries.filter((e) => Date.now() - e.createdAt < 604800000)
                  .length}
              </p>
            </div>
            <div class="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p class="text-sm text-white/60 mb-2">Trending</p>
              <p class="text-3xl font-bold text-white">
                {Math.floor(trendingEntries.length * 0.8)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div class="sticky top-[120px] z-40 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-sm border-b border-white/10 px-6 md:px-10 py-4">
        <div class="max-w-6xl mx-auto flex gap-3 overflow-x-auto pb-2">
          <button class="px-4 py-2 rounded-full bg-canvas-primary text-white font-medium whitespace-nowrap transition-all">
            <Flame size={14} class="inline mr-2" />
            Trending
          </button>
          <button class="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 font-medium whitespace-nowrap transition-all">
            <Sparkles size={14} class="inline mr-2" />
            Fresh
          </button>
          <button class="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 font-medium whitespace-nowrap transition-all">
            <TrendingUp size={14} class="inline mr-2" />
            Popular
          </button>
          <button class="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 font-medium whitespace-nowrap transition-all">
            <Zap size={14} class="inline mr-2" />
            Synthesis
          </button>
        </div>
      </div>

      {/* Feed Content */}
      <div class="px-6 md:px-10 py-12">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-2xl font-bold text-white mb-8">✨ Trending Now</h2>
          <CommunityFeed
            entries={trendingEntries}
            isLoading={false}
            onViewEntry={(entry) => {
              window.location.href = `/journal/${entry.id}`;
            }}
            onLoadMore={() => console.log("load more")}
          />
        </div>
      </div>
    </div>
  );
}
