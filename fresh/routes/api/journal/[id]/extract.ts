/// <reference path="../../../../types/fresh.d.ts" />

import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../../utils/auth.ts";
import { executeDB, queryDB } from "../../../../utils/db.ts";
import { extractPublicSpark } from "../../../../utils/ai.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    try {
      const userId = await getSessionUser(req);
      if (!userId) {
        return new Response("Unauthorized", { status: 401 });
      }

      const journalId = ctx.params.id;
      if (!journalId) {
        return new Response("Journal ID required", { status: 400 });
      }

      // 1. Fetch the journal entry to ensure ownership and get the body
      const journalCheck = await queryDB(
        "SELECT id, raw_thought FROM journal_entries WHERE id = $1 AND user_id = $2",
        journalId,
        userId,
      );

      if (journalCheck.length === 0) {
        return new Response("Journal entry not found or unauthorized", {
          status: 404,
        });
      }

      const rawThought = (journalCheck[0] as Record<string, unknown>).raw_thought as string;

      if (!rawThought || rawThought.length < 10) {
        return new Response("Journal entry too short to extract a spark", {
          status: 400,
        });
      }

      // 2. Extract a non-PII spark using LLM
      const spark = await extractPublicSpark(rawThought);

      // 3. Save the spark to the items table as a public node
      // We set room_id to NULL because it's a floating network spark
      const insertResult = await queryDB(
        `INSERT INTO items (user_id, room_id, title, note, is_public) 
         VALUES ($1, NULL, $2, $3, true) RETURNING *`,
        userId,
        "Spark of Insight",
        spark,
      );

      return new Response(
        JSON.stringify({
          success: true,
          spark: insertResult[0],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (e) {
      console.error("Error extracting spark:", e);
      return new Response(`Internal Server Error: ${(e as Error).message}`, {
        status: 500,
      });
    }
  },
};
