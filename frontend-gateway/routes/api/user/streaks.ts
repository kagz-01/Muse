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
        `SELECT current_streak, longest_streak, total_journal_days, last_entry_date, streak_level, freeze_count, milestones_unlocked, preferences->>'default_spark_mode' AS default_spark_mode 
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
        milestones_unlocked: row.milestones_unlocked,
        default_spark_mode: row.default_spark_mode
      };

      return new Response(JSON.stringify({ streak: streakData }), {
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
      const { action, privacyMode } = await req.json();

      if (action === "set_mode" && privacyMode) {
        await executeDB(
          `UPDATE users SET preferences = jsonb_set(COALESCE(preferences, '{}'::jsonb), '{default_spark_mode}', $1::jsonb) WHERE id = $2`,
          `"${privacyMode}"`, userId as string
        );
        return new Response(JSON.stringify({ success: true, privacyMode }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Right now, any "Spark" action increments the streak if it's a new day
      if (action === "share_spark") {
        const today = new Date().toISOString().split("T")[0];
        
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
