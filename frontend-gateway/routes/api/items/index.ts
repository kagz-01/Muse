import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { queryDB } from "../../../utils/db.ts";

function rowToItem(row: Record<string, unknown>) {
  return {
    id: row.id,
    roomId: row.room_id,
    title: row.title,
    sourceUrl: row.source_url || "",
    note: row.note,
    isPublic: row.is_public || false,
    storedContent: row.stored_content,
    localMediaPath: row.local_media_path,
    dataProvenance: row.data_provenance || {
      platform: "Web",
      extractedAt: new Date().toISOString(),
      integrityHash: "",
    },
    createdAt: row.created_at,
  };
}

export const handler: Handlers = {
  async GET(req) {
    const userId = await getSessionUser(req);
    if (!userId || userId === "__demo__") {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const rows = await queryDB(
        "SELECT * FROM items WHERE user_id = $1 ORDER BY created_at DESC",
        userId,
      );

      return new Response(
        JSON.stringify(
          rows.map((r) => rowToItem(r as Record<string, unknown>)),
        ),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (e) {
      console.error("Error fetching items:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },

  async POST(req) {
    const userId = await getSessionUser(req);
    if (!userId || userId === "__demo__") {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const body = await req.json();
      const { roomId, title, sourceUrl, note, isPublic, storedContent } = body;

      if (!title || !roomId) {
        return new Response("Title and roomId are required", { status: 400 });
      }

      // Verify room ownership
      const roomCheck = await queryDB(
        "SELECT id FROM rooms WHERE id = $1 AND user_id = $2",
        roomId,
        userId,
      );
      if (roomCheck.length === 0) {
        return new Response("Room not found or unauthorized", { status: 403 });
      }

      const platform =
        sourceUrl?.includes("x.com") || sourceUrl?.includes("twitter.com")
          ? "X"
          : sourceUrl?.includes("youtube.com")
          ? "YouTube"
          : "Web";

      const integrityHash = "sha256-" + Math.random().toString(16).slice(2, 10);

      const result = await queryDB(
        `INSERT INTO items (
          room_id, user_id, title, source_url, note, is_public, stored_content,
          data_provenance
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        roomId,
        userId,
        title.trim(),
        sourceUrl || "",
        note || null,
        isPublic || false,
        storedContent || null,
        JSON.stringify({
          platform,
          extractedAt: new Date().toISOString(),
          integrityHash,
        }),
      );

      return new Response(
        JSON.stringify({
          success: true,
          item: rowToItem(result[0] as Record<string, unknown>),
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (e) {
      console.error("Error creating item:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
