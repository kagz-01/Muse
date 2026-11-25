import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../server/auth";
import { queryDB } from "../../server/db";
import { listItems, mapItemRow } from "../../server/items";

export const Route = createFileRoute("/api/items")({
  server: { handlers: {
    GET: async ({ request }) => {
      const userId = await getSessionUser(request);
      if (!userId) return new Response("Unauthorized", { status: 401 });
      if (isDemoUser(userId)) return Response.json([]);
      return Response.json(await listItems(userId));
    },
    POST: async ({ request }) => {
      const userId = await getSessionUser(request);
      if (!userId) return new Response("Unauthorized", { status: 401 });
      if (isDemoUser(userId)) {
        const body = await request.json().catch(() => null) as Record<string, unknown> | null;
        if (!body?.title) return new Response("Title is required", { status: 400 });
        return Response.json({ success: true, item: { id: "demo-item", title: body.title } }, { status: 201 });
      }
      try {
        const body = await request.json() as Record<string, unknown>;
        const roomId = typeof body.roomId === "string" ? body.roomId : null;
        const title = typeof body.title === "string" ? body.title.trim() : "";
        if (!roomId || !title) return new Response("Title and roomId are required", { status: 400 });
        const room = await queryDB("SELECT id FROM rooms r LEFT JOIN room_collaborators rc ON rc.room_id=r.id WHERE r.id=$1 AND (r.user_id=$2 OR rc.user_id=$2)", roomId, userId);
        if (!room[0]) return new Response("Room not found or unauthorized", { status: 403 });
        const platform = typeof body.sourceUrl === "string" && /youtu|twitter|x\.com/.test(body.sourceUrl)
          ? (/youtu/.test(body.sourceUrl) ? "YouTube" : "X") : "Web";
        const rows = await queryDB(
          `INSERT INTO items (room_id,user_id,title,source_url,note,is_public,stored_content,data_provenance)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
          roomId, userId, title, typeof body.sourceUrl === "string" ? body.sourceUrl : "",
          typeof body.note === "string" ? body.note : null, body.isPublic === true,
          typeof body.storedContent === "string" ? body.storedContent : null,
          JSON.stringify({ platform, extractedAt: new Date().toISOString(), integrityHash: `sha256-${crypto.randomUUID()}` }),
        );
        return Response.json({ success: true, item: mapItemRow(rows[0]) }, { status: 201 });
      } catch (error) {
        console.error("Item creation failed:", error);
        return new Response("Internal Server Error", { status: 500 });
      }
    },
  }},
});
