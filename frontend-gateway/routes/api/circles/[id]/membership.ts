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

  const currentUserId = await getSessionUser(req);
  if (!currentUserId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
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
      `SELECT COUNT(*) as cnt FROM circle_members WHERE circle_id = $1`,
      circleId,
    );
    const count = Number((rows[0] as any).cnt || 0);

    const membership = await queryDB(
      `SELECT 1 FROM circle_members WHERE circle_id = $1 AND user_id = $2 LIMIT 1`,
      circleId,
      userId,
    );

    const isMember = membership.length > 0;

    return new Response(JSON.stringify({ isMember, memberCount: count }), {
      status: 200,
    });
  } catch (err) {
    console.error("Error checking circle membership:", err);
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
    });
  }
};
