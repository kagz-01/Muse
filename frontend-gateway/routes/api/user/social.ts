import { queryDB, executeDB } from "../../../utils/db.ts";
import { getSessionUser } from "../../../utils/auth.ts";

/**
 * /api/user/social — Social Graph API (Phase 2)
 *
 * GET  ?action=requests          → pending entanglement requests (inbound)
 * GET  ?action=entanglements     → accepted partners
 * GET  ?action=partner_sparks&partnerId=<id> → partner's public items
 *
 * POST { action: "send_request",    addresseeId }
 * POST { action: "respond_request", requestId, accept: bool }
 * POST { action: "react",           itemId, emoji }
 * POST { action: "comment",         itemId, content }
 */
export async function GET(req: Request): Promise<Response> {
  const rawUserId = await getSessionUser(req);
  if (!rawUserId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const userId = (rawUserId as string).replace(/[^a-zA-Z0-9-]/g, "");
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    // --- Pending inbound requests ---
    if (action === "requests") {
      const rows = await queryDB(
        `SELECT e.id, e.requester_id, u.name, u.username, u.avatar_url, e.created_at
         FROM entanglements e
         JOIN users u ON u.id = e.requester_id
         WHERE e.addressee_id = $1 AND e.status = 'pending'
         ORDER BY e.created_at DESC`,
        userId
      );
      return new Response(JSON.stringify({ requests: rows ?? [] }), { status: 200 });
    }

    // --- Accepted entanglement partners ---
    if (action === "entanglements") {
      const rows = await queryDB(
        `SELECT 
           CASE WHEN e.requester_id = $1 THEN e.addressee_id ELSE e.requester_id END AS partner_id,
           CASE WHEN e.requester_id = $1 THEN ua.name ELSE ur.name END AS partner_name,
           CASE WHEN e.requester_id = $1 THEN ua.username ELSE ur.username END AS partner_handle,
           CASE WHEN e.requester_id = $1 THEN ua.current_streak ELSE ur.current_streak END AS partner_streak
         FROM entanglements e
         JOIN users ur ON ur.id = e.requester_id
         JOIN users ua ON ua.id = e.addressee_id
         WHERE (e.requester_id = $1 OR e.addressee_id = $1) AND e.status = 'accepted'`,
        userId
      );
      return new Response(JSON.stringify({ entanglements: rows ?? [] }), { status: 200 });
    }

    // --- Partner's public sparks ---
    if (action === "partner_sparks") {
      const partnerId = url.searchParams.get("partnerId")?.replace(/[^a-zA-Z0-9-]/g, "");
      if (!partnerId) return new Response(JSON.stringify({ error: "partnerId required" }), { status: 400 });

      // Verify they are actually entangled
      const check = await queryDB(
        `SELECT id FROM entanglements 
         WHERE ((requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1))
         AND status = 'accepted'`,
        userId, partnerId
      );
      if (!check.length) {
        return new Response(JSON.stringify({ sparks: [] }), { status: 200 });
      }

      const sparks = await queryDB(
        `SELECT i.id, i.title AS content, i.created_at,
           CASE WHEN i.room_id IS NULL THEN 'network' ELSE 'item' END as type
         FROM items i
         WHERE i.user_id = $1
         ORDER BY i.created_at DESC LIMIT 10`,
        partnerId
      );
      return new Response(JSON.stringify({ sparks: sparks ?? [] }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400 });
  } catch (err) {
    console.error("Social GET error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
  }
}

export async function POST(req: Request): Promise<Response> {
  const rawUserId = await getSessionUser(req);
  if (!rawUserId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const userId = (rawUserId as string).replace(/[^a-zA-Z0-9-]/g, "");

  try {
    const { action, addresseeId, requestId, accept, itemId, emoji, content } = await req.json();

    // --- Send an entanglement request ---
    if (action === "send_request") {
      const targetId = (addresseeId as string).replace(/[^a-zA-Z0-9-]/g, "");
      await executeDB(
        `INSERT INTO entanglements (requester_id, addressee_id, status)
         VALUES ($1, $2, 'pending')
         ON CONFLICT (requester_id, addressee_id) DO NOTHING`,
        userId, targetId
      );
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // --- Accept or reject a request ---
    if (action === "respond_request") {
      const cleanId = (requestId as string).replace(/[^a-zA-Z0-9-]/g, "");
      const newStatus = accept ? "accepted" : "rejected";
      await executeDB(
        `UPDATE entanglements SET status = $1, updated_at = NOW()
         WHERE id = $2 AND addressee_id = $3`,
        newStatus, cleanId, userId
      );
      return new Response(JSON.stringify({ success: true, status: newStatus }), { status: 200 });
    }

    // --- React to a spark ---
    if (action === "react") {
      const cleanItemId = (itemId as string).replace(/[^a-zA-Z0-9-]/g, "");
      const existing = await queryDB(
        `SELECT id, emoji FROM spark_reactions WHERE item_id = $1 AND user_id = $2`,
        cleanItemId, userId
      );
      if (existing.length && (existing[0] as { emoji: string }).emoji === emoji) {
        await executeDB(`DELETE FROM spark_reactions WHERE item_id = $1 AND user_id = $2`, cleanItemId, userId);
      } else {
        await executeDB(
          `INSERT INTO spark_reactions (item_id, user_id, emoji) VALUES ($1, $2, $3)
           ON CONFLICT (item_id, user_id) DO UPDATE SET emoji = $3`,
          cleanItemId, userId, emoji
        );
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // --- Comment on a spark ---
    if (action === "comment") {
      const cleanItemId = (itemId as string).replace(/[^a-zA-Z0-9-]/g, "");
      await executeDB(
        `INSERT INTO spark_comments (item_id, user_id, content) VALUES ($1, $2, $3)`,
        cleanItemId, userId, content
      );
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400 });
  } catch (err) {
    console.error("Social POST error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
  }
}
