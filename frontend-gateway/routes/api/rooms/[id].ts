import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { executeDB, queryDB } from "../../../utils/db.ts";

export const handler: Handlers = {
  // PUT - update an existing room
  async PUT(req, ctx) {
    const userId = await getSessionUser(req);
    if (!userId || userId === "__demo__") {
      return new Response("Unauthorized", { status: 401 });
    }

    const roomId = ctx.params.id;

    // Verify ownership
    const check = await queryDB(
      "SELECT id FROM rooms WHERE id = $1 AND user_id = $2",
      roomId,
      userId,
    );
    if (check.length === 0) {
      return new Response("Not found or unauthorized", { status: 404 });
    }

    try {
      const body = await req.json();
      const fieldMap: Record<string, string> = {
        name: "title",
        description: "description",
        emoji: "emoji",
        category: "category",
        size: "size",
        mood: "mood",
        themeColor: "theme_color",
        customThemeHex: "custom_theme_hex",
        coverImage: "cover_image",
        isPublic: "is_public",
        tags: "tags",
        notificationsEnabled: "notifications_enabled",
        semanticTags: "semantic_tags",
        resonanceMetrics: "resonance_metrics",
        customStyling: "custom_styling",
        isVault: "is_vault",
      };

      const setClauses: string[] = ["updated_at = NOW()"];
      const args: unknown[] = [];
      let argIndex = 1;

      for (const [jsKey, dbCol] of Object.entries(fieldMap)) {
        if (body[jsKey] !== undefined) {
          setClauses.push(`${dbCol} = $${argIndex++}`);
          args.push(body[jsKey]);
        }
      }

      args.push(roomId, userId);
      const updateQuery = `UPDATE rooms SET ${
        setClauses.join(", ")
      } WHERE id = $${argIndex++} AND user_id = $${argIndex} RETURNING *`;

      const result = await queryDB(updateQuery, ...args);
      const row = result[0] as Record<string, unknown>;

      const room = {
        id: row.id,
        name: row.title,
        description: row.description,
        emoji: row.emoji,
        category: row.category,
        size: row.size,
        mood: row.mood,
        themeColor: row.theme_color || "indigo",
        customThemeHex: row.custom_theme_hex,
        coverImage: row.cover_image,
        isPublic: row.is_public || false,
        tags: row.tags || [],
        notificationsEnabled: row.notifications_enabled ?? true,
        updatedAt: row.updated_at,
        semanticTags: row.semantic_tags || [],
        resonanceMetrics: row.resonance_metrics || { views: 0, wovenCount: 0 },
        customStyling: row.custom_styling,
        isVault: row.is_vault || false,
        count: row.item_count || 0,
      };

      return new Response(JSON.stringify({ success: true, room }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Error updating room:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },

  // DELETE - remove a room (and its child data via cascade)
  async DELETE(req, ctx) {
    const userId = await getSessionUser(req);
    if (!userId || userId === "__demo__") {
      return new Response("Unauthorized", { status: 401 });
    }

    const roomId = ctx.params.id;

    // Verify ownership
    const check = await queryDB(
      "SELECT id FROM rooms WHERE id = $1 AND user_id = $2",
      roomId,
      userId,
    );
    if (check.length === 0) {
      return new Response("Not found or unauthorized", { status: 404 });
    }

    try {
      // Cascade: remove journal entries linked to threads in this room
      await executeDB(
        "DELETE FROM journal_entries WHERE thread_id IN (SELECT id FROM threads WHERE room_id = $1)",
        roomId,
      );
      // Remove threads belonging to this room
      await executeDB("DELETE FROM threads WHERE room_id = $1", roomId);
      // Remove the room itself
      await executeDB(
        "DELETE FROM rooms WHERE id = $1 AND user_id = $2",
        roomId,
        userId,
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Error deleting room:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
