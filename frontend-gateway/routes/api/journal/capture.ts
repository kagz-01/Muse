import { Handlers } from "$fresh/server.ts";
import { executeDB } from "../../../utils/db.ts";
import { getSessionUser } from "../../../utils/auth.ts";

// Helper to generate SHA-256 hash using Web Crypto API
async function generateHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const handler: Handlers = {
  async POST(req) {
    try {
      const userId = await getSessionUser(req);
      if (!userId) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await req.json();
      const { threadId, rawThought } = body;

      if (!threadId || !rawThought) {
        return new Response("Thread ID and Raw Thought are required", { status: 400 });
      }

      // Generate the cryptographic hash for future blockchain anchoring
      const blockchainHash = await generateHash(rawThought);

      // Insert into CockroachDB
      await executeDB(
        "INSERT INTO journal_entries (user_id, thread_id, raw_thought, blockchain_hash) VALUES ($1, $2, $3, $4)",
        userId, threadId, rawThought, blockchainHash
      );

      return new Response(JSON.stringify({ 
        success: true, 
        hash: blockchainHash 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    } catch (e) {
      console.error("Error capturing thought:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
