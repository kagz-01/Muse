/// <reference path="../../../types/fresh.d.ts" />

import { Handlers } from "$fresh/server.ts";
import { queryDB } from "../../../utils/db.ts";
import { getSessionUser, isDemoUser } from "../../../utils/auth.ts";
import { generateMatchReason } from "../../../utils/ai.ts";

const DEMO_COLLABORATIONS = [
  {
    id: "collab-demo-1",
    title: "Launch a civic reflection pulse",
    description:
      "Convert this week’s public civic insights into a shared stream for local changemakers.",
    circleName: "Local Politics Watch",
    participants: 4,
    urgency: "High",
    actionLabel: "Open collaboration",
  },
  {
    id: "collab-demo-2",
    title: "Build a relational insight capsule",
    description:
      "Take your current relationship patterns and shape them into a guided circle discussion.",
    circleName: "Modern Romance & Relationships",
    participants: 3,
    urgency: "Medium",
    actionLabel: "Propose ritual",
  },
];

export const handler: Handlers = {
  async GET(req) {
    const userId = await getSessionUser(req);
    if (isDemoUser(userId)) {
      return new Response(JSON.stringify({ collaborations: DEMO_COLLABORATIONS }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const circles = await queryDB(
        `SELECT id, name, description, theme, member_count, recent_activity
         FROM circles
         ORDER BY member_count DESC
         LIMIT 4`,
      );

      const userItems = userId
        ? await queryDB(
          `SELECT title, note FROM items WHERE user_id = $1 AND is_public = true LIMIT 20`,
          userId,
        )
        : [];

      const userKeywords = (userItems as Array<Record<string, unknown>>)
        .flatMap((item) => [
          String(item.title || ""),
          String(item.note || ""),
        ])
        .join(" ")
        .toLowerCase()
        .split(/\W+/)
        .filter((word) => word.length > 4);

      const uniqueKeywords = Array.from(new Set(userKeywords)).slice(0, 10);

      const collaborations = await Promise.all(
        (circles as Array<Record<string, unknown>>).map(async (circle) => {
          const theme = String(circle.theme || "Emergent");
          const title = `Start a shared inquiry in ${String(circle.name)}`;
          const participantCount = Math.max(3, Number(circle.member_count) || 1);
          const urgency = (Number(circle.member_count) || 0) > 80
            ? "High"
            : (Number(circle.member_count) || 0) > 30
            ? "Medium"
            : "Low";
          let description = `Invite thinkers into ${theme.toLowerCase()} through a short active pulse across the circle.`;

          if (uniqueKeywords.length > 0) {
            const keywords = [theme, ...uniqueKeywords.slice(0, 3)];
            description = await generateMatchReason(keywords);
          }

          return {
            id: `collab-${String(circle.id)}`,
            title,
            description,
            circleName: String(circle.name),
            participants: participantCount,
            urgency: urgency as "High" | "Medium" | "Low",
            actionLabel: "Open collaboration",
          };
        }),
      );

      return new Response(JSON.stringify({ collaborations }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      console.error("Failed to fetch collaboration sparks:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch collaborations" }),
        { status: 500 },
      );
    }
  },
};
