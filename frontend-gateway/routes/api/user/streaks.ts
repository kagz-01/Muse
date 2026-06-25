import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { executeDB, queryDB } from "../../../utils/db.ts";

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
        userId as string
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
          show_journal_previews: false
        }
      };

      // Fetch today's momentum feed (activities)
      const feedResult = await queryDB(
        `SELECT 'journal' as type, created_at, raw_thought as content 
         FROM journal_entries WHERE user_id = $1 AND created_at >= current_date
         UNION ALL
         SELECT 'room' as type, created_at, title as content 
         FROM rooms WHERE user_id = $1 AND created_at >= current_date
         ORDER BY created_at DESC LIMIT 10`,
        userId as string
      );

      return new Response(JSON.stringify({ streak: streakData, feed: feedResult }), {
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
      const { action, permissions, content, type } = await req.json();

      if (action === "set_permissions" && permissions) {
        await executeDB(
          `UPDATE users SET preferences = jsonb_set(COALESCE(preferences, '{}'::jsonb), '{streak_permissions}', $1::jsonb) WHERE id = $2`,
          JSON.stringify(permissions), userId as string
        );
        return new Response(JSON.stringify({ success: true, permissions }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Capture Momentum (formerly share_spark)
      if (action === "capture_momentum") {
        const today = new Date().toISOString().split("T")[0];
        
        // 1. Insert the artifact into the DB based on type
        if (type === "journal" && content) {
          await executeDB(
            `INSERT INTO journal_entries (user_id, raw_thought, mood) VALUES ($1, $2, $3)`,
            userId as string, content, "reflection"
          );
        } else if (type === "room" && content) {
          await executeDB(
            `INSERT INTO rooms (user_id, title) VALUES ($1, $2)`,
            userId as string, content
          );
        }
        
        const currentData = await queryDB(
          `SELECT current_streak, longest_streak, total_journal_days, last_entry_date FROM users WHERE id = $1`,
          userId as string
        );
        
        if (currentData.length > 0) {
          const row = currentData[0] as Record<string, unknown>;
          const current_streak = Number(row.current_streak || 0);
          const longest_streak = Number(row.longest_streak || 0);
          const total_journal_days = Number(row.total_journal_days || 0);
          const last_entry_date = row.last_entry_date as string;
          
          if (last_entry_date !== today) {
            // It's a new day, increment streak
            const newStreak = current_streak + 1;
            const newLongest = Math.max(newStreak, longest_streak);
            const newTotal = total_journal_days + 1;

            await executeDB(
              `UPDATE users SET 
                current_streak = $1, 
                longest_streak = $2, 
                total_journal_days = $3, 
                last_entry_date = $4 
               WHERE id = $5`,
              newStreak, newLongest, newTotal, today, userId as string
            );

            return new Response(JSON.stringify({ success: true, newStreak }), {
              status: 200,
              headers: { "Content-Type": "application/json" }
            });
          } else {
            // Already streaked today
            return new Response(JSON.stringify({ success: true, message: "Already streaked today", newStreak: current_streak }), {
              status: 200,
              headers: { "Content-Type": "application/json" }
            });
          }
        }
      }

      return new Response("Invalid action", { status: 400 });
    } catch (e) {
      console.error("Failed to post spark/set mode", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
};
