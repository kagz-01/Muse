import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { queryDB } from "../../../utils/db.ts";
import { authenticator } from "npm:otplib";

export const handler: Handlers = {
  async POST(req) {
    try {
      const userId = await getSessionUser(req);
      if (!userId) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await req.json();
      const { action, token } = body;

      // Action: "generate"
      // Generates a new 2FA secret and an otpauth URL for apps like Google Authenticator
      if (action === "generate") {
        const secret = authenticator.generateSecret();
        
        // Fetch user email to label the authenticator app
        const userRes = await queryDB("SELECT email FROM users WHERE id = $1", userId);
        const email = userRes[0]?.email || "user@muse.os";
        
        const otpauthUrl = authenticator.keyuri(email, "Muse OS", secret);

        return new Response(JSON.stringify({
          secret,
          otpauthUrl, // The frontend can use a library like qrcode to display this
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Action: "verify"
      // Verifies a user-provided code against a provided secret
      if (action === "verify") {
        const { secret } = body;
        if (!token || !secret) {
          return new Response("Token and secret are required for verification", { status: 400 });
        }

        const isValid = authenticator.verify({ token, secret });

        if (isValid) {
          // If valid, the user has successfully set up 2FA.
          // In production, we would save the secret to the `users` table and set `two_factor_enabled = true`.
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } else {
          return new Response("Invalid 2FA code", { status: 400 });
        }
      }

      return new Response("Invalid action", { status: 400 });

    } catch (e) {
      console.error("Error in 2FA endpoint:", e);
      return new Response(`Internal Server Error: ${(e as Error).message}`, { status: 500 });
    }
  },
};
