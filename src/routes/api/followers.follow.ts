import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../server/auth";
import { executeDB } from "../../server/db";

export const Route = createFileRoute("/api/followers/follow")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const userId = await getSessionUser(request);
        if (!userId) return new Response("Unauthorized", { status: 401 });
        if (isDemoUser(userId)) {
          return new Response("Demo users cannot mutate follows", { status: 403 });
        }

        const body = await request.json().catch(() => null) as Record<string, unknown> | null;
        const targetUserId =
          typeof body?.targetUserId === "string" ? body.targetUserId : "";
        if (!targetUserId) {
          return Response.json({ error: "targetUserId required" }, { status: 400 });
        }
        if (targetUserId === userId) {
          return Response.json({ error: "Cannot follow yourself" }, { status: 400 });
        }

        await executeDB(
          "INSERT INTO follows (follower_id, followee_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          userId,
          targetUserId,
        );
        return Response.json({ success: true, action: "followed" });
      },
    },
  },
});
