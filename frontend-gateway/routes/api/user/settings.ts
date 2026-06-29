import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { executeDB, queryDB } from "../../../utils/db.ts";

export const handler: Handlers = {
  async GET(req) {
    const userId = await getSessionUser(req);
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (userId === "__demo__") {
      const { DEMO_USER } = await import("../../../utils/demo_data.ts");
      return new Response(
        JSON.stringify({
          name: DEMO_USER.name || "",
          bio: DEMO_USER.bio || "",
          avatarUrl: DEMO_USER.avatarUrl || "",
          preferences: {},
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
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
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (userId === "__demo__") {
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const data = await req.json();
      const {
        name,
        bio,
        avatarUrl,
        username,
        email,
        preferences,
      } = data;

      if (username) {
        const conflict = await queryDB(
          "SELECT id FROM users WHERE username = $1 AND id != $2",
          username,
          userId,
        );
        if (conflict.length > 0) {
          return new Response("Username already taken", { status: 409 });
        }
      }

      if (email) {
        const conflict = await queryDB(
          "SELECT id FROM users WHERE email = $1 AND id != $2",
          email,
          userId,
        );
        if (conflict.length > 0) {
          return new Response("Email already taken", { status: 409 });
        }
      }

      const updates: string[] = [];
      const values: unknown[] = [];

      if (name !== undefined) {
        updates.push(`name = $${updates.length + 1}`);
        values.push(name || "");
      }
      if (bio !== undefined) {
        updates.push(`bio = $${updates.length + 1}`);
        values.push(bio || "");
      }
      if (avatarUrl !== undefined) {
        updates.push(`avatar_url = $${updates.length + 1}`);
        values.push(avatarUrl || "");
      }
      if (username !== undefined) {
        updates.push(`username = $${updates.length + 1}`);
        values.push(username || "");
      }
      if (email !== undefined) {
        updates.push(`email = $${updates.length + 1}`);
        values.push(email || "");
      }
      if (preferences !== undefined) {
        updates.push(`preferences = $${updates.length + 1}`);
        values.push(preferences || {});
      }

      if (updates.length === 0) {
        return new Response("No valid fields to update", { status: 400 });
      }

      values.push(userId);
      const query = `UPDATE users SET ${updates.join(", ")} WHERE id = $${
        values.length}`;
      await executeDB(query, ...values);

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Error saving settings:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
