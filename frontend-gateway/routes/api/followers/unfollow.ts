import { FreshContext } from "$fresh/server.ts";

const followsDatabase: Map<string, Set<string>> = new Map();

export const handler = async (req: Request) => {
  const currentUserId = "user-123";

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: "targetUserId required" }), {
        status: 400,
      });
    }

    if (!followsDatabase.has(currentUserId)) {
      followsDatabase.set(currentUserId, new Set());
    }

    const userFollowing = followsDatabase.get(currentUserId)!;
    userFollowing.delete(targetUserId);

    return new Response(
      JSON.stringify({ success: true, action: "unfollowed" }),
      { status: 200 },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
    });
  }
};
