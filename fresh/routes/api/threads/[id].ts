/// <reference path="../../../types/fresh.d.ts" />

import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { executeDB, queryDB } from "../../../utils/db.ts";

export const handler: Handlers = {
  async PUT(req, ctx) {
    const userId = await getSessionUser(req);
    if (!userId || userId === "__demo__") {
      return new Response("Unauthorized", { status: 401 });
    }

    const threadId = ctx.params.id;

    // Verify ownership via room
    const check = await queryDB(
      `SELECT t.id FROM threads t
       JOIN rooms r ON t.room_id = r.id
       WHERE t.id = $1 AND r.user_id = $2`,
      threadId,
      userId,
    );
    if (check.length === 0) {
      return new Response("Not found or unauthorized", { status: 404 });
    }

    try {
      const body = await req.json();

      const fieldMap: Record<string, string> = {
        title: "title",
        description: "description",
        mood: "mood",
        format: "format",
        depth: "depth",
        theme: "theme",
        thesis: "thesis",
        coverImage: "cover_image",
        isPublic: "is_public",
        isFavorited: "is_favorited",
        isPinned: "is_pinned",
        isArchived: "is_archived",
        isVault: "is_vault",
        itemIds: "artifact_ids",
        sourceRoomIds: "source_room_ids",
        dialogueLayers: "dialogue_layers",
        resonanceMetrics: "resonance_metrics",
        customStyling: "custom_styling",
        synthesis: "synthesis",
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

      args.push(threadId);
      const updateQuery = `UPDATE threads SET ${
        setClauses.join(", ")
      } WHERE id = $${argIndex} RETURNING *`;

      const result = await queryDB(updateQuery, ...args);
      const row = result[0] as Record<string, unknown>;

      const thread = {
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
      };

      return new Response(JSON.stringify({ success: true, thread }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Error updating thread:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },

  async DELETE(req, ctx) {
    const userId = await getSessionUser(req);
    if (!userId || userId === "__demo__") {
      return new Response("Unauthorized", { status: 401 });
    }

    const threadId = ctx.params.id;

    // Verify ownership via room
    const check = await queryDB(
      `SELECT t.id FROM threads t
       JOIN rooms r ON t.room_id = r.id
       WHERE t.id = $1 AND r.user_id = $2`,
      threadId,
      userId,
    );
    if (check.length === 0) {
      return new Response("Not found or unauthorized", { status: 404 });
    }

    try {
      // Clean up journal entries linked to this thread
      await executeDB(
        "DELETE FROM journal_entries WHERE thread_id = $1",
        threadId,
      );
      await executeDB("DELETE FROM threads WHERE id = $1", threadId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Error deleting thread:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
