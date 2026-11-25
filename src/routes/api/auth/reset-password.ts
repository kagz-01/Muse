import { createFileRoute } from "@tanstack/react-router";
import { executeDB, queryDB } from "../../../server/db";
import { hashToken } from "../../../server/crypto";
import { hashPassword } from "../../../server/auth";

export const Route = createFileRoute("/api/auth/reset-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { email, token, newPassword } = body;
          if (
            typeof email !== "string" ||
            typeof token !== "string" ||
            typeof newPassword !== "string" ||
            !email ||
            !token ||
            !newPassword
          ) {
            return new Response("Missing required fields", { status: 400 });
          }

          const users = await queryDB<{
            id: string;
            reset_token_expires_at: Date | null;
          }>(
            `SELECT id, reset_token_expires_at
             FROM users
             WHERE email = $1 AND reset_token_hash = $2`,
            email,
            hashToken(token),
          );
          const user = users[0];
          if (!user) {
            return new Response("Invalid or expired reset token.", {
              status: 400,
            });
          }

          if (
            !user.reset_token_expires_at ||
            new Date() > new Date(user.reset_token_expires_at)
          ) {
            return new Response("Reset token has expired.", { status: 400 });
          }

          await executeDB(
            `UPDATE users
             SET password_hash = $1,
                 reset_token_hash = NULL,
                 reset_token_expires_at = NULL
             WHERE id = $2`,
            await hashPassword(newPassword),
            user.id,
          );

          return new Response("Password has been successfully reset.", {
            status: 200,
          });
        } catch (error) {
          console.error("Reset password error:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    },
  },
});
