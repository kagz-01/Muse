import { createFileRoute } from "@tanstack/react-router";
import process from "node:process";
import { randomUUID } from "node:crypto";
import { executeDB, queryDB } from "../../../server/db";
import { hashToken } from "../../../server/crypto";

export const Route = createFileRoute("/api/auth/forgot-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { email } = await request.json();
          if (!email || typeof email !== "string") {
            return new Response("Email is required", { status: 400 });
          }

          const users = await queryDB<{
            id: string;
            username: string;
          }>(
            "SELECT id, username FROM users WHERE email = $1",
            email,
          );
          const user = users[0];
          if (!user) {
            return new Response("Reset link sent if email exists.", {
              status: 200,
            });
          }

          const resetToken = randomUUID();
          const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
          await executeDB(
            `UPDATE users
             SET reset_token_hash = $1, reset_token_expires_at = $2
             WHERE id = $3`,
            hashToken(resetToken),
            expiresAt.toISOString(),
            user.id,
          );

          const emailFrom = process.env.EMAIL_FROM || "noreply@muse.app";
          const resetLink = new URL("/reset-password", request.url);
          resetLink.searchParams.set("token", resetToken);
          resetLink.searchParams.set("email", email);

          const resendApiKey = process.env.RESEND_API_KEY;
          if (!resendApiKey) {
            console.log(`[MOCK PASSWORD RESET EMAIL] ${resetLink.toString()}`);
            return new Response("Reset link sent. Check your email.", {
              status: 200,
            });
          }

          const resendResponse = await fetch(
            "https://api.resend.com/emails",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: emailFrom,
                to: email,
                subject: "Reset your Muse password",
                html: `
                  <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 20px; background: #050505; color: #fff; border-radius: 8px; border: 1px solid #333;">
                    <h2 style="color: #fff; margin-top: 0; text-transform: uppercase; letter-spacing: 2px;">Muse Identity System</h2>
                    <p style="color: #aaa; font-size: 14px;">A password reset request was initiated for your account.</p>
                    <div style="margin: 30px 0;">
                      <a href="${resetLink}" style="background: #fff; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Reset Password</a>
                    </div>
                    <p style="color: #666; font-size: 12px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
                  </div>
                `,
              }),
            },
          );

          if (!resendResponse.ok) {
            console.error(
              "Resend API request failed:",
              resendResponse.status,
            );
            return new Response(
              "Failed to send email. Please try again later.",
              { status: 500 },
            );
          }

          return new Response("Reset link sent. Check your email.", {
            status: 200,
          });
        } catch (error) {
          console.error("Forgot password error:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    },
  },
});
