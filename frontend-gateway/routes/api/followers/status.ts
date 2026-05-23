import { FreshContext } from "$fresh/server.ts";

const followsDatabase: Map<string, Set<string>> = new Map();

export const handler = async (req: Request) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const targetUserId = url.searchParams.get("targetUserId");

    if (!userId || !targetUserId) {
      return new Response(
        JSON.stringify({ error: "userId and targetUserId required" }),
        {
          status: 400,
        },
      );
    }

    const isFollowing = followsDatabase.get(userId)?.has(targetUserId) ?? false;

    return new Response(JSON.stringify({ isFollowing }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
    });
  }
};
