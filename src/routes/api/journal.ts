import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../server/auth";
import { queryDB } from "../../server/db";
import { listJournalEntries, mapJournalRow } from "../../server/journal";
import { generateBlockchainHash } from "../../server/crypto";

export const Route = createFileRoute("/api/journal")({
  server: { handlers: {
    GET: async ({ request }) => {
      const userId = await getSessionUser(request);
      if (!userId) return new Response("Unauthorized", { status: 401 });
      if (isDemoUser(userId)) return Response.json([]);
      return Response.json(await listJournalEntries(userId));
    },
    POST: async ({ request }) => {
      const userId = await getSessionUser(request);
      if (!userId) return new Response("Unauthorized", { status: 401 });
      if (isDemoUser(userId)) return new Response("Demo users cannot create journal entries", { status: 403 });
      try {
        const body = await request.json() as Record<string, unknown>;
        const rawThought = typeof body.rawThought === "string" ? body.rawThought.trim() : "";
        if (!rawThought) return new Response("Journal entry content is required", { status: 400 });
        const blockchainHash = await generateBlockchainHash(rawThought);
        const threadId = typeof body.threadId === "string" ? body.threadId : null;
        if (threadId) {
          const thread = await queryDB("SELECT t.id FROM threads t JOIN rooms r ON t.room_id=r.id WHERE t.id=$1 AND r.user_id=$2", threadId, userId);
          if (!thread[0]) return new Response("Thread not found or unauthorized", { status: 404 });
        }
        const rows = await queryDB(
          `INSERT INTO journal_entries (user_id,thread_id,raw_thought,blockchain_hash,mood,tags,is_favorited,is_pinned,is_archived,is_public,synthesized_context)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
          userId, threadId, rawThought, blockchainHash,
          typeof body.mood === "string" ? body.mood : "reflective",
          Array.isArray(body.tags) ? body.tags : [], body.isFavorited === true,
          body.isPinned === true, body.isArchived === true, body.isPublic === true,
          body.synthesizedContext ?? null,
        );
        return Response.json({ success: true, entry: mapJournalRow(rows[0]) }, { status: 201 });
      } catch (error) {
        console.error("Journal creation failed:", error);
        return new Response("Internal Server Error", { status: 500 });
      }
    },
  }},
});
