import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../../server/auth";
import { executeDB } from "../../../server/db";
import { hasRoomAccess } from "../../../server/rooms";
import { AI_ENGINE_URL } from "../../../server/services";

export const Route = createFileRoute("/api/artifacts/ingest-url")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const userId = await getSessionUser(request);
        if (!userId) return new Response("Unauthorized", { status: 401 });
        if (isDemoUser(userId)) {
          return new Response("Demo users cannot ingest URLs", { status: 403 });
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
        const url = typeof requestBody.url === "string"
          ? requestBody.url.trim()
          : "";
        const roomId = typeof requestBody.roomId === "string"
          ? requestBody.roomId
          : "";
        if (!url || !roomId) {
          return new Response("URL and Room ID required", { status: 400 });
        }
        try {
          const parsedUrl = new URL(url);
          if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            return new Response("Only HTTP and HTTPS URLs are supported", {
              status: 400,
            });
          }
          if (!await hasRoomAccess(userId, roomId)) {
            return new Response("Room not found", { status: 404 });
          }

          const response = await fetch(`${AI_ENGINE_URL}/api/scrape`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });
          if (!response.ok) {
            return new Response(`AI Engine Error: ${await response.text()}`, {
              status: response.status,
            });
          }

          const scraped = await response.json() as Record<string, unknown>;
          const type = scraped.source === "youtube"
            ? "youtube"
            : scraped.source === "social"
            ? "social"
            : "url";
          await executeDB(
            `INSERT INTO artifacts (room_id, type, source_url, unstructured_data)
             VALUES ($1, $2, $3, $4)`,
            roomId,
            type,
            url,
            JSON.stringify(scraped),
          );
          return Response.json({ success: true, type });
        } catch (error) {
          console.error("URL ingestion failed:", error);
          return new Response("Unable to ingest URL", { status: 500 });
        }
      },
    },
  },
});
