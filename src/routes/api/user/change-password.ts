import { createFileRoute } from "@tanstack/react-router";
import {
  comparePassword,
  getSessionUser,
  hashPassword,
} from "../../../server/auth";
import { executeDB, queryDB } from "../../../server/db";

export const Route = createFileRoute("/api/user/change-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const userId = await getSessionUser(request);
        if (!userId) {
          return new Response("Unauthorized", { status: 401 });
        }

        if (userId === "__demo__") {
          return new Response("Demo users cannot change passwords.", {
            status: 403,
          });
        }

        try {
          const { oldPassword, newPassword } = await request.json();
          if (
            typeof oldPassword !== "string" ||
            typeof newPassword !== "string" ||
            !oldPassword ||
            !newPassword
          ) {
            return new Response("Missing password fields", { status: 400 });
          }

          if (newPassword.length < 8) {
            return new Response(
              "New password must be at least 8 characters",
              { status: 400 },
            );
          }

          const users = await queryDB<{ password_hash: string | null }>(
            "SELECT password_hash FROM users WHERE id = $1",
            userId,
          );
          const user = users[0];
          if (!user) {
            return new Response("User not found", { status: 404 });
          }

          if (
            !user.password_hash ||
            !await comparePassword(oldPassword, user.password_hash)
          ) {
            return new Response("Incorrect old password", { status: 403 });
          }

          await executeDB(
            "UPDATE users SET password_hash = $1 WHERE id = $2",
            await hashPassword(newPassword),
            userId,
          );

          return Response.json({ success: true });
        } catch (error) {
          console.error("Error changing password:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    },
  },
});
