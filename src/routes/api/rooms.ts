import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../server/auth";
import { queryDB } from "../../server/db";
import {
  createRoomRecord,
  DEMO_ROOMS,
  mapRoomRow,
  parseRoomForm,
  parseRoomInput,
  type RoomInput,
} from "../../server/rooms";

async function readRoomInput(request: Request): Promise<RoomInput | null> {
  if (request.headers.get("content-type")?.includes("multipart/form-data")) {
    return parseRoomForm(await request.formData());
  }

  try {
    return parseRoomInput(await request.json(), true);
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/rooms")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const userId = await getSessionUser(request);
          if (!userId) return new Response("Unauthorized", { status: 401 });
          if (isDemoUser(userId)) return Response.json(DEMO_ROOMS);

          const rows = await queryDB(
            `SELECT r.*, COUNT(DISTINCT i.id)::int AS item_count
             FROM rooms r
             LEFT JOIN room_collaborators rc ON rc.room_id = r.id
             LEFT JOIN items i ON i.room_id = r.id
             WHERE r.user_id = $1 OR rc.user_id = $1
             GROUP BY r.id
             ORDER BY r.updated_at DESC`,
            userId,
          );
          return Response.json(rows.map(mapRoomRow));
        } catch (error) {
          console.error("Room list request failed:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
      POST: async ({ request }) => {
        try {
          const userId = await getSessionUser(request);
          if (!userId) return new Response("Unauthorized", { status: 401 });
          if (isDemoUser(userId)) {
            return new Response("Demo users cannot create rooms", {
              status: 403,
            });
          }

          const input = await readRoomInput(request);
          if (!input?.name) {
            return new Response("A valid room name is required", {
              status: 400,
            });
          }

          const room = await createRoomRecord(userId, input);
          return Response.json(
            { success: true, room },
            { status: 201 },
          );
        } catch (error) {
          console.error("Room creation request failed:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    },
  },
});
