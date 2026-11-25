/// <reference path="../../../types/fresh.d.ts" />

import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { queryDB } from "../../../utils/db.ts";

export const handler: Handlers = {
  async GET(req) {
    const userId = await getSessionUser(req);
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (userId === "__demo__") {
      const { DEMO_USER, DEMO_JOURNALS } = await import("../../../utils/demo_data.ts");
      const format = new URL(req.url).searchParams.get("format") || "json";
      
      if (format === "csv") {
        let csvContent = "id,raw_thought,mood,tags,created_at\\n";
        for (const j of DEMO_JOURNALS) {
          const escapedThought = `"${j.body.replace(/"/g, '""')}"`;
          const escapedTags = `"${(j.tags || []).join(",")}"`;
          csvContent += `${j.id},${escapedThought},${j.mood},${escapedTags},${new Date(j.createdAt).toISOString()}\\n`;
        }
        return new Response(csvContent, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="muse_export.csv"',
          },
        });
      }

      return new Response(JSON.stringify({ user: DEMO_USER, journals: DEMO_JOURNALS, exportDate: new Date().toISOString() }, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="muse_export.json"',
        },
      });
    }

    try {
      const url = new URL(req.url);
      const format = url.searchParams.get("format") || "json";

      // Fetch user data
      const userResult = await queryDB(
        "SELECT username, email, created_at FROM users WHERE id = $1",
        userId,
      );

      // Fetch journal entries
      const journals = await queryDB(
        "SELECT id, raw_thought, mood, tags, is_favorited, created_at, updated_at FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC",
        userId,
      );

      const exportData = {
        user: userResult[0],
        journals: journals,
        exportDate: new Date().toISOString(),
      };

      if (format === "csv") {
        // Minimal CSV conversion for journals
        let csvContent = "id,raw_thought,mood,tags,created_at\\n";
        for (const j of journals) {
          const row = j as {
            id: string;
            raw_thought: string;
            mood: string;
            tags: string[];
            created_at: { toISOString(): string };
          };
          const escapedThought = `"${row.raw_thought.replace(/"/g, '""')}"`;
          const escapedTags = `"${(row.tags || []).join(",")}"`;
          csvContent +=
            `${row.id},${escapedThought},${row.mood},${escapedTags},${row.created_at.toISOString()}\\n`;
        }
        return new Response(csvContent, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="muse_export.csv"',
          },
        });
      }

      // Default JSON export
      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="muse_export.json"',
        },
      });
    } catch (e) {
      console.error("Error exporting data:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
