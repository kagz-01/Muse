import { createFileRoute } from "@tanstack/react-router";
import {
  createSession,
  hashPassword,
  setSessionCookie,
} from "../../../server/auth";
import { executeDB, queryDB } from "../../../server/db";

export const Route = createFileRoute("/api/auth/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const form = await request.formData();
          const email = form.get("email")?.toString();
          const name = form.get("name")?.toString()?.trim();
          const username = form.get("username")?.toString();
          const password = form.get("password")?.toString();

          if (!email || !username || !password) {
            return new Response("Missing fields", { status: 400 });
          }

          const existingEmail = await queryDB<{ id: string }>(
            "SELECT id FROM users WHERE email = $1",
            email,
          );
          if (existingEmail.length > 0) {
            return new Response("Email is already used", { status: 409 });
          }

          const existingUsername = await queryDB<{ id: string }>(
            "SELECT id FROM users WHERE username = $1",
            username,
          );
          if (existingUsername.length > 0) {
            return new Response("Username is already taken", { status: 409 });
          }

          const passwordHash = await hashPassword(password);
          const result = await executeDB(
            `INSERT INTO users (email, username, name, password_hash)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            email,
            username,
            name || username,
            passwordHash,
          );
          const userId = result.rows[0]?.id as string | undefined;
          if (!userId) {
            throw new Error("User insert did not return an id");
          }

          const sessionId = await createSession(userId);
          const headers = new Headers();
          setSessionCookie(headers, sessionId);
          headers.set("location", "/dashboard");
          return new Response(null, { status: 303, headers });
        } catch (error) {
          console.error("Registration failed:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    },
  },
});
