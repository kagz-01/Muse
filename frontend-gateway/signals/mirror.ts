import { signal } from "@preact/signals";

export interface EngagementStats {
  views: number;
  likes: number;
  comments: number;
  collaborations: number;
  follows: number;
  circleJoins: number;
}

export interface ActivityEntry {
  id: string;
  type: "follow" | "like" | "comment" | "join_circle" | "collaborate" | "view";
  actor: string;
  actorAvatar: string;
  target?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface MirrorStats {
  stats: EngagementStats;
  activity: ActivityEntry[];
  followerCount: number;
  followingCount: number;
  followerHistory: { date: string; count: number }[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MirrorStats = {
  stats: {
    views: 1250,
    likes: 342,
    comments: 89,
    collaborations: 23,
    follows: 156,
    circleJoins: 12,
  },
  activity: [
    {
      id: "act-1",
      type: "follow",
      actor: "Sarah Chen",
      actorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      timestamp: new Date(Date.now() - 5 * 60000),
    },
    {
      id: "act-2",
      type: "like",
      actor: "Marcus Webb",
      actorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
      target: "Your thought on AI consciousness",
      timestamp: new Date(Date.now() - 15 * 60000),
    },
    {
      id: "act-3",
      type: "comment",
      actor: "Elena Rodriguez",
      actorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
      target: "Your artifact: Design Patterns",
      timestamp: new Date(Date.now() - 45 * 60000),
    },
    {
      id: "act-4",
      type: "join_circle",
      actor: "Alex Park",
      actorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      target: "Digital Architects",
      timestamp: new Date(Date.now() - 2 * 3600000),
    },
    {
      id: "act-5",
      type: "collaborate",
      actor: "Jordan Bell",
      actorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
      target: "Blockchain Ethics",
      timestamp: new Date(Date.now() - 4 * 3600000),
    },
  ],
  followerCount: 156,
  followingCount: 89,
  followerHistory: [
    { date: "Mon", count: 120 },
    { date: "Tue", count: 128 },
    { date: "Wed", count: 135 },
    { date: "Thu", count: 142 },
    { date: "Fri", count: 149 },
    { date: "Sat", count: 154 },
    { date: "Sun", count: 156 },
  ],
  isLoading: false,
  error: null,
};

export const mirrorSignal = signal<MirrorStats>(initialState);

export const loadMirrorStats = async (userId: string) => {
  mirrorSignal.value = {
    ...mirrorSignal.value,
    isLoading: true,
    error: null,
  };

  try {
    const response = await fetch(`/api/mirror?userId=${userId}`);
    if (!response.ok) throw new Error("Failed to load mirror stats");

    const data = await response.json();
    mirrorSignal.value = {
      ...data,
      isLoading: false,
    };
  } catch (err) {
    mirrorSignal.value = {
      ...mirrorSignal.value,
      error: err instanceof Error ? err.message : "Unknown error",
      isLoading: false,
    };
  }
};

export const refreshMirrorStats = async (userId: string) => {
  await loadMirrorStats(userId);
};
