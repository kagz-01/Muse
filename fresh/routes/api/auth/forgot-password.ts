/// <reference path="../../../types/fresh.d.ts" />

import { Handlers } from "$fresh/server.ts";
import { executeDB, queryDB } from "../../../utils/db.ts";
import { encodeHex } from "https://deno.land/std@0.214.0/encoding/hex.ts";

// Utility to hash the token before storing
async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return encodeHex(hashBuffer);
}

export const handler: Handlers = {
  async POST(req) {
    try {
      const { email } = await req.json();

      if (!email) {
        return new Response("Email is required", { status: 400 });
      }

      // 1. Find user by email
      const users = await queryDB(
        "SELECT id, username FROM users WHERE email = $1",
        email,
      );

      // We still return 200 even if user doesn't exist to prevent email enumeration
      if (users.length === 0) {
        return new Response("Reset link sent if email exists.", {
          status: 200,
        });
      }

      const user = users[0] as { id: string; username: string };

      // 2. Generate secure token
      const resetToken = crypto.randomUUID();
      const tokenHash = await hashToken(resetToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // 3. Store hashed token in DB
      await executeDB(
        "UPDATE users SET reset_token_hash = $1, reset_token_expires_at = $2 WHERE id = $3",
        tokenHash,
        expiresAt.toISOString(),
        user.id,
      );

      // 4. Send email via Resend API
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      const emailFrom = Deno.env.get("EMAIL_FROM") || "noreply@muse.app";
      const origin = new URL(req.url).origin;
      const resetLink = `${origin}/reset-password?token=${resetToken}&email=${
        encodeURIComponent(email)
      }`;

      if (resendApiKey) {
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
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
        });

        if (!resendResponse.ok) {
          const errorText = await resendResponse.text();
          console.error("Resend API error:", errorText);
          // Return generic error to UI
          return new Response("Failed to send email. Please try again later.", {
            status: 500,
          });
        }
      } else {
        // Fallback for local testing without API key
        console.log("-----------------------------------------");
        console.log(`[MOCK EMAIL to ${email}]`);
        console.log(`Subject: Reset your Muse password`);
        console.log(`Reset Link: ${resetLink}`);
        console.log("-----------------------------------------");
      }

      return new Response("Reset link sent. Check your email.", {
        status: 200,
      });
    } catch (e) {
      console.error("Forgot password error:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
