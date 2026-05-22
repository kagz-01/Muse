import { FreshContext } from "$fresh/server.ts";

// Mock database for mirror stats
const userStatsDatabase = new Map<
  string,
  {
    views: number;
    likes: number;
    comments: number;
    collaborations: number;
    follows: number;
    circleJoins: number;
    followerCount: number;
    followingCount: number;
    followerHistory: { date: string; count: number }[];
  }
>();

export const handler = async (req: Request) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId required" }), {
        status: 400,
      });
    }

    // Return mock stats
    const stats = userStatsDatabase.get(userId) || {
      views: 1250,
      likes: 342,
      comments: 89,
      collaborations: 23,
      follows: 156,
      circleJoins: 12,
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
    };

    return new Response(
      JSON.stringify({
        stats,
        activity: [],
        followerCount: stats.followerCount,
        followingCount: stats.followingCount,
        followerHistory: stats.followerHistory,
        isLoading: false,
        error: null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
    });
  }
};
