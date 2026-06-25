import { Handlers } from "$fresh/server.ts";
import {
  comparePassword,
  getSessionUser,
  hashPassword,
} from "../../../utils/auth.ts";
import { executeDB, queryDB } from "../../../utils/db.ts";

export const handler: Handlers = {
  async POST(req) {
    const userId = await getSessionUser(req);
    if (!userId || userId === "__demo__") {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const { oldPassword, newPassword } = await req.json();

      if (!oldPassword || !newPassword) {
        return new Response("Missing password fields", { status: 400 });
      }

      if (newPassword.length < 8) {
        return new Response("New password must be at least 8 characters", {
          status: 400,
        });
      }

      const result = await queryDB(
        "SELECT password_hash FROM users WHERE id = $1",
        userId,
      );
      if (result.length === 0) {
        return new Response("User not found", { status: 404 });
      }

      const userRow = result[0] as { password_hash: string };

      const isMatch = await comparePassword(oldPassword, userRow.password_hash);
      if (!isMatch) {
        return new Response("Incorrect old password", { status: 403 });
      }

      const newHash = await hashPassword(newPassword);
      await executeDB(
        "UPDATE users SET password_hash = $1 WHERE id = $2",
        newHash,
        userId,
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Error changing password:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
