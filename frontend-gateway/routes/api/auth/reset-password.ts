import { Handlers } from "$fresh/server.ts";
import { executeDB, queryDB } from "../../../utils/db.ts";
import { encodeHex } from "https://deno.land/std@0.214.0/encoding/hex.ts";
import { hashPassword } from "../../../utils/auth.ts";

async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return encodeHex(hashBuffer);
}

export const handler: Handlers = {
  async POST(req) {
    try {
      const { email, token, newPassword } = await req.json();

      if (!email || !token || !newPassword) {
        return new Response("Missing required fields", { status: 400 });
      }

      // Hash the provided token to compare with DB
      const tokenHash = await hashToken(token);

      // Verify token
      const users = await queryDB(
        "SELECT id, reset_token_expires_at FROM users WHERE email = $1 AND reset_token_hash = $2",
        email,
        tokenHash,
      );

      if (users.length === 0) {
        return new Response("Invalid or expired reset token.", { status: 400 });
      }

      const user = users[0] as { id: string; reset_token_expires_at: Date };

      // Check expiration
      if (new Date() > new Date(user.reset_token_expires_at)) {
        return new Response("Reset token has expired.", { status: 400 });
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password and clear reset token
      await executeDB(
        "UPDATE users SET password_hash = $1, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = $2",
        newPasswordHash,
        user.id,
      );

      return new Response("Password has been successfully reset.", {
        status: 200,
      });
    } catch (e) {
      console.error("Reset password error:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
