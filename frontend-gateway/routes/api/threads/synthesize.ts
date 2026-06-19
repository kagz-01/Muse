import { Handlers } from "$fresh/server.ts";
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
      const { roomId } = body;

      if (!roomId) {
        return new Response("Room ID required", { status: 400 });
      }

      // Forward request to Python AI Engine
      const aiResponse = await fetch(`${AI_ENGINE_URL}/api/synthesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId }),
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        return new Response(`AI Engine Error: ${errText}`, { status: aiResponse.status });
      }

      const result = await aiResponse.json();

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    } catch (e) {
      console.error("Error triggering synthesis:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
