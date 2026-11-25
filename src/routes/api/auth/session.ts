import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../../server/auth";
import { DEMO_USER } from "../../../server/demo-user";
import { queryDB } from "../../../server/db";

export const Route = createFileRoute("/api/auth/session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const userId = await getSessionUser(request);
        if (!userId) {
          return new Response("Unauthorized", { status: 401 });
        }

        if (isDemoUser(userId)) {
          return Response.json({
            id: DEMO_USER.id,
            name: DEMO_USER.name,
            username: DEMO_USER.username,
            email: DEMO_USER.email,
            isDemo: true,
          });
        }

        const users = await queryDB<{
          name: string;
          username: string;
          email: string;
        }>(
          "SELECT name, username, email FROM users WHERE id = $1",
          userId,
        );
        const user = users[0];
        if (!user) {
          return new Response("Unauthorized", { status: 401 });
        }

        return Response.json({
          id: userId,
          name: user.name,
          username: user.username,
          email: user.email,
          isDemo: false,
        });
      },
    },
  },
});
