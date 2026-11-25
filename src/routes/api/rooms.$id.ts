import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../server/auth";
import { queryDB, withTransaction } from "../../server/db";
import { mapRoomRow, parseRoomInput, type RoomInput } from "../../server/rooms";
import { DEMO_ROOMS } from "../../server/rooms";

const updateFields: Array<[keyof RoomInput, string]> = [
  ["name", "title"],
  ["description", "description"],
  ["emoji", "emoji"],
  ["category", "category"],
  ["size", "size"],
  ["mood", "mood"],
  ["themeColor", "theme_color"],
  ["customThemeHex", "custom_theme_hex"],
  ["coverImage", "cover_image"],
  ["isPublic", "is_public"],
  ["tags", "tags"],
  ["notificationsEnabled", "notifications_enabled"],
  ["semanticTags", "semantic_tags"],
  ["resonanceMetrics", "resonance_metrics"],
  ["customStyling", "custom_styling"],
  ["isVault", "is_vault"],
];

export const Route = createFileRoute("/api/rooms/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          const userId = await getSessionUser(request);
          if (!userId) return new Response("Unauthorized", { status: 401 });
          if (isDemoUser(userId)) {
            const room = DEMO_ROOMS.find((item) => item.id === params.id);
            return room
              ? Response.json(room)
              : new Response("Not found", { status: 404 });
          }

          const rows = await queryDB(
            `SELECT r.*, COUNT(DISTINCT i.id)::int AS item_count
             FROM rooms r
             LEFT JOIN room_collaborators rc ON rc.room_id = r.id
             LEFT JOIN items i ON i.room_id = r.id
             WHERE r.id = $1 AND (r.user_id = $2 OR rc.user_id = $2)
             GROUP BY r.id`,
            params.id,
            userId,
          );
          if (!rows[0]) return new Response("Not found", { status: 404 });
          return Response.json(mapRoomRow(rows[0]));
        } catch (error) {
          console.error("Room detail request failed:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
      PUT: async ({ request, params }) => {
        try {
          const userId = await getSessionUser(request);
          if (!userId) return new Response("Unauthorized", { status: 401 });
          if (isDemoUser(userId)) {
            return new Response("Demo users cannot update rooms", {
              status: 403,
            });
          }

          let body: unknown;
          try {
            body = await request.json();
          } catch {
            return new Response("Invalid JSON body", { status: 400 });
          }

          const input = parseRoomInput(body);
          if (!input || Object.keys(input).length === 0) {
            return new Response("No valid room fields were provided", {
              status: 400,
            });
          }

          const values: unknown[] = [];
          const clauses = ["updated_at = NOW()"];
          for (const [field, column] of updateFields) {
            const value = input[field];
            if (value === undefined) continue;
            values.push(value);
            clauses.push(`${column} = $${values.length}`);
          }

          values.push(params.id, userId);
          const rows = await queryDB(
            `UPDATE rooms
             SET ${clauses.join(", ")}
             WHERE id = $${values.length - 1} AND user_id = $${values.length}
             RETURNING *, 0::int AS item_count`,
            ...values,
          );
          if (!rows[0]) return new Response("Not found", { status: 404 });
          return Response.json({ success: true, room: mapRoomRow(rows[0]) });
        } catch (error) {
          console.error("Room update request failed:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
      DELETE: async ({ request, params }) => {
        try {
          const userId = await getSessionUser(request);
          if (!userId) return new Response("Unauthorized", { status: 401 });
          if (isDemoUser(userId)) {
            return new Response("Demo users cannot delete rooms", {
              status: 403,
            });
          }

          const deleted = await withTransaction(async (client) => {
            const owned = await client.query(
              "SELECT id FROM rooms WHERE id = $1 AND user_id = $2 FOR UPDATE",
              [params.id, userId],
            );
            if (!owned.rowCount) return false;

            await client.query(
              `DELETE FROM journal_entries
               WHERE user_id = $1
                 AND thread_id IN (SELECT id FROM threads WHERE room_id = $2)`,
              [userId, params.id],
            );
            await client.query("DELETE FROM threads WHERE room_id = $1", [
              params.id,
            ]);
            await client.query(
              "DELETE FROM rooms WHERE id = $1 AND user_id = $2",
              [params.id, userId],
            );
            return true;
          });
          if (!deleted) return new Response("Not found", { status: 404 });
          return Response.json({ success: true });
        } catch (error) {
          console.error("Room deletion request failed:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    },
  },
});
