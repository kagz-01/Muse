import { Handlers } from "$fresh/server.ts";
import { queryDB } from "../../../utils/db.ts";
import { getSessionUser, isDemoUser } from "../../../utils/auth.ts";
import { DEMO_STREAM } from "../../../utils/demo_data.ts";

export const handler: Handlers = {
  async GET(_req) {
    const _userId = await getSessionUser(_req);

    // Demo mode — return template stream immediately
    if (isDemoUser(_userId)) {
      return new Response(JSON.stringify({ stream: DEMO_STREAM }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    // In production, we select public journal entries across all users
    // We join with the users table to get the author's details.
    const query = `
      SELECT 
        j.id, 
        j.raw_thought as content, 
        j.tags,
        j.mood, 
        j.created_at as timestamp, 
        u.username as author_name,
        u.avatar_url as author_avatar
      FROM journal_entries j
      JOIN users u ON j.user_id = u.id
      WHERE j.is_public = true
      ORDER BY j.created_at DESC
      LIMIT 50
    `;

    try {
      const rawEntries = await queryDB(query);

      const stream = rawEntries.map((e: unknown) => {
        const entry = e as Record<string, unknown>;
        return {
          id: entry.id,
          author: {
            name: entry.author_name || "Anonymous",
            avatar: entry.author_avatar ||
              "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
                entry.author_name,
            aura: entry.mood || "reflective", // Map mood to aura color for UI
          },
          content: entry.content,
          timestamp: new Date(entry.timestamp as string).toISOString(),
          tags: Array.isArray(entry.tags) ? entry.tags : [],
          // Mocking alignment and challenge counts for now until we build interaction tables
          alignCount: Math.floor(Math.random() * 50),
          challengeCount: Math.floor(Math.random() * 10),
        };
      });

      return new Response(JSON.stringify({ stream }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      console.error("Failed to fetch thought stream:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch stream" }), {
        status: 500,
      });
    }
  },
};
