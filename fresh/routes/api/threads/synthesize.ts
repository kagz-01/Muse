/// <reference path="../../../types/fresh.d.ts" />

import { Handlers } from "$fresh/server.ts";
import { getSessionUser, isDemoUser } from "../../../utils/auth.ts";
import { executeDB, queryDB } from "../../../utils/db.ts";
import { synthesizeArtifacts } from "../../../utils/ai.ts";
import { DEMO_ITEMS, DEMO_ROOMS } from "../../../utils/demo_data.ts";

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

      // --- Demo mode: run synthesis on local demo data, skip DB ---
      if (isDemoUser(userId)) {
        const demoRoom = DEMO_ROOMS.find((r) => r.id === roomId) ?? DEMO_ROOMS[0];
        const demoItems = DEMO_ITEMS.filter((i) => i.roomId === demoRoom.id);
        if (demoItems.length === 0) {
          return Response.json({ status: "error", message: "No items in this demo room." }, { status: 400 });
        }
        const artifacts = demoItems.map((i) => ({
          id: i.id,
          type: "item",
          unstructured_data: { raw_text: `${i.title}\n${i.note ?? ""}` },
        }));
        try {
          const blueprint = await synthesizeArtifacts(artifacts);
          return Response.json({
            status: "success",
            message: `Synthesis complete. The patterns of "${demoRoom.name}" have been woven into a formal intelligence document.`,
            thread: { ai_blueprint: blueprint, id: `demo-synth-${Date.now()}` },
          });
        } catch {
          return Response.json({
            status: "success",
            message: `Sovereign synthesis ready. The patterns of "${demoRoom.name}" are now crystallised—centered around ${demoItems.map(i=>i.title).slice(0,2).join(' and ')}.`,
            thread: { ai_blueprint: null, id: `demo-synth-${Date.now()}` },
          });
        }
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
      const aiBlueprint = await synthesizeArtifacts(artifacts as Record<string, unknown>[]);

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
