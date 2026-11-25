/// <reference path="../../../types/fresh.d.ts" />

import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { executeDB, queryDB } from "../../../utils/db.ts";
import { generateBlockchainHash } from "../../../utils/crypto.ts";

export const handler: Handlers = {
  async PUT(req, ctx) {
    try {
      const userId = await getSessionUser(req);
      if (!userId || userId === "__demo__") {
        return new Response("Unauthorized", { status: 401 });
      }

      const entryId = ctx.params.id;
      if (!entryId) {
        return new Response("Entry ID required", { status: 400 });
      }

      const body = await req.json();
      const {
        rawThought,
        mood,
        tags,
        isFavorited,
        isPinned,
        isArchived,
        isPublic,
      } = body;

      // Verify ownership
      const checkResult = await queryDB(
        "SELECT id FROM journal_entries WHERE id = $1 AND user_id = $2",
        entryId,
        userId,
      );
      if (checkResult.length === 0) {
        return new Response("Not found or unauthorized", { status: 404 });
      }

      let updateQuery = "UPDATE journal_entries SET updated_at = NOW()";
      const args: unknown[] = [];
      let argIndex = 1;

      if (rawThought !== undefined) {
        // If content changes, regenerate hash
        const blockchainHash = await generateBlockchainHash(rawThought);
        updateQuery +=
          `, raw_thought = $${argIndex++}, blockchain_hash = $${argIndex++}`;
        args.push(rawThought, blockchainHash);
      }
      if (mood !== undefined) {
        updateQuery += `, mood = $${argIndex++}`;
        args.push(mood);
      }
      if (tags !== undefined) {
        updateQuery += `, tags = $${argIndex++}`;
        args.push(tags);
      }
      if (isFavorited !== undefined) {
        updateQuery += `, is_favorited = $${argIndex++}`;
        args.push(isFavorited);
      }
      if (isPinned !== undefined) {
        updateQuery += `, is_pinned = $${argIndex++}`;
        args.push(isPinned);
      }
      if (isArchived !== undefined) {
        updateQuery += `, is_archived = $${argIndex++}`;
        args.push(isArchived);
      }
      if (isPublic !== undefined) {
        updateQuery += `, is_public = $${argIndex++}`;
        args.push(isPublic);
      }

      updateQuery +=
        ` WHERE id = $${argIndex++} AND user_id = $${argIndex++} RETURNING *`;
      args.push(entryId, userId);

      const updateResult = await queryDB(updateQuery, ...args);

      return new Response(
        JSON.stringify({
          success: true,
          entry: updateResult[0],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (e) {
      console.error("Error updating journal entry:", e);
      return new Response(`Internal Server Error: ${(e as Error).message}`, {
        status: 500,
      });
    }
  },

  async DELETE(req, ctx) {
    try {
      const userId = await getSessionUser(req);
      if (!userId || userId === "__demo__") {
        return new Response("Unauthorized", { status: 401 });
      }

      const entryId = ctx.params.id;
      if (!entryId) {
        return new Response("Entry ID required", { status: 400 });
      }

      // Verify ownership and delete
      await executeDB(
        "DELETE FROM journal_entries WHERE id = $1 AND user_id = $2",
        entryId,
        userId,
      );

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (e) {
      console.error("Error deleting journal entry:", e);
      return new Response(`Internal Server Error: ${(e as Error).message}`, {
        status: 500,
      });
    }
  },
};
