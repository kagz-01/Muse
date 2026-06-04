import { useMemo, useEffect } from "preact/hooks";
import * as Icons from "lucide-preact";
import { loadMirrorStats, mirrorSignal } from "../../signals/mirror.ts";
import { getMoodStats, getActivityHeatmap, getStreakData, journalSignal } from "../../signals/journal.ts";
import EngagementCard from "../../components/mirror/EngagementCard.tsx";
import ActivityTimeline from "../../components/mirror/ActivityTimeline.tsx";
import { LineChart, PieChart } from "../../components/mirror/MirrorCharts.tsx";
import StreakCard from "./StreakCard.tsx";
import ActivityHeatmap from "./ActivityHeatmap.tsx";
import MoodDistribution from "./MoodDistribution.tsx";

export default function MirrorDashboard() {
  const currentUserId = "user-123";

  useEffect(() => {
    loadMirrorStats(currentUserId);
  }, []);

  const stats = mirrorSignal.value;
  const streakData = getStreakData();
  const entries = journalSignal.value;

  const moodStats = useMemo(() => {
    return getMoodStats();
  }, [entries]);

  const heatmap = useMemo(() => {
    return getActivityHeatmap();
  }, [entries]);

  return (
    <div className="min-h-screen bg-[var(--muse-background)] pb-32 md:pb-28">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-8">
        {/* Hero Section */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--muse-accent)] to-[var(--muse-accent-dark)] flex items-center justify-center">
              <Icons.Gauge size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--muse-text)]">
                Your Mirror
              </h1>
              <p className="text-[var(--muse-text-muted)] mt-2">
                See how the community resonates with your thoughts and
                contributions
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {stats.isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-[var(--muse-border-light)] border-t-[var(--muse-accent)] animate-spin" />
            <p className="mt-4 text-[var(--muse-text-muted)]">
              Loading your analytics...
            </p>
          </div>
        )}

        {/* Error State */}
        {stats.error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <Icons.AlertCircle size={20} className="text-red-500" />
            <p className="text-red-600">{stats.error}</p>
          </div>
        )}

        {!stats.isLoading && (
          <>
            {/* Engagement Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <EngagementCard
                label="Views"
                value={stats.stats.views}
                icon={Icons.Eye}
                trend={{ direction: "up", percentage: 12 }}
              />
              <EngagementCard
                label="Likes"
                value={stats.stats.likes}
                icon={Icons.Heart}
                trend={{ direction: "up", percentage: 8 }}
              />
              <EngagementCard
                label="Comments"
                value={stats.stats.comments}
                icon={Icons.MessageCircle}
                trend={{ direction: "up", percentage: 5 }}
              />
              <EngagementCard
                label="Collaborations"
                value={stats.stats.collaborations}
                icon={Icons.Zap}
                trend={{ direction: "up", percentage: 15 }}
              />
              <EngagementCard
                label="New Followers"
                value={stats.stats.follows}
                icon={Icons.UserPlus}
                trend={{ direction: "up", percentage: 18 }}
              />
              <EngagementCard
                label="Circle Joins"
                value={stats.stats.circleJoins}
                icon={Icons.Users}
                trend={{ direction: "up", percentage: 10 }}
              />
            </div>

            {/* Follower Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-[var(--muse-surface-bright)] rounded-2xl p-6 border border-[var(--muse-border-light)]">
                <p className="text-sm text-[var(--muse-text-muted)] mb-2">
                  Followers
                </p>
                <p className="text-3xl font-bold text-[var(--muse-text)]">
                  {stats.followerCount}
                </p>
                <p className="text-xs text-[var(--muse-success)] mt-2">
                  +12 this week
                </p>
              </div>

              <div className="bg-[var(--muse-surface-bright)] rounded-2xl p-6 border border-[var(--muse-border-light)]">
                <p className="text-sm text-[var(--muse-text-muted)] mb-2">
                  Following
                </p>
                <p className="text-3xl font-bold text-[var(--muse-text)]">
                  {stats.followingCount}
                </p>
                <p className="text-xs text-[var(--muse-text-muted)] mt-2">
                  Active connections
                </p>
              </div>

              <div className="bg-[var(--muse-surface-bright)] rounded-2xl p-6 border border-[var(--muse-border-light)]">
                <p className="text-sm text-[var(--muse-text-muted)] mb-2">
                  Engagement Rate
                </p>
                <p className="text-3xl font-bold text-[var(--muse-text)]">
                  {Math.round(
                    ((stats.stats.likes + stats.stats.comments) /
                      stats.stats.views) *
                      100,
                  )}%
                </p>
                <p className="text-xs text-[var(--muse-success)] mt-2">
                  +2% from last week
                </p>
              </div>
            </div>

            {/* Streak & Momentum */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-[var(--muse-text)] mb-6">
                Synthesis Chain
              </h2>
              <StreakCard streakData={streakData} />
            </div>

            {/* Visualizations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              <ActivityHeatmap data={heatmap} />
              <MoodDistribution
                moodStats={moodStats}
                onMoodClick={() => {}}
                activeMood="all"
              />
            </div>

            {/* Growth Chart and Activity Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              <div className="flex flex-col gap-6">
                <LineChart 
                  data={stats.followerHistory.map(h => h.count)} 
                  title="Audience Momentum" 
                  color="#8b5cf6" 
                />
                <PieChart
                  data={[
                    { label: "Reflections", value: entries.length, color: "#60a5fa" },
                    { label: "Syntheses", value: mirrorSignal.value.stats.collaborations, color: "#a78bfa" },
                    { label: "Public Broadcasts", value: entries.filter(e => e.isPublic).length, color: "#f472b6" }
                  ]}
                  title="Content Synthesis Distribution"
                />
              </div>

              <div className="bg-[#0d0d0d] rounded-[2rem] p-8 border border-white/5 shadow-xl">
                <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--muse-muted)] mb-6">
                  Live Activity Feed
                </h2>
                <ActivityTimeline activities={stats.activity.slice(0, 6)} />
              </div>
            </div>


          </>
        )}
      </div>
    </div>
  );
}
