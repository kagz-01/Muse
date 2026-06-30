/// <reference path="../../../../types/fresh.d.ts" />

import { FreshContext } from "$fresh/server.ts";
import { getSessionUser } from "../../../../utils/auth.ts";
import { queryDB } from "../../../../utils/db.ts";

export const handler = async (req: Request, ctx: FreshContext) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }
  try {
    const circleId = ctx.params.id;
    const userId = await getSessionUser(req);
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    if (!circleId) {
      return new Response(JSON.stringify({ error: "circleId required" }), {
        status: 400,
      });
    }

    const rows = await queryDB(
      `SELECT u.id AS user_id, u.username, u.name, u.avatar_url, cm.joined_at, cm.role, u.resonance_score
       FROM circle_members cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.circle_id = $1 ORDER BY cm.joined_at ASC LIMIT 200`,
      circleId,
    );

    const members = rows.map((r: any) => ({
      userId: r.user_id,
      name: r.name,
      username: r.username,
      avatar: r.avatar_url,
      joinedAt: r.joined_at,
      role: r.role,
      resonanceScore: r.resonance_score,
    }));

    return new Response(JSON.stringify({ members }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching circle members:", err);
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
    });
  }
};
