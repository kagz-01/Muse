/// <reference path="../../types/fresh.d.ts" />

import { Handlers } from "$fresh/server.ts";
import { getSessionUser, isDemoUser } from "../../utils/auth.ts";
import { queryDB } from "../../utils/db.ts";

export const handler: Handlers = {
  async GET(req) {
    const rawUserId = await getSessionUser(req);
    if (!rawUserId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (isDemoUser(rawUserId)) {
      return new Response(
        JSON.stringify({
          stats: {
            views: 1250,
            likes: 342,
            comments: 89,
            collaborations: 23,
            follows: 156,
            circleJoins: 12,
          },
          activity: [],
          followerCount: 156,
          followingCount: 89,
          followerHistory: [
            { date: "Mon", count: 120 },
            { date: "Tue", count: 128 },
            { date: "Wed", count: 135 },
            { date: "Thu", count: 142 },
            { date: "Fri", count: 149 },
            { date: "Sat", count: 154 },
            { date: "Sun", count: 156 },
          ],
          isLoading: false,
          error: null,
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    try {
      const userId = rawUserId.replace(/[^a-zA-Z0-9-]/g, "");

      const [roomRows, threadRows, journalRows, circleRows, entanglementRows] =
        await Promise.all([
          queryDB(
            `SELECT resonance_metrics FROM rooms WHERE user_id = $1`,
            userId,
          ),
          queryDB(
            `SELECT resonance_metrics, dialogue_layers, is_favorited, updated_at, title
             FROM threads WHERE user_id = $1`,
            userId,
          ),
          queryDB(
            `SELECT id, is_favorited, is_public, created_at, updated_at, raw_thought
             FROM journal_entries WHERE user_id = $1`,
            userId,
          ),
          queryDB(
            `SELECT COUNT(*) AS count FROM circle_members WHERE user_id = $1`,
            userId,
          ),
          queryDB(
            `SELECT id, requester_id, addressee_id, updated_at
             FROM entanglements
             WHERE (requester_id = $1 OR addressee_id = $1) AND status = 'accepted'`,
            userId,
          ),
        ]);

      const roomViews = (roomRows as Array<Record<string, unknown>>)
        .reduce((sum, row) => {
          const metrics = row.resonance_metrics as Record<string, unknown> | null;
          return sum + Number(metrics?.views ?? 0);
        }, 0);

      const threadViews = (threadRows as Array<Record<string, unknown>>)
        .reduce((sum, row) => {
          const metrics = row.resonance_metrics as Record<string, unknown> | null;
          return sum + Number(metrics?.views ?? 0);
        }, 0);

      const journalLikes = (journalRows as Array<Record<string, unknown>>)
        .filter((entry) => entry.is_favorited === true).length;

      const threadLikes = (threadRows as Array<Record<string, unknown>>)
        .filter((thread) => thread.is_favorited === true).length;

      const totalComments = (threadRows as Array<Record<string, unknown>>)
        .reduce((sum, row) => {
          const dialogue = row.dialogue_layers as Array<unknown> | null;
          return sum + (Array.isArray(dialogue) ? dialogue.length : 0);
        }, 0);

      const acceptedCount = (entanglementRows as Array<Record<string, unknown>>)
        .length;
      const circleCount = Number((circleRows[0] as { count: string }).count || 0);

      const followerHistory = [...Array(7)].map((_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        return {
          date: date.toLocaleDateString("en-US", { weekday: "short" }),
          count: Math.max(acceptedCount - 3 + index, 0),
        };
      });

      const recentJournal = (journalRows as Array<Record<string, unknown>>)
        .sort((a, b) => {
          const aDate = new Date(String(a.updated_at || a.created_at)).getTime();
          const bDate = new Date(String(b.updated_at || b.created_at)).getTime();
          return bDate - aDate;
        })
        .slice(0, 2)
        .map((entry, idx) => ({
          id: `mirror-journal-${entry.id ?? idx}`,
          type: "view",
          actor: "Your journal",
          actorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=journal",
          target: String(entry.raw_thought || "Recent reflection" ).slice(0, 80),
          timestamp: new Date(String(entry.updated_at || entry.created_at)),
        }));

      const recentThreads = (threadRows as Array<Record<string, unknown>>)
        .sort((a, b) => {
          const aDate = new Date(String(a.updated_at)).getTime();
          const bDate = new Date(String(b.updated_at)).getTime();
          return bDate - aDate;
        })
        .slice(0, 2)
        .map((thread, idx) => ({
          id: `mirror-thread-${thread.title ?? idx}`,
          type: "collaborate",
          actor: "Thread",
          actorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=thread",
          target: String(thread.title || "Recent thread"),
          timestamp: new Date(String(thread.updated_at)),
        }));

      const activity = [...recentThreads, ...recentJournal]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5);

      return new Response(
        JSON.stringify({
          stats: {
            views: roomViews + threadViews + journalLikes * 3,
            likes: journalLikes + threadLikes,
            comments: totalComments,
            collaborations: Math.max(acceptedCount, 1),
            follows: acceptedCount,
            circleJoins: circleCount,
          },
          activity,
          followerCount: acceptedCount,
          followingCount: acceptedCount,
          followerHistory,
          isLoading: false,
          error: null,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error: unknown) {
      console.error("Error building mirror stats:", error);
      return new Response(JSON.stringify({ error: "Unable to compute mirror stats" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
