import { useEffect, useState } from "preact/hooks";
import { Zap, Users, TrendingUp, Award, Calendar } from "lucide-preact";

interface UserStats {
  userId: string;
  username: string;
  bio?: string;
  totalEntries: number;
  totalSynthesis: number;
  publicEntries: number;
  averageMood: string;
  currentStreak: number;
  longestStreak: number;
  totalFavorites: number;
  communityViews: number;
  joinedAt: number;
  lastActive: number;
  topMoods: Array<[string, number]>;
  topTags: Array<[string, number]>;
  recentSynthesis: Array<{
    id: string;
    title: string;
    createdAt: number;
    views: number;
  }>;
}

interface UserProfileProps {
  userId: string;
  onClose?: () => void;
}

const moodColors: Record<string, string> = {
  reflective: "bg-indigo-500/20 text-indigo-300",
  grounded: "bg-emerald-500/20 text-emerald-300",
  anxious: "bg-red-500/20 text-red-300",
  grateful: "bg-rose-500/20 text-rose-300",
  melancholic: "bg-slate-500/20 text-slate-300",
  charged: "bg-yellow-500/20 text-yellow-300",
  empty: "bg-gray-500/20 text-gray-300",
  alive: "bg-cyan-500/20 text-cyan-300",
  inspired: "bg-purple-500/20 text-purple-300",
  nostalgic: "bg-pink-500/20 text-pink-300",
  focused: "bg-blue-500/20 text-blue-300",
  tender: "bg-orange-500/20 text-orange-300",
};

export function UserProfile({ userId, onClose }: UserProfileProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch user stats from API
    // For now, using mock data for development
    setStats({
      userId,
      username: "Alex Journey",
      bio: "Exploring the intersection of thought and action. 🌱",
      totalEntries: 247,
      totalSynthesis: 18,
      publicEntries: 142,
      averageMood: "inspired",
      currentStreak: 12,
      longestStreak: 45,
      totalFavorites: 89,
      communityViews: 2341,
      joinedAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
      lastActive: Date.now() - 2 * 60 * 60 * 1000,
      topMoods: [
        ["inspired", 52],
        ["grateful", 38],
        ["reflective", 31],
        ["alive", 28],
        ["focused", 24],
      ],
      topTags: [
        ["growth", 34],
        ["learning", 28],
        ["reflection", 25],
        ["synthesis", 22],
        ["patterns", 19],
      ],
      recentSynthesis: [
        {
          id: "s1",
          title: "Q1 Learning Synthesis",
          createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
          views: 124,
        },
        {
          id: "s2",
          title: "Connection Between Creativity & Constraints",
          createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
          views: 89,
        },
        {
          id: "s3",
          title: "Building Habits Through Community",
          createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
          views: 156,
        },
      ],
    });
    setLoading(false);
  }, [userId]);

  if (loading) {
    return (
      <div class="flex items-center justify-center h-screen bg-slate-950">
        <div class="animate-pulse text-white/50">Loading profile...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div class="flex items-center justify-center h-screen bg-slate-950">
        <div class="text-white/50">User not found</div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-12">
      {/* Header Background */}
      <div class="h-32 bg-gradient-to-r from-canvas-primary/20 to-purple-600/20 border-b border-white/10" />

      {/* Profile Content */}
      <div class="max-w-5xl mx-auto px-6 -mt-16">
        {/* Profile Card */}
        <div class="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
          <div class="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar & Basic Info */}
            <div class="flex flex-col items-center gap-4">
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-canvas-primary to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-2xl">
                {stats.username.charAt(0)}
              </div>
              <div class="text-center">
                <h1 class="text-2xl font-bold text-white">{stats.username}</h1>
                <p class="text-sm text-white/60 mt-1">{stats.bio}</p>
              </div>
              <div class="flex gap-2">
                <span class="px-3 py-1 rounded-full bg-canvas-primary/20 text-canvas-primary text-xs font-semibold">
                  Active
                </span>
                <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                  Community Member
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div class="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatBox
                icon={<Zap size={18} />}
                label="Current Streak"
                value={stats.currentStreak}
                unit="days"
              />
              <StatBox
                icon={<Award size={18} />}
                label="Longest Streak"
                value={stats.longestStreak}
                unit="days"
              />
              <StatBox
                icon={<TrendingUp size={18} />}
                label="Public Entries"
                value={stats.publicEntries}
                unit="posts"
              />
              <StatBox
                icon={<Users size={18} />}
                label="Community Views"
                value={stats.communityViews}
                unit="views"
              />
              <StatBox
                icon={<Zap size={18} />}
                label="Total Synthesis"
                value={stats.totalSynthesis}
                unit="created"
              />
              <StatBox
                icon={<Calendar size={18} />}
                label="Member Since"
                value={formatDate(stats.joinedAt)}
              />
            </div>
          </div>
        </div>

        {/* Moods & Tags */}
        <div class="grid md:grid-cols-2 gap-6 mb-8">
          {/* Top Moods */}
          <div class="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span class="w-8 h-8 rounded-lg bg-canvas-primary/20 flex items-center justify-center">
                <Zap size={16} class="text-canvas-primary" />
              </span>
              Top Moods
            </h2>
            <div class="space-y-3">
              {stats.topMoods.map(([mood, count]) => (
                <div key={mood} class="flex items-center justify-between">
                  <span class={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${moodColors[mood]}`}>
                    {mood}
                  </span>
                  <div class="flex items-center gap-2">
                    <div class="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-gradient-to-r from-canvas-primary to-purple-600 rounded-full transition-all"
                        style={{ width: `${(count / stats.topMoods[0][1]) * 100}%` }}
                      />
                    </div>
                    <span class="text-xs text-white/60 w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Tags */}
          <div class="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span class="w-8 h-8 rounded-lg bg-canvas-primary/20 flex items-center justify-center">
                <TrendingUp size={16} class="text-canvas-primary" />
              </span>
              Top Tags
            </h2>
            <div class="space-y-3">
              {stats.topTags.map(([tag, count]) => (
                <div key={tag} class="flex items-center justify-between">
                  <span class="text-sm text-white/80 capitalize">#{tag}</span>
                  <div class="flex items-center gap-2">
                    <div class="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all"
                        style={{ width: `${(count / stats.topTags[0][1]) * 100}%` }}
                      />
                    </div>
                    <span class="text-xs text-white/60 w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Synthesis */}
        <div class="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Zap size={16} class="text-amber-400" />
            </span>
            Recent Synthesis
          </h2>
          <div class="space-y-3">
            {stats.recentSynthesis.map((synthesis) => (
              <button
                key={synthesis.id}
                class="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-start justify-between group"
              >
                <div>
                  <h3 class="font-semibold text-white group-hover:text-canvas-primary transition-colors">
                    {synthesis.title}
                  </h3>
                  <p class="text-xs text-white/50 mt-1">
                    {formatDate(synthesis.createdAt)}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-xs font-semibold text-white/80">{synthesis.views}</p>
                  <p class="text-xs text-white/50">views</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatBoxProps {
  icon: preact.ComponentChildren;
  label: string;
  value: number | string;
  unit?: string;
}

function StatBox({ icon, label, value, unit }: StatBoxProps) {
  return (
    <div class="bg-white/5 border border-white/10 rounded-xl p-3">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-canvas-primary">{icon}</span>
        <p class="text-xs text-white/60">{label}</p>
      </div>
      <p class="text-xl font-bold text-white">
        {value}
        {unit && <span class="text-xs text-white/50 ml-1">{unit}</span>}
      </p>
    </div>
  );
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
