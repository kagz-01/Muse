import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../../server/auth";
import { queryDB } from "../../../server/db";

export const Route = createFileRoute("/api/community/stream")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const userId = await getSessionUser(request);
        if (!userId) return new Response("Unauthorized", { status: 401 });
        if (isDemoUser(userId)) return Response.json({ stream: [] });

        const rows = await queryDB(
          `SELECT j.id, j.raw_thought AS content, j.tags, j.mood,
                  j.created_at AS timestamp, u.username AS author_name,
                  u.avatar_url AS author_avatar, u.id AS author_id
           FROM journal_entries j
           JOIN users u ON u.id = j.user_id
           WHERE j.is_public = true
           ORDER BY j.created_at DESC
           LIMIT 50`,
        );
        const stream = rows.map((row) => ({
          id: row.id,
          author: {
            name: row.author_name || "Anonymous",
            avatar: row.avatar_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.author_name || "Muse"}`,
            aura: row.mood || "reflective",
          },
          content: row.content,
          timestamp: new Date(String(row.timestamp)).toISOString(),
          tags: Array.isArray(row.tags) ? row.tags : [],
          alignCount: 0,
          challengeCount: 0,
        }));
        return Response.json({ stream });
      },
    },
  },
});
