import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { queryDB } from "../../../utils/db.ts";
import { generateBlockchainHash } from "../../../utils/crypto.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const userId = await getSessionUser(req);
      if (!userId) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await req.json();
      const { rawThought, threadId } = body;

      if (!rawThought || rawThought.trim() === "") {
        return new Response("Journal entry content is required", { status: 400 });
      }

      // Generate the cryptographic hash for Web3 proof of thought
      const blockchainHash = await generateBlockchainHash(rawThought);

      let insertQuery = `
        INSERT INTO journal_entries (user_id, raw_thought, blockchain_hash) 
        VALUES ($1, $2, $3) RETURNING *
      `;
      let queryArgs: any[] = [userId, rawThought, blockchainHash];

      // If a threadId is provided, link the journal entry to the synthesized context
      if (threadId) {
        // First verify the thread belongs to a room the user owns
        const threadCheck = await queryDB(`
          SELECT t.id 
          FROM threads t
          JOIN rooms r ON t.room_id = r.id
          WHERE t.id = $1 AND r.user_id = $2
        `, threadId, userId);

        if (threadCheck.length === 0) {
          return new Response("Thread not found or unauthorized", { status: 404 });
        }

        insertQuery = `
          INSERT INTO journal_entries (user_id, thread_id, raw_thought, blockchain_hash) 
          VALUES ($1, $2, $3, $4) RETURNING *
        `;
        queryArgs = [userId, threadId, rawThought, blockchainHash];
      }

      const insertResult = await queryDB(insertQuery, ...queryArgs);

      return new Response(JSON.stringify({
        success: true,
        entry: insertResult[0],
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    } catch (e) {
      console.error("Error creating journal entry:", e);
      return new Response(`Internal Server Error: ${(e as Error).message}`, { status: 500 });
    }
  },
};
