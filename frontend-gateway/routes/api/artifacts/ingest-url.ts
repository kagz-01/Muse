import { Handlers } from "$fresh/server.ts";
import { executeDB } from "../../../utils/db.ts";
import { getSessionUser } from "../../../utils/auth.ts";

const AI_ENGINE_URL = Deno.env.get("AI_ENGINE_URL") || "http://127.0.0.1:8001";

export const handler: Handlers = {
  async POST(req) {
    try {
      const userId = await getSessionUser(req);
      if (!userId) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await req.json();
      const { url, roomId } = body;

      if (!url || !roomId) {
        return new Response("URL and Room ID required", { status: 400 });
      }

      // 1. Send URL to Python AI Engine
      const aiResponse = await fetch(`${AI_ENGINE_URL}/api/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        return new Response(`AI Engine Error: ${errText}`, {
          status: aiResponse.status,
        });
      }

      const scrapedData = await aiResponse.json();

      // Determine type roughly based on the response
      const type = scrapedData.source === "youtube"
        ? "youtube"
        : scrapedData.source === "social"
        ? "social"
        : "url";

      // 2. Insert the scraped JSON directly into the CockroachDB JSONB column
      await executeDB(
        "INSERT INTO artifacts (room_id, type, source_url, unstructured_data) VALUES ($1, $2, $3, $4)",
        roomId,
        type,
        url,
        JSON.stringify(scrapedData),
      );

      return new Response(JSON.stringify({ success: true, type }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Error ingesting URL:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
