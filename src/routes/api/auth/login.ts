import { createFileRoute } from "@tanstack/react-router";
import {
  comparePassword,
  createSession,
  setSessionCookie,
} from "../../../server/auth";
import { queryDB } from "../../../server/db";

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const form = await request.formData();
          const email = form.get("email")?.toString();
          const password = form.get("password")?.toString();

          if (!email || !password) {
            return new Response("Missing fields", { status: 400 });
          }

          const users = await queryDB<{
            id: string;
            password_hash: string | null;
          }>(
            "SELECT id, password_hash FROM users WHERE email = $1",
            email,
          );
          const user = users[0];
          if (!user) {
            return new Response("Invalid email or password", { status: 401 });
          }

          if (!user.password_hash) {
            return new Response(
              "Please login with your connected provider (e.g., Google)",
              { status: 401 },
            );
          }

          if (!await comparePassword(password, user.password_hash)) {
            return new Response("Invalid email or password", { status: 401 });
          }

          const sessionId = await createSession(user.id);
          const headers = new Headers();
          setSessionCookie(headers, sessionId);
          headers.set("location", "/dashboard");
          return new Response(null, { status: 303, headers });
        } catch (error) {
          console.error("Login failed:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    },
  },
});
