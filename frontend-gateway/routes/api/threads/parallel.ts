import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { executeDB, queryDB } from "../../../utils/db.ts";
import { synthesizeParallel } from "../../../utils/ai.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const userId = await getSessionUser(req);
      if (!userId) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await req.json();
      const { partnerId } = body;

      if (!partnerId) {
        return new Response("Partner ID required", { status: 400 });
      }

      // Fetch User A
      const userARecords = await queryDB(
        "SELECT id, name FROM users WHERE id = $1",
        userId,
      );
      if (userARecords.length === 0) {
        return new Response("User not found", { status: 404 });
      }
      const userA = userARecords[0] as { id: string; name: string };

      // Fetch User B (Partner)
      const userBRecords = await queryDB(
        "SELECT id, name FROM users WHERE id = $1",
        partnerId,
      );
      if (userBRecords.length === 0) {
        return new Response("Partner not found", { status: 404 });
      }
      const userB = userBRecords[0] as { id: string; name: string };

      // Fetch User A Data (Public items)
      const userAItems = await queryDB(
        "SELECT title, note, type FROM items WHERE user_id = $1 AND is_public = true LIMIT 50",
        userId,
      );
      const userAData = userAItems.map((item: any) => `${item.title}: ${item.note || ""}`).join("\n");

      // Fetch User B Data (Public items)
      const userBItems = await queryDB(
        "SELECT title, note, type FROM items WHERE user_id = $1 AND is_public = true LIMIT 50",
        partnerId,
      );
      const userBData = userBItems.map((item: any) => `${item.title}: ${item.note || ""}`).join("\n");

      if (!userAData && !userBData) {
        return new Response("Not enough public data from either user to synthesize", {
          status: 400,
        });
      }

      // Run Parallel Synthesis
      const aiBlueprint = await synthesizeParallel(
        userA.name,
        userAData,
        userB.name,
        userBData,
      );

      const title = `Parallel Synthesis: ${userA.name} & ${userB.name}`;

      // Insert the new parallel thread into the database
      const insertResult = await queryDB(
        `INSERT INTO threads (user_id, partner_id, title, ai_blueprint, description) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        userId,
        partnerId,
        title,
        JSON.stringify(aiBlueprint),
        aiBlueprint.summary,
      );

      return new Response(
        JSON.stringify({
          success: true,
          thread: insertResult[0],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (e) {
      console.error("Error triggering parallel synthesis:", e);
      return new Response(`Internal Server Error: ${(e as Error).message}`, {
        status: 500,
      });
    }
  },
};
