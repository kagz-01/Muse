import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../../server/auth";
import { executeDB, queryDB } from "../../../server/db";

type SocialActionBody = Record<string, unknown>;

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

async function readJsonBody(request: Request): Promise<SocialActionBody | null> {
  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return null;
  }
  return body as SocialActionBody;
}

async function canAccessItem(userId: string, itemId: string): Promise<boolean> {
  const rows = await queryDB(
    `SELECT i.id
     FROM items i
     LEFT JOIN rooms r ON r.id = i.room_id
     LEFT JOIN room_collaborators rc ON rc.room_id = r.id
     WHERE i.id = $1
       AND (i.is_public = true OR i.user_id = $2 OR rc.user_id = $2)`,
    itemId,
    userId,
  );
  return rows.length > 0;
}

export async function getSocialResponse(request: Request): Promise<Response> {
  const userId = await getSessionUser(request);
  if (!userId) return jsonError("Unauthorized", 401);

  const action = new URL(request.url).searchParams.get("action");
  if (isDemoUser(userId)) {
    if (action === "requests") return Response.json({ requests: [] });
    if (action === "entanglements") {
      return Response.json({ entanglements: [] });
    }
    if (action === "partner_sparks") return Response.json({ sparks: [] });
  }

  try {
    if (action === "requests") {
      const requests = await queryDB(
        `SELECT e.id, e.requester_id, u.name, u.username, u.avatar_url,
                e.created_at
         FROM entanglements e
         JOIN users u ON u.id = e.requester_id
         WHERE e.addressee_id = $1 AND e.status = 'pending'
         ORDER BY e.created_at DESC`,
        userId,
      );
      return Response.json({ requests });
    }

    if (action === "entanglements") {
      const entanglements = await queryDB(
        `SELECT
           CASE WHEN e.requester_id = $1 THEN e.addressee_id
                ELSE e.requester_id END AS partner_id,
           CASE WHEN e.requester_id = $1 THEN ua.name ELSE ur.name
                END AS partner_name,
           CASE WHEN e.requester_id = $1 THEN ua.username ELSE ur.username
                END AS partner_handle,
           CASE WHEN e.requester_id = $1 THEN ua.current_streak
                ELSE ur.current_streak END AS partner_streak
         FROM entanglements e
         JOIN users ur ON ur.id = e.requester_id
         JOIN users ua ON ua.id = e.addressee_id
         WHERE (e.requester_id = $1 OR e.addressee_id = $1)
           AND e.status = 'accepted'`,
        userId,
      );
      return Response.json({ entanglements });
    }

    if (action === "partner_sparks") {
      const partnerId = new URL(request.url).searchParams.get("partnerId");
      if (!partnerId) return jsonError("partnerId required", 400);

      const accepted = await queryDB(
        `SELECT id
         FROM entanglements
         WHERE ((requester_id = $1 AND addressee_id = $2)
             OR (requester_id = $2 AND addressee_id = $1))
           AND status = 'accepted'`,
        userId,
        partnerId,
      );
      if (!accepted.length) return Response.json({ sparks: [] });

      const sparks = await queryDB(
        `SELECT id, title AS content, created_at,
                CASE WHEN room_id IS NULL THEN 'network' ELSE 'item' END AS type
         FROM items
         WHERE user_id = $1 AND is_public = true
         ORDER BY created_at DESC
         LIMIT 10`,
        partnerId,
      );
      return Response.json({ sparks });
    }

    return jsonError("Unknown action", 400);
  } catch (error) {
    console.error("Social GET failed:", error);
    return jsonError("Internal error", 500);
  }
}

export async function postSocialResponse(request: Request): Promise<Response> {
  const userId = await getSessionUser(request);
  if (!userId) return jsonError("Unauthorized", 401);
  if (isDemoUser(userId)) {
    return jsonError("Demo users cannot perform social actions", 403);
  }

  const body = await readJsonBody(request);
  if (!body) return jsonError("Invalid JSON body", 400);

  const action = typeof body.action === "string" ? body.action : "";
  try {
    if (action === "send_request") {
      const targetId = typeof body.addresseeId === "string"
        ? body.addresseeId.trim()
        : "";
      if (!targetId) return jsonError("addresseeId required", 400);
      if (targetId === userId) return jsonError("Cannot request yourself", 400);

      await executeDB(
        `INSERT INTO entanglements (requester_id, addressee_id, status)
         VALUES ($1, $2, 'pending')
         ON CONFLICT (requester_id, addressee_id) DO NOTHING`,
        userId,
        targetId,
      );
      return Response.json({ success: true });
    }

    if (action === "respond_request") {
      const requestId = typeof body.requestId === "string"
        ? body.requestId.trim()
        : "";
      if (!requestId || typeof body.accept !== "boolean") {
        return jsonError("requestId and boolean accept required", 400);
      }

      const status = body.accept ? "accepted" : "rejected";
      await executeDB(
        `UPDATE entanglements
         SET status = $1, updated_at = NOW()
         WHERE id = $2 AND addressee_id = $3`,
        status,
        requestId,
        userId,
      );
      return Response.json({ success: true, status });
    }

    if (action === "react") {
      const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
      const emoji = typeof body.emoji === "string" ? body.emoji.trim() : "";
      if (!itemId || !emoji) {
        return jsonError("itemId and emoji required", 400);
      }
      if (!(await canAccessItem(userId, itemId))) {
        return jsonError("Forbidden", 403);
      }

      const existing = await queryDB(
        `SELECT id, emoji
         FROM spark_reactions
         WHERE item_id = $1 AND user_id = $2`,
        itemId,
        userId,
      );
      if (existing[0]?.emoji === emoji) {
        await executeDB(
          "DELETE FROM spark_reactions WHERE item_id = $1 AND user_id = $2",
          itemId,
          userId,
        );
      } else {
        await executeDB(
          `INSERT INTO spark_reactions (item_id, user_id, emoji)
           VALUES ($1, $2, $3)
           ON CONFLICT (item_id, user_id) DO UPDATE SET emoji = $3`,
          itemId,
          userId,
          emoji,
        );
      }
      return Response.json({ success: true });
    }

    if (action === "comment") {
      const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
      const content = typeof body.content === "string"
        ? body.content.trim()
        : "";
      if (!itemId || !content) {
        return jsonError("itemId and content required", 400);
      }
      if (!(await canAccessItem(userId, itemId))) {
        return jsonError("Forbidden", 403);
      }

      await executeDB(
        `INSERT INTO spark_comments (item_id, user_id, content)
         VALUES ($1, $2, $3)`,
        itemId,
        userId,
        content,
      );
      return Response.json({ success: true });
    }

    return jsonError("Unknown action", 400);
  } catch (error) {
    console.error("Social POST failed:", error);
    return jsonError("Internal error", 500);
  }
}

export const Route = createFileRoute("/api/user/social")({
  server: {
    handlers: {
      GET: ({ request }) => getSocialResponse(request),
      POST: ({ request }) => postSocialResponse(request),
    },
  },
});
