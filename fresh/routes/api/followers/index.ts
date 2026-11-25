/// <reference path="../../../types/fresh.d.ts" />

import { FreshContext } from "$fresh/server.ts";
import { getSessionUser } from "../../../utils/auth.ts";

// Mock database for MVP
const followsDatabase: Map<string, Set<string>> = new Map();

export const handler = async (req: Request, ctx: FreshContext) => {
  const userId = await getSessionUser(req);
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  const url = new URL(req.url);
  const currentUserId = userId;

  if (req.method === "POST") {
    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: "targetUserId required" }), {
        status: 400,
      });
    }

    if (targetUserId === currentUserId) {
      return new Response(JSON.stringify({ error: "Cannot follow yourself" }), {
        status: 400,
      });
    }

    if (!followsDatabase.has(currentUserId)) {
      followsDatabase.set(currentUserId, new Set());
    }

    const userFollowing = followsDatabase.get(currentUserId)!;

    if (url.pathname.includes("follow") && !url.pathname.includes("unfollow")) {
      userFollowing.add(targetUserId);
      return new Response(
        JSON.stringify({ success: true, action: "followed" }),
        {
          status: 200,
        },
      );
    } else if (url.pathname.includes("unfollow")) {
      userFollowing.delete(targetUserId);
      return new Response(
        JSON.stringify({ success: true, action: "unfollowed" }),
        { status: 200 },
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
    });
  }

  if (req.method === "GET") {
    // Check follow status
    if (
      url.searchParams.has("userId") && url.searchParams.has("targetUserId")
    ) {
        const userIdParam = url.searchParams.get("userId");
        const targetUserId = url.searchParams.get("targetUserId");

        if (!userIdParam || !targetUserId) {
          return new Response(JSON.stringify({ error: "userId and targetUserId required" }), { status: 400 });
        }

        const isFollowing = followsDatabase.get(userIdParam)?.has(targetUserId) ?? false;

      return new Response(JSON.stringify({ isFollowing }), {
        status: 200,
      });
    }

    // Get followers/following lists
    const userId = (ctx.params.id as string | undefined) || currentUserId;

    const userFollowing = followsDatabase.get(userId) || new Set();
    const followers = Array.from(followsDatabase.entries())
      .filter(([, following]) => following.has(userId))
      .map(([id]) => id);

    // Mock user profiles (would be fetched from DB in production)
    const getUserProfile = (id: string) => ({
      id,
      name: `User ${id.substring(0, 5)}`,
      username: `user_${id.substring(0, 5)}`,
      avatarUrl: `https://i.pravatar.cc/100?u=${id}`,
      bio: "Explorer of ideas",
      auraColor: ["#6366f1", "#8b5cf6", "#d946ef"][Math.random() * 3 | 0],
      resonanceScore: Math.floor(Math.random() * 100),
    });

    const followers_data = followers.map(getUserProfile);
    const following_data = Array.from(userFollowing).map(getUserProfile);

    return new Response(
      JSON.stringify({
        followers: followers_data,
        following: following_data,
        followerCount: followers.length,
        followingCount: userFollowing.size,
      }),
      { status: 200 },
    );
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
  });
};
