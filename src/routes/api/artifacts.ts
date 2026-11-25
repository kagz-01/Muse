import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../server/auth";
import { mapArtifactRow } from "../../server/artifacts";
import { queryDB } from "../../server/db";
import { hasRoomAccess } from "../../server/rooms";

export const Route = createFileRoute("/api/artifacts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const userId = await getSessionUser(request);
        if (!userId) return new Response("Unauthorized", { status: 401 });

        const roomId = new URL(request.url).searchParams.get("roomId");
        if (!roomId) {
          return Response.json({ error: "roomId required" }, { status: 400 });
        }
        if (isDemoUser(userId)) return Response.json([]);

        try {
          if (!await hasRoomAccess(userId, roomId)) {
            return new Response("Room not found", { status: 404 });
          }
          const rows = await queryDB(
            `SELECT id, type, source_url, created_at
             FROM artifacts
             WHERE room_id = $1
             ORDER BY created_at DESC`,
            roomId,
          );
          return Response.json(rows.map(mapArtifactRow));
        } catch (error) {
          console.error("Room artifacts request failed:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    },
  },
});
