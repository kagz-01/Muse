import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { executeDB, queryDB } from "../../../utils/db.ts";
import { synthesizeArtifacts } from "../../../utils/ai.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const userId = await getSessionUser(req);
      if (!userId) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await req.json();
      const { roomId } = body;

      if (!roomId) {
        return new Response("Room ID required", { status: 400 });
      }

      // Verify the room belongs to the user
      const roomCheck = await queryDB(
        "SELECT id FROM rooms WHERE id = $1 AND user_id = $2",
        roomId,
        userId,
      );
      if (roomCheck.length === 0) {
        return new Response("Room not found or unauthorized", { status: 404 });
      }

      // Fetch all artifacts for this room
      const artifacts = await queryDB(
        "SELECT id, type, unstructured_data FROM artifacts WHERE room_id = $1",
        roomId,
      );
      if (artifacts.length === 0) {
        return new Response("No artifacts found to synthesize", {
          status: 400,
        });
      }

      // Run through our new Deno LangChain AI Engine
      const aiBlueprint = await synthesizeArtifacts(artifacts);

      // Extract the artifact UUIDs
      const artifactIds = artifacts.map((a: any) => a.id);

      // Insert the new thread into the database
      const insertResult = await queryDB(
        `INSERT INTO threads (room_id, artifact_ids, ai_blueprint) 
         VALUES ($1, $2, $3) RETURNING *`,
        roomId,
        artifactIds,
        aiBlueprint,
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
      console.error("Error triggering synthesis:", e);
      return new Response(`Internal Server Error: ${(e as Error).message}`, {
        status: 500,
      });
    }
  },
};
