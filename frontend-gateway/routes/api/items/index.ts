/// <reference path="../../../types/fresh.d.ts" />

import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { queryDB } from "../../../utils/db.ts";
import { generateArtifactAnnotation } from "../../../utils/ai.ts";

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
    authorId: row.user_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
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
        `SELECT DISTINCT i.*, u.name as author_name, u.avatar_url as author_avatar 
         FROM items i 
         LEFT JOIN rooms r ON i.room_id = r.id 
         LEFT JOIN room_collaborators rc ON r.id = rc.room_id 
         LEFT JOIN users u ON i.user_id = u.id 
         WHERE i.user_id = $1 OR r.user_id = $1 OR rc.user_id = $1 
         ORDER BY i.created_at DESC`,
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
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    // Prevent demo users from mutating DB
    if (userId === "__demo__") {
      return new Response(JSON.stringify({ error: "Demo users cannot create items" }), { status: 403 });
    }

    try {
      const body = await req.json();
      const { roomId, title, sourceUrl, note, isPublic, storedContent } = body;

      if (!title || !roomId) {
        return new Response("Title and roomId are required", { status: 400 });
      }

      // Verify room ownership or collaborator status
      const roomCheck = await queryDB(
        `SELECT r.id FROM rooms r 
         LEFT JOIN room_collaborators rc ON r.id = rc.room_id 
         WHERE r.id = $1 AND (r.user_id = $2 OR rc.user_id = $2)`,
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

      const newItem = rowToItem(result[0] as Record<string, unknown>);

      // Phase 3: The AI Observer — fire async annotation, don't block response
      const itemIdForAnnotation = (result[0] as Record<string, unknown>).id as string;
      (async () => {
        try {
          const aiNote = await generateArtifactAnnotation(title, note || "");
          // Find or create the Muse system user ID
          const museUser = await queryDB(
            `SELECT id FROM users WHERE email = 'muse@system.internal' LIMIT 1`
          );
          let museUserId: string;
          if (museUser.length === 0) {
            const created = await queryDB(
              `INSERT INTO users (username, email) VALUES ('The Muse', 'muse@system.internal') RETURNING id`
            );
            museUserId = (created[0] as Record<string, unknown>).id as string;
          } else {
            museUserId = (museUser[0] as Record<string, unknown>).id as string;
          }
          await queryDB(
            `INSERT INTO item_annotations (item_id, user_id, annotation) VALUES ($1, $2, $3)`,
            itemIdForAnnotation,
            museUserId,
            aiNote
          );
          console.log(`[AI Observer] Annotated item ${itemIdForAnnotation}`);
        } catch (err) {
          console.error("[AI Observer] Failed to annotate item:", err);
        }
      })();

      return new Response(
        JSON.stringify({
          success: true,
          item: newItem,
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (e) {
      console.error("Error creating item:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
