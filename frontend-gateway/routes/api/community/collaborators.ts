import { Handlers } from "$fresh/server.ts";
import { queryDB } from "../../../utils/db.ts";
import { getSessionUser, isDemoUser } from "../../../utils/auth.ts";
import { DEMO_COLLABORATORS } from "../../../utils/demo_data.ts";

export const handler: Handlers = {
  async GET(req) {
    const userId = await getSessionUser(req);
    // Demo mode — return template collaborators
    if (isDemoUser(userId)) {
      return new Response(
        JSON.stringify({ collaborators: DEMO_COLLABORATORS }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Guard: CockroachDB requires valid UUIDs. Reject malformed session values.
    const UUID_RE =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(userId)) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
      });
    }

    try {
      // Implement basic matching algorithm based on shared terms in public items
      // 1. Get current user's public items keywords
      const currentUserItems = await queryDB(
        "SELECT title, note FROM items WHERE user_id = $1 AND is_public = true",
        userId
      );
      
      const currentUserText = currentUserItems.map((i: unknown) => `${(i as Record<string, unknown>).title} ${(i as Record<string, unknown>).note || ""}`).join(" ").toLowerCase();
      const userWords = new Set(currentUserText.split(/\W+/).filter(w => w.length > 4));

      // 2. Fetch potential collaborators (users other than current)
      const users = await queryDB(
        `SELECT id, username, email, avatar_url FROM users WHERE id != $1 LIMIT 10`,
        userId,
      );

      // 3. For each user, calculate overlap
      const collaborators = await Promise.all(users.map(async (e: unknown, i: number) => {
        const u = e as Record<string, unknown>;
        
        // Get this user's public items
        const partnerItems = await queryDB(
          "SELECT title, note FROM items WHERE user_id = $1 AND is_public = true",
          u.id as string
        );
        
        let matchPercentage = 50; // Base match
        let sharedThemes = ["Exploration"];
        
        if (partnerItems.length > 0 && userWords.size > 0) {
          const partnerText = partnerItems.map((pi: unknown) => `${(pi as Record<string, unknown>).title} ${(pi as Record<string, unknown>).note || ""}`).join(" ").toLowerCase();
          const partnerWords = new Set(partnerText.split(/\W+/).filter(w => w.length > 4));
          
          // Calculate Jaccard similarity approximation
          const intersection = new Set([...userWords].filter(x => partnerWords.has(x)));
          if (intersection.size > 0) {
            matchPercentage = Math.min(99, 50 + (intersection.size * 5)); // Add 5% per shared significant word
            sharedThemes = Array.from(intersection).slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1));
          }
        } else {
           // Fallback for empty states
           matchPercentage = Math.floor(Math.random() * 30) + 60;
           sharedThemes = ["Next.js", "AI", "Design Systems"].sort(() => 0.5 - Math.random()).slice(0, 2);
        }

        return {
          id: u.id,
          name: u.username || (u.email as string).split("@")[0],
          avatar: u.avatar_url ||
            "https://api.dicebear.com/7.x/avataaars/svg?seed=" + u.username,
          role: ["Synthesizer", "Architect", "Challenger", "Observer"][i % 4],
          status: ["Online", "Reflecting", "Deep Focus", "Offline"][i % 4],
          bio: "Exploring the intersections of systems and human thought.",
          sharedThemes,
          aura: ["#60a5fa", "#34d399", "#fbbf24", "#fb7185"][i % 4],
          intelligenceProfile:
            ["Synthesizer", "Architect", "Challenger"][i % 3],
          matchPercentage,
          topCitedNode: "Mental Models for Engineers",
        };
      }));

      return new Response(JSON.stringify({ collaborators }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      console.error("Failed to fetch collaborators:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch collaborators" }),
        {
          status: 500,
        },
      );
    }
  },
};
