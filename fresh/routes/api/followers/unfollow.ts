import { getSessionUser, isDemoUser } from "../../../utils/auth.ts";
import { executeDB } from "../../../utils/db.ts";

export const handler = async (req: Request) => {
  const userId = await getSessionUser(req);
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  if (isDemoUser(userId)) {
    return new Response(JSON.stringify({ error: "Demo users cannot mutate follows" }), { status: 403 });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { targetUserId } = await req.json();

    if (!targetUserId || typeof targetUserId !== "string") {
      return new Response(JSON.stringify({ error: "targetUserId required" }), { status: 400 });
    }

    await executeDB(`DELETE FROM follows WHERE follower_id = $1 AND followee_id = $2`, userId, targetUserId);

    return new Response(JSON.stringify({ success: true, action: "unfollowed" }), { status: 200 });
  } catch (err) {
    console.error("Error in unfollow endpoint", err);
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
  }
};
