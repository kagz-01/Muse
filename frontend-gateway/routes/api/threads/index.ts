import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { queryDB } from "../../../utils/db.ts";

function rowToThread(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    mood: row.mood || "focus",
    format: row.format,
    depth: row.depth,
    theme: row.theme,
    thesis: row.thesis,
    coverImage: row.cover_image,
    isPublic: row.is_public || false,
    isFavorited: row.is_favorited || false,
    isPinned: row.is_pinned || false,
    isArchived: row.is_archived || false,
    isVault: row.is_vault || false,
    synthesisScore: row.synthesis_score || 0,
    itemIds: row.artifact_ids || [],
    sourceRoomIds: row.source_room_ids || [],
    dialogueLayers: row.dialogue_layers || [],
    resonanceMetrics: row.resonance_metrics || { views: 0, connections: 0 },
    customStyling: row.custom_styling,
    synthesis: row.synthesis,
    updatedAt: row.updated_at,
    roomId: row.room_id,
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
        `SELECT t.* FROM threads t
         JOIN rooms r ON t.room_id = r.id
         WHERE r.user_id = $1
         ORDER BY t.updated_at DESC`,
        userId,
      );

      const threads = rows.map((r) =>
        rowToThread(r as Record<string, unknown>)
      );

      return new Response(JSON.stringify(threads), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Error fetching threads:", e);
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
      const {
        title,
        description,
        mood,
        format,
        depth,
        theme,
        thesis,
        coverImage,
        isPublic,
        isVault,
        roomId,
        itemIds,
        sourceRoomIds,
      } = body;

      if (!title || !roomId) {
        return new Response("Title and roomId are required", { status: 400 });
      }

      // Verify user owns the room
      const roomCheck = await queryDB(
        "SELECT id FROM rooms WHERE id = $1 AND user_id = $2",
        roomId,
        userId,
      );
      if (roomCheck.length === 0) {
        return new Response("Room not found or unauthorized", { status: 403 });
      }

      const result = await queryDB(
        `INSERT INTO threads (
          room_id, title, description, mood, format, depth, theme, thesis,
          cover_image, is_public, is_vault, artifact_ids, source_room_ids,
          synthesis_score, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW())
        RETURNING *`,
        roomId,
        title.trim(),
        description || "",
        mood || "focus",
        format || null,
        depth || null,
        theme || null,
        thesis || null,
        coverImage || null,
        isPublic || false,
        isVault || false,
        itemIds || [],
        sourceRoomIds || [],
        Math.floor(Math.random() * 40) + 60,
      );

      const thread = rowToThread(result[0] as Record<string, unknown>);

      return new Response(JSON.stringify({ success: true, thread }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Error creating thread:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
