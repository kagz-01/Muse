import { getSessionUser } from "../../../utils/auth.ts";
import { queryDB } from "../../../utils/db.ts";

export const handler = async (req: Request) => {
  const sessionUserId = await getSessionUser(req);
  if (!sessionUserId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const targetUserId = url.searchParams.get("targetUserId");

    if (!userId || !targetUserId) {
      return new Response(JSON.stringify({ error: "userId and targetUserId required" }), { status: 400 });
    }

    const rows = await queryDB(`SELECT 1 FROM follows WHERE follower_id = $1 AND followee_id = $2 LIMIT 1`, userId, targetUserId);
    const isFollowing = rows.length > 0;

    return new Response(JSON.stringify({ isFollowing }), { status: 200 });
  } catch (err) {
    console.error("Error in follow status endpoint", err);
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
  }
};
