/// <reference path="../../../types/fresh.d.ts" />

import { Handlers } from "$fresh/server.ts";
import { suggestEmojis } from "../../../utils/ai.ts";
import { getSessionUser } from "../../../utils/auth.ts";

export const handler: Handlers = {
  async POST(req) {
    const userId = await getSessionUser(req);
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const { sentence } = await req.json();
      if (!sentence) {
        return new Response("Sentence is required", { status: 400 });
      }

      const emojis = await suggestEmojis(sentence);

      return new Response(JSON.stringify({ emojis }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Failed to suggest emojis:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
