import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { queryDB } from "../../../utils/db.ts";

export const handler: Handlers = {
  // GET all rooms for the current user
  async GET(req) {
    const userId = await getSessionUser(req);
    if (!userId || userId === "__demo__") {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const rows = await queryDB(
        `SELECT id, title, description, emoji, category, size, mood,
                theme_color, custom_theme_hex, cover_image, is_public, tags,
                notifications_enabled, updated_at, semantic_tags,
                resonance_metrics, custom_styling, is_vault, item_count
         FROM rooms WHERE user_id = $1 ORDER BY updated_at DESC`,
        userId,
      );

      const rooms = rows.map((r) => {
        const row = r as Record<string, unknown>;
        return {
          id: row.id,
          name: row.title,
          description: row.description,
          emoji: row.emoji,
          category: row.category,
          size: row.size,
          mood: row.mood,
          themeColor: row.theme_color || "indigo",
          customThemeHex: row.custom_theme_hex,
          coverImage: row.cover_image,
          isPublic: row.is_public || false,
          tags: row.tags || [],
          notificationsEnabled: row.notifications_enabled ?? true,
          updatedAt: row.updated_at,
          semanticTags: row.semantic_tags || [],
          resonanceMetrics: row.resonance_metrics ||
            { views: 0, wovenCount: 0 },
          customStyling: row.custom_styling,
          isVault: row.is_vault || false,
          count: row.item_count || 0,
        };
      });

      return new Response(JSON.stringify(rooms), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Error fetching rooms:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },

  // POST - create a new room
  async POST(req) {
    const userId = await getSessionUser(req);
    if (!userId || userId === "__demo__") {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const body = await req.json();
      const {
        name,
        description,
        emoji,
        category,
        size,
        mood,
        themeColor,
        customThemeHex,
        coverImage,
        isPublic,
        tags,
        notificationsEnabled,
        isVault,
      } = body;

      if (!name || name.trim() === "") {
        return new Response("Room name is required", { status: 400 });
      }

      const result = await queryDB(
        `INSERT INTO rooms (
          user_id, title, description, emoji, category, size, mood,
          theme_color, custom_theme_hex, cover_image, is_public, tags,
          notifications_enabled, updated_at, semantic_tags, is_vault
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),ARRAY[]::TEXT[],$14)
        RETURNING *`,
        userId,
        name.trim(),
        description || "",
        emoji || null,
        category || null,
        size || "medium",
        mood || null,
        themeColor || "indigo",
        customThemeHex || null,
        coverImage || null,
        isPublic || false,
        tags || [],
        notificationsEnabled !== false,
        isVault || false,
      );

      const row = result[0] as Record<string, unknown>;
      const room = {
        id: row.id,
        name: row.title,
        description: row.description,
        emoji: row.emoji,
        category: row.category,
        size: row.size,
        mood: row.mood,
        themeColor: row.theme_color || "indigo",
        customThemeHex: row.custom_theme_hex,
        coverImage: row.cover_image,
        isPublic: row.is_public || false,
        tags: row.tags || [],
        notificationsEnabled: row.notifications_enabled ?? true,
        updatedAt: row.updated_at,
        semanticTags: [],
        resonanceMetrics: { views: 0, wovenCount: 0 },
        isVault: row.is_vault || false,
        count: 0,
      };

      return new Response(JSON.stringify({ success: true, room }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Error creating room:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
