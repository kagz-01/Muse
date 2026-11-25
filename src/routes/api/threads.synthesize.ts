import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../server/auth";
import { executeDB, queryDB } from "../../server/db";
import { hasRoomAccess } from "../../server/rooms";
import { AI_ENGINE_URL } from "../../server/services";

export const Route = createFileRoute("/api/threads/synthesize")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const userId = await getSessionUser(request);
        if (!userId) return new Response("Unauthorized", { status: 401 });
        if (isDemoUser(userId)) {
          return new Response("Demo users cannot synthesize rooms", {
            status: 403,
          });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        if (
          typeof body !== "object" || body === null || Array.isArray(body)
        ) {
          return new Response("Invalid request body", { status: 400 });
        }
        const requestBody = body as Record<string, unknown>;

        const roomId = typeof requestBody.roomId === "string"
          ? requestBody.roomId
          : "";
        if (roomId) {
          try {
            if (!await hasRoomAccess(userId, roomId)) {
              return new Response("Room not found", { status: 404 });
            }

            const artifacts = await queryDB(
              "SELECT id FROM artifacts WHERE room_id = $1 LIMIT 1",
              roomId,
            );
            if (!artifacts.length) {
              return new Response("No artifacts found to synthesize", {
                status: 400,
              });
            }

            const response = await fetch(`${AI_ENGINE_URL}/api/synthesize`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ room_id: roomId }),
            });
            const responseBody = await response.text();
            if (!response.ok) {
              console.error(
                `AI synthesis service returned ${response.status}: ${responseBody}`,
              );
              return new Response(responseBody, { status: 502 });
            }
            return new Response(responseBody, {
              status: 200,
              headers: {
                "Content-Type": response.headers.get("content-type") ??
                  "application/json",
              },
            });
          } catch (error) {
            console.error("Room synthesis request failed:", error);
            return new Response("Unable to synthesize room", { status: 502 });
          }
        }

        const threadId = typeof requestBody.threadId === "string"
          ? requestBody.threadId
          : "";
        if (!threadId) {
          return new Response("roomId required", { status: 400 });
        }

        try {
          const owned = await queryDB(
            `SELECT t.id FROM threads t
             LEFT JOIN rooms r ON r.id = t.room_id
             LEFT JOIN room_collaborators rc ON rc.room_id = r.id
             WHERE t.id = $1
               AND (t.user_id = $2 OR r.user_id = $2 OR rc.user_id = $2)
             LIMIT 1`,
            threadId,
            userId,
          );
          if (!owned[0]) return new Response("Not found", { status: 404 });

          const notes = typeof requestBody.notes === "string"
            ? requestBody.notes.trim()
            : "";
          const synthesis = {
            summary: notes ||
              "Muse synthesis generated from connected artifacts.",
            updatedAt: new Date().toISOString(),
          };
          await executeDB(
            `UPDATE threads
             SET synthesis = $1::jsonb,
                 synthesis_score = GREATEST(COALESCE(synthesis_score, 0), 75),
                 updated_at = NOW()
             WHERE id = $2`,
            JSON.stringify(synthesis),
            threadId,
          );
          return Response.json({ success: true, synthesis });
        } catch (error) {
          console.error("Thread synthesis update failed:", error);
          return new Response("Unable to update thread synthesis", {
            status: 500,
          });
        }
      },
    },
  },
});
