import { Handlers } from "$fresh/server.ts";
import { executeDB, queryDB } from "../../../utils/db.ts";
import {
  createSession,
  hashPassword,
  setSessionCookie,
} from "../../../utils/auth.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const form = await req.formData();
      const email = form.get("email")?.toString();
      const username = form.get("username")?.toString();
      const password = form.get("password")?.toString();

      if (!email || !username || !password) {
        return new Response("Missing fields", { status: 400 });
      }

      // Check if user already exists
      const existing = await queryDB(
        "SELECT id FROM users WHERE email = $1 OR username = $2",
        email,
        username,
      );
      if (existing.length > 0) {
        return new Response("Email or Username already taken", { status: 409 });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Insert new user
      const result = await executeDB(
        "INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id",
        email,
        username,
        hashedPassword,
      );

      const row = result.rows[0] as Record<string, unknown>;
      const userId = row.id as string;

      // Create session
      const sessionId = await createSession(userId);

      // Set cookie and redirect to dashboard
      const headers = new Headers();
      setSessionCookie(headers, sessionId);
      headers.set("location", "/dashboard"); // Assuming you have a /dashboard route

      return new Response(null, {
        status: 303, // See Other (Redirect)
        headers,
      });
    } catch (e) {
      console.error(e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
