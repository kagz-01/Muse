import { createFileRoute } from "@tanstack/react-router";
import { clearSessionCookie, getSessionUser } from "../../../server/auth";
import { executeDB } from "../../../server/db";

export const Route = createFileRoute("/api/user/delete")({
  server: {
    handlers: {
      DELETE: async ({ request }) => {
        try {
          const userId = await getSessionUser(request);
          if (!userId) {
            return new Response("Unauthorized", { status: 401 });
          }

          if (userId === "__demo__") {
            return new Response("Demo account cannot be deleted.", {
              status: 403,
            });
          }

          await executeDB(
            "DELETE FROM circle_members WHERE user_id = $1",
            userId,
          );
          await executeDB(
            "DELETE FROM journal_entries WHERE user_id = $1",
            userId,
          );
          await executeDB("DELETE FROM rooms WHERE user_id = $1", userId);
          await executeDB("DELETE FROM users WHERE id = $1", userId);

          const headers = new Headers();
          clearSessionCookie(headers);
          return new Response("Account deleted successfully.", {
            status: 200,
            headers,
          });
        } catch (error) {
          console.error("Account deletion error:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    },
  },
});
