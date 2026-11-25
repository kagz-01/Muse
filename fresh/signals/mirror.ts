import { signal } from "@preact/signals";
import { journalSignal } from "./journal.ts";
import { roomsSignal } from "./rooms.ts";
import { threadsSignal } from "./threads.ts";
import { userSignal } from "./user.ts";

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

export const loadMirrorStats = async () => {
  mirrorSignal.value = {
    ...mirrorSignal.value,
    isLoading: true,
    error: null,
  };

  try {
    const response = await fetch(`/api/mirror`);
    if (!response.ok) {
      throw new Error(`Mirror API responded with ${response.status}`);
    }

    const data = await response.json() as Partial<MirrorStats>;

    mirrorSignal.value = {
      ...mirrorSignal.value,
      ...data,
      isLoading: false,
      error: null,
    };
  } catch (err) {
    const journals = journalSignal.value;
    const rooms = roomsSignal.value;
    const threads = threadsSignal.value;
    const user = userSignal.value;

    const followerBase = Math.max(
      user?.resonance.connections ?? initialState.followerCount,
      initialState.followerCount,
    );

    const totalViews = journals.reduce(
      (sum, entry) => sum + (entry.viewCount ?? 0),
      0,
    ) + threads.reduce(
      (sum, thread) => sum + (thread.resonanceMetrics?.views ?? 0),
      0,
    );

    const totalLikes = journals.filter((entry) => entry.isFavorited).length * 7 +
      threads.filter((thread) => thread.isFavorited).length * 10;

    const totalComments = threads.reduce(
      (sum, thread) => sum + (thread.dialogueLayers?.length ?? 0),
      0,
    );

    const totalCollaborations = Math.max(rooms.length + threads.length, 1);
    const totalCircleJoins = rooms.filter((room) => room.isPublic).length;

    const followerHistory = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString("en-US", { weekday: "short" }),
        count: Math.max(
          followerBase - 18 + i * 3 + Math.floor(Math.random() * 6),
          0,
        ),
      };
    });

    const recentActivity = [
      ...threads.slice(-2).map((thread, index) => ({
        id: `act-thread-${thread.id}`,
        type: "view" as const,
        actor: "Network",
        actorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=network-${index}`,
        target: thread.title,
        timestamp: new Date(thread.updatedAt),
      })),
      ...rooms.slice(0, 2).map((room, index) => ({
        id: `act-room-${room.id}`,
        type: "join_circle" as const,
        actor: "Circle",
        actorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=circle-${index}`,
        target: room.title || room.name,
        timestamp: new Date(room.updatedAt),
      })),
      ...journals.slice(-2).map((entry, index) => ({
        id: `act-journal-${entry.id}`,
        type: "collaborate" as const,
        actor: "Insight",
        actorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=insight-${index}`,
        target: entry.body.split("\n")[0].slice(0, 36),
        timestamp: new Date(entry.createdAt),
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);

    mirrorSignal.value = {
      ...mirrorSignal.value,
      stats: {
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
        collaborations: totalCollaborations,
        follows: followerBase,
        circleJoins: totalCircleJoins,
      },
      activity: recentActivity.length > 0 ? recentActivity : initialState.activity,
      followerCount: followerBase,
      followingCount: Math.max(rooms.length + threads.length, initialState.followingCount),
      followerHistory,
      isLoading: false,
      error: err instanceof Error ? err.message : "Failed to load mirror stats",
    };
  }
};

export const refreshMirrorStats = async () => {
  await loadMirrorStats();
};
