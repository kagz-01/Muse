import { Handlers } from "$fresh/server.ts";
import { queryDB } from "../../../utils/db.ts";
import {
  comparePassword,
  createSession,
  setSessionCookie,
} from "../../../utils/auth.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const form = await req.formData();
      const email = form.get("email")?.toString();
      const password = form.get("password")?.toString();

      if (!email || !password) {
        return new Response("Missing fields", { status: 400 });
      }

      // Fetch user
      const users = await queryDB(
        "SELECT id, password_hash FROM users WHERE email = $1",
        email,
      );
      if (users.length === 0) {
        return new Response("Invalid email or password", { status: 401 });
      }

      const user = users[0] as Record<string, unknown>;

      // Verify password
      if (!user.password_hash) {
        return new Response(
          "Please login with your connected provider (e.g., Google)",
          { status: 401 },
        );
      }

      const isValid = await comparePassword(
        password,
        user.password_hash as string,
      );
      if (!isValid) {
        return new Response("Invalid email or password", { status: 401 });
      }

      const userId = user.id as string;

      // Create session
      const sessionId = await createSession(userId);

      // Set cookie and redirect
      const headers = new Headers();
      setSessionCookie(headers, sessionId);
      headers.set("location", "/dashboard");

      return new Response(null, {
        status: 303,
        headers,
      });
    } catch (e) {
      console.error(e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
