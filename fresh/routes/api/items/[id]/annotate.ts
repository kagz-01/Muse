/// <reference path="../../../../types/fresh.d.ts" />

import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../../utils/auth.ts";
import { queryDB } from "../../../../utils/db.ts";

export const handler: Handlers = {
  // Get all annotations for an item
  async GET(req, ctx) {
    const userId = await getSessionUser(req);
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const itemId = ctx.params.id;
    if (!itemId) {
      return new Response("Item ID required", { status: 400 });
    }

    try {
      const access = await queryDB(
        `SELECT i.id
         FROM items i
         LEFT JOIN rooms r ON i.room_id = r.id
         LEFT JOIN room_collaborators rc ON r.id = rc.room_id
         WHERE i.id = $1
           AND (i.is_public = true OR i.user_id = $2 OR rc.user_id = $2)`,
        itemId,
        userId,
      );

      if (access.length === 0) {
        return new Response("Unauthorized", { status: 403 });
      }

      // Get annotations with author info
      const annotations = await queryDB(
        `SELECT 
           a.id, a.annotation, a.created_at,
           u.id as author_id, u.username as author_name, u.avatar_url as author_avatar
         FROM item_annotations a
         JOIN users u ON a.user_id = u.id
         WHERE a.item_id = $1
         ORDER BY a.created_at ASC`,
        itemId,
      );

      return new Response(
        JSON.stringify({
          success: true,
          annotations: annotations.map((a: any) => ({
            id: a.id,
            annotation: a.annotation,
            createdAt: a.created_at,
            authorId: a.author_id,
            authorName: a.author_name || "Unknown",
            authorAvatar: a.author_avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (a.author_name || "a"),
          })),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (e) {
      console.error("Error fetching annotations:", e);
      return new Response(`Internal Server Error: ${(e as Error).message}`, {
        status: 500,
      });
    }
  },

  // Add a new annotation
  async POST(req, ctx) {
    const userId = await getSessionUser(req);
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (userId === "__demo__") {
      return new Response("Demo users cannot add annotations", { status: 403 });
    }

    const itemId = ctx.params.id;
    if (!itemId) {
      return new Response("Item ID required", { status: 400 });
    }

    try {
      const body = await req.json();
      const { annotation } = body;

      if (!annotation || annotation.trim() === "") {
        return new Response("Annotation text is required", { status: 400 });
      }

      const access = await queryDB(
        `SELECT i.id
         FROM items i
         LEFT JOIN rooms r ON i.room_id = r.id
         LEFT JOIN room_collaborators rc ON r.id = rc.room_id
         WHERE i.id = $1
           AND (i.is_public = true OR i.user_id = $2 OR rc.user_id = $2)`,
        itemId,
        userId,
      );

      if (access.length === 0) {
        return new Response("Unauthorized", { status: 403 });
      }

      const insertResult = await queryDB(
        `INSERT INTO item_annotations (item_id, user_id, annotation) 
         VALUES ($1, $2, $3) RETURNING *`,
        itemId,
        userId,
        annotation,
      );

      const userResult = await queryDB(
        "SELECT id, username, avatar_url FROM users WHERE id = $1",
        userId,
      );
      const u = userResult[0] as any;

      const newAnnotation = {
        id: (insertResult[0] as any).id,
        annotation: (insertResult[0] as any).annotation,
        createdAt: (insertResult[0] as any).created_at,
        authorId: u.id,
        authorName: u.username || "Unknown",
        authorAvatar: u.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (u.username || "a"),
      };

      return new Response(
        JSON.stringify({
          success: true,
          annotation: newAnnotation,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (e) {
      console.error("Error posting annotation:", e);
      return new Response(`Internal Server Error: ${(e as Error).message}`, {
        status: 500,
      });
    }
  },
};
