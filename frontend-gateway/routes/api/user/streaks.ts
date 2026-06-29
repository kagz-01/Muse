import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { executeDB, queryDB } from "../../../utils/db.ts";
import {
  buildSparkSummary,
  deriveNextStreakState,
  getStreakLevelForCount,
  getUnlockedMilestones,
} from "../../../utils/streakEngine.ts";

async function generateSparkSummary(contributionType: string, content: string, destination: string) {
  const fallback = buildSparkSummary(contributionType, content, destination);

  const aiEngineUrl = Deno.env.get("AI_ENGINE_URL") || "http://127.0.0.1:8000";
  try {
    const response = await fetch(`${aiEngineUrl}/api/streak-spark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contribution_type: contributionType, content, destination }),
    });

    if (response.ok) {
      const data = await response.json();
      if (typeof data.summary === "string" && data.summary.trim()) {
        return data.summary;
      }
    }
  } catch {
    // Fall back to the local deterministic summary when the AI engine is unavailable.
  }

  return fallback;
}

export const handler: Handlers = {
  async GET(req, _ctx) {
    const rawUserId = await getSessionUser(req);
    if (!rawUserId) {
      return new Response("Unauthorized", { status: 401 });
    }
    const userId = rawUserId.replace(/[^a-zA-Z0-9-]/g, "");

    try {
      const result = await queryDB(
        `SELECT current_streak, longest_streak, total_journal_days, last_entry_date, streak_level, freeze_count, milestones_unlocked, preferences->'streak_permissions' AS streak_permissions 
         FROM users WHERE id = $1`,
        userId as string,
      );

      if (result.length === 0) {
        return new Response("User not found", { status: 404 });
      }

      const row = result[0] as Record<string, unknown>;
      const streakData = {
        current_streak: Number(row.current_streak || 0),
        longest_streak: Number(row.longest_streak || 0),
        total_journal_days: Number(row.total_journal_days || 0),
        last_entry_date: row.last_entry_date,
        streak_level: row.streak_level,
        freeze_count: Number(row.freeze_count || 0),
        milestones_unlocked: Array.isArray(row.milestones_unlocked) ? row.milestones_unlocked.map(Number) : [],
        permissions: row.streak_permissions || {
          show_active: true,
          show_mood: false,
          show_room_titles: false,
          show_journal_previews: false,
        },
      };

      const feedResult = await queryDB(
        `SELECT 'network' as type, created_at, title as content 
         FROM items WHERE user_id = $1 AND room_id IS NULL AND created_at >= current_date
         UNION ALL
         SELECT 'room' as type, created_at, title as content 
         FROM rooms WHERE user_id = $1 AND created_at >= current_date
         UNION ALL
         SELECT 'item' as type, created_at, title as content 
         FROM items WHERE user_id = $1 AND room_id IS NOT NULL AND created_at >= current_date
         ORDER BY created_at DESC LIMIT 10`,
        userId as string,
      );

      const sparkRows = await queryDB(
        `SELECT summary, destination, created_at FROM streak_sparks WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
        userId as string,
      );

      return new Response(JSON.stringify({ streak: streakData, feed: feedResult, sparks: sparkRows }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Failed to fetch streak data", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },

  async POST(req, _ctx) {
    const rawUserId = await getSessionUser(req);
    if (!rawUserId) {
      return new Response("Unauthorized", { status: 401 });
    }
    const userId = rawUserId.replace(/[^a-zA-Z0-9-]/g, "");

    try {
      const { action, permissions, content, type, destination } = await req.json();

      if (action === "set_permissions" && permissions) {
        await executeDB(
          `UPDATE users SET preferences = jsonb_set(COALESCE(preferences, '{}'::jsonb), '{streak_permissions}', $1::jsonb) WHERE id = $2`,
          JSON.stringify(permissions),
          userId as string,
        );
        return new Response(JSON.stringify({ success: true, permissions }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (action === "capture_momentum") {
        const today = new Date().toDateString();
        const contributionType = String(type || "journal");
        const normalizedDestination = String(destination || "journal");
        const normalizedContent = String(content || "A meaningful resonance ritual was completed");
        const summary = await generateSparkSummary(contributionType, normalizedContent, normalizedDestination);

        if (destination === "network") {
          await executeDB(`INSERT INTO items (user_id, title) VALUES ($1, $2)`, userId as string, normalizedContent);
        } else if (destination === "new_room") {
          await executeDB(`INSERT INTO rooms (user_id, title) VALUES ($1, $2)`, userId as string, normalizedContent);
        } else if (destination && destination.startsWith("partner:")) {
          await executeDB(`INSERT INTO items (user_id, title) VALUES ($1, $2)`, userId as string, `[Parallel Spark] ${normalizedContent}`);
        } else if (destination && destination.length > 10) {
          await executeDB(`INSERT INTO items (user_id, room_id, title) VALUES ($1, $2, $3)`, userId as string, destination, normalizedContent);
        } else {
          await executeDB(`INSERT INTO items (user_id, title) VALUES ($1, $2)`, userId as string, normalizedContent);
        }

        const currentData = await queryDB(
          `SELECT current_streak, longest_streak, total_journal_days, last_entry_date, milestones_unlocked FROM users WHERE id = $1`,
          userId as string,
        );

        if (currentData.length > 0) {
          const row = currentData[0] as Record<string, unknown>;
          const currentStreak = Number(row.current_streak || 0);
          const longestStreak = Number(row.longest_streak || 0);
          const totalJournalDays = Number(row.total_journal_days || 0);
          const lastEntryDate = (row.last_entry_date as string) || "";
          const alreadyUnlocked = Array.isArray(row.milestones_unlocked) ? row.milestones_unlocked.map(Number) : [];
          const nextState = deriveNextStreakState({
            currentStreak,
            longestStreak,
            totalJournalDays,
            lastEntryDate,
            today,
          });

          const weight = contributionType === "synthesis" ? 2 : contributionType === "entanglement" ? 2.5 : contributionType === "artifact" ? 1.5 : 1;

          const streakEventId = (await executeDB(
            `INSERT INTO streak_events (user_id, contribution_type, content, destination, weight, summary) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            userId as string,
            contributionType,
            normalizedContent,
            normalizedDestination,
            weight,
            summary,
          )).rows[0]?.id;

          await executeDB(
            `INSERT INTO streak_sparks (user_id, event_id, spark_type, summary, destination, visibility) VALUES ($1, $2, $3, $4, $5, $6)`,
            userId as string,
            streakEventId,
            contributionType,
            summary,
            normalizedDestination,
            "private",
          );

          if (nextState.shouldCount) {
            const unlockedMilestones = getUnlockedMilestones(nextState.currentStreak, alreadyUnlocked);
            await executeDB(
              `UPDATE users SET current_streak = $1, longest_streak = $2, total_journal_days = $3, last_entry_date = $4, streak_level = $5, milestones_unlocked = $6 WHERE id = $7`,
              nextState.currentStreak,
              nextState.longestStreak,
              nextState.totalJournalDays,
              nextState.lastEntryDate,
              nextState.streakLevel,
              unlockedMilestones,
              userId as string,
            );
            return new Response(JSON.stringify({ success: true, newStreak: nextState.currentStreak, longestStreak: nextState.longestStreak, totalJournalDays: nextState.totalJournalDays, lastEntryDate: nextState.lastEntryDate, streakLevel: nextState.streakLevel, summary }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ success: true, newStreak: currentStreak, longestStreak, totalJournalDays, lastEntryDate, streakLevel: getStreakLevelForCount(currentStreak), summary, alreadyCountedToday: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // Use a freeze to skip today without breaking the streak
      if (action === "use_freeze") {
        const today = new Date().toDateString();

        const userRow = await queryDB(
          `SELECT freeze_count FROM users WHERE id = $1`,
          userId as string,
        );

        if (userRow.length === 0) {
          return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });
        }

        const freezeCount = Number((userRow[0] as Record<string, unknown>).freeze_count || 0);
        if (freezeCount <= 0) {
          return new Response(JSON.stringify({ success: false, message: "No freezes available" }), { status: 400 });
        }

        const newFreeze = freezeCount - 1;
        await executeDB(
          `UPDATE users SET freeze_count = $1, last_entry_date = $2 WHERE id = $3`,
          newFreeze, today, userId as string,
        );

        return new Response(JSON.stringify({ success: true, freezeCount: newFreeze, lastEntryDate: today }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response("Invalid action", { status: 400 });
    } catch (e) {
      console.error("Failed to post spark/set mode", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
