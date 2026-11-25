import { getSessionUser, isDemoUser } from "../../../utils/auth.ts";
import { executeDB, queryDB } from "../../../utils/db.ts";

export const handler = async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const currentUserId = await getSessionUser(req);
  if (!currentUserId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  if (isDemoUser(currentUserId)) {
    return new Response(JSON.stringify({ error: "Demo users cannot modify memberships" }), { status: 403 });
  }

  try {
    const { circleId } = await req.json();

    if (!circleId || typeof circleId !== "string") {
      return new Response(JSON.stringify({ error: "circleId required" }), { status: 400 });
    }

    await executeDB(`DELETE FROM circle_members WHERE circle_id = $1 AND user_id = $2`, circleId, currentUserId);

    const rows = await queryDB(`SELECT COUNT(*) as cnt FROM circle_members WHERE circle_id = $1`, circleId);
    const count = Number((rows[0] as Record<string, unknown>).cnt || 0);

    return new Response(JSON.stringify({ success: true, isMember: false, memberCount: count }), { status: 200 });
  } catch (err) {
    console.error("Error leaving circle:", err);
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
  }
};
