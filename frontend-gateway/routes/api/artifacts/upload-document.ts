import { Handlers } from "$fresh/server.ts";
import { executeDB } from "../../../utils/db.ts";
import { getSessionUser } from "../../../utils/auth.ts";

const AI_ENGINE_URL = Deno.env.get("AI_ENGINE_URL") || "http://127.0.0.1:8000";

export const handler: Handlers = {
  async POST(req) {
    try {
      const userId = await getSessionUser(req);
      if (!userId) {
        return new Response("Unauthorized", { status: 401 });
      }

      const form = await req.formData();
      const roomId = form.get("roomId")?.toString();
      const file = form.get("file") as File;

      if (!roomId || !file) {
        return new Response("Room ID and File required", { status: 400 });
      }

      // 1. Forward multipart/form-data to Python AI Engine
      const proxyForm = new FormData();
      proxyForm.append("file", file);

      const aiResponse = await fetch(`${AI_ENGINE_URL}/api/upload-document`, {
        method: "POST",
        body: proxyForm, // fetch automatically sets the correct multipart boundary
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        return new Response(`AI Engine Error: ${errText}`, { status: aiResponse.status });
      }

      const scrapedData = await aiResponse.json();
      
      // Determine type based on extension
      const fileName = file.name.toLowerCase();
      let type = "document";
      if (fileName.endsWith(".pdf")) type = "pdf";
      if (fileName.endsWith(".docx")) type = "word";
      if (fileName.endsWith(".xlsx") || fileName.endsWith(".csv")) type = "spreadsheet";

      // 2. Insert into CockroachDB JSONB
      await executeDB(
        "INSERT INTO artifacts (room_id, type, source_url, unstructured_data) VALUES ($1, $2, $3, $4)",
        roomId, type, file.name, JSON.stringify(scrapedData)
      );

      return new Response(JSON.stringify({ success: true, type }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    } catch (e) {
      console.error("Error uploading document:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
