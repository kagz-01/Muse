import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { executeDB, queryDB } from "../../../utils/db.ts";

export const handler: Handlers = {
  async GET(req) {
    const userId = await getSessionUser(req);
    if (!userId || userId === "__demo__") {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const result = await queryDB(
        "SELECT name, bio, avatar_url, preferences FROM users WHERE id = $1",
        userId,
      );

      if (result.length === 0) {
        return new Response("User not found", { status: 404 });
      }

      const userRow = result[0] as {
        name: string | null;
        bio: string | null;
        avatar_url: string | null;
        preferences: unknown;
      };

      return new Response(
        JSON.stringify({
          name: userRow.name || "",
          bio: userRow.bio || "",
          avatarUrl: userRow.avatar_url || "",
          preferences: userRow.preferences || {},
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (e) {
      console.error("Error fetching settings:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },

  async PUT(req) {
    const userId = await getSessionUser(req);
    if (!userId || userId === "__demo__") {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const data = await req.json();
      const { name, bio, avatarUrl, preferences } = data;

      await executeDB(
        "UPDATE users SET name = $1, bio = $2, avatar_url = $3, preferences = $4 WHERE id = $5",
        name || "",
        bio || "",
        avatarUrl || "",
        preferences || {},
        userId,
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Error saving settings:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
