/// <reference path="../../../types/fresh.d.ts" />

import { Handlers } from "$fresh/server.ts";
import { queryDB } from "../../../utils/db.ts";
import { getSessionUser, isDemoUser } from "../../../utils/auth.ts";
import { DEMO_COLLABORATORS } from "../../../utils/demo_data.ts";
import { generateCognitiveProfile, generateMatchReason } from "../../../utils/ai.ts";

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
        `SELECT u.id, u.username, u.avatar_url
         FROM users u
         LEFT JOIN entanglements e ON (
           ((e.requester_id = $1 AND e.addressee_id = u.id)
             OR (e.requester_id = u.id AND e.addressee_id = $1))
           AND e.status = 'accepted'
         )
         WHERE u.id != $1
           AND (
             u.preferences->'privacySecurity'->>'accountVisibility' = 'public'
             OR e.id IS NOT NULL
           )
         LIMIT 10`,
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
        let matchReason = "Connecting through the digital ether.";
        
        if (partnerItems.length > 0 && userWords.size > 0) {
          const partnerText = partnerItems.map((pi: unknown) => `${(pi as Record<string, unknown>).title} ${(pi as Record<string, unknown>).note || ""}`).join(" ").toLowerCase();
          const partnerWords = new Set(partnerText.split(/\W+/).filter(w => w.length > 4));
          
          // Calculate Jaccard similarity approximation
          const intersection = new Set([...userWords].filter(x => partnerWords.has(x)));
          if (intersection.size > 0) {
            matchPercentage = Math.min(99, 50 + (intersection.size * 5)); // Add 5% per shared significant word
            const intersectionArr = Array.from(intersection);
            sharedThemes = intersectionArr.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1));
            matchReason = await generateMatchReason(intersectionArr.slice(0, 5));
          }
        } else {
           // Fallback for empty states
           matchPercentage = Math.floor(Math.random() * 30) + 60;
           sharedThemes = ["Next.js", "AI", "Design Systems"].sort(() => 0.5 - Math.random()).slice(0, 2);
        }

        const partnerTextForProfile = partnerItems.map((pi) => `${(pi as Record<string, unknown>).title} ${(pi as Record<string, unknown>).note || ""}`).join("\n").slice(0, 500);
        const profile = await generateCognitiveProfile(partnerTextForProfile);

        const topCitedNode = partnerItems.length > 0
          ? String((partnerItems[0] as Record<string, unknown>).title || "Mental Models")
          : "Mental Models";

        return {
          id: u.id,
          name: u.username || String(u.id).slice(0, 8),
          avatar: u.avatar_url ||
            "https://api.dicebear.com/7.x/avataaars/svg?seed=" + u.username,
          role: profile.intelligenceProfile,
          status: ["Online", "Reflecting", "Deep Focus", "Offline"][i % 4],
          bio: profile.bio,
          sharedThemes,
          aura: profile.auraColor,
          intelligenceProfile: profile.intelligenceProfile,
          matchPercentage,
          matchReason,
          topCitedNode,
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
