import { Handlers } from "$fresh/server.ts";
import { executeDB } from "../../../utils/db.ts";
import { getSessionUser } from "../../../utils/auth.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      // Authenticate user via Deno KV session
      const userId = await getSessionUser(req);
      if (!userId) {
        return new Response("Unauthorized", { status: 401 });
      }

      const form = await req.formData();
      const title = form.get("title")?.toString();
      const description = form.get("description")?.toString() || null;
      const themeColor = form.get("theme_color")?.toString() || "#ffffff";
      const tagsString = form.get("tags")?.toString() || "";
      
      if (!title) {
        return new Response("Title is required", { status: 400 });
      }

      // Process tags into an array
      const tags = tagsString
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Insert into CockroachDB
      const result = await executeDB(
        "INSERT INTO rooms (user_id, title, description, theme_color, tags) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        userId, title, description, themeColor, tags
      );

      const newRoomId = (result.rows[0] as Record<string, unknown>).id as string;

      // Successful creation, the frontend modal expects a 303 redirect or 200 OK.
      // Since it's doing a manual fetch, we can return 200 JSON.
      return new Response(JSON.stringify({ id: newRoomId }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });

    } catch (e) {
      console.error("Error creating room:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
