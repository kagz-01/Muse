import { createFileRoute } from "@tanstack/react-router";
import { authenticator } from "otplib";
import { getSessionUser } from "../../../server/auth";
import { queryDB } from "../../../server/db";

export const Route = createFileRoute("/api/auth/2fa")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const userId = await getSessionUser(request);
          if (!userId) {
            return new Response("Unauthorized", { status: 401 });
          }

          const { action, token, secret } = await request.json();
          if (action === "generate") {
            const newSecret = authenticator.generateSecret();
            const users = await queryDB<{ email: string }>(
              "SELECT email FROM users WHERE id = $1",
              userId,
            );
            const email = users[0]?.email ?? "user@muse.os";

            return Response.json({
              secret: newSecret,
              otpauthUrl: authenticator.keyuri(email, "Muse OS", newSecret),
            });
          }

          if (action === "verify") {
            if (
              typeof token !== "string" ||
              typeof secret !== "string" ||
              !token ||
              !secret
            ) {
              return new Response(
                "Token and secret are required for verification",
                { status: 400 },
              );
            }

            if (!authenticator.check(token, secret)) {
              return new Response("Invalid 2FA code", { status: 400 });
            }

            return Response.json({ success: true });
          }

          return new Response("Invalid action", { status: 400 });
        } catch (error) {
          console.error("Two-factor request failed:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    },
  },
});
