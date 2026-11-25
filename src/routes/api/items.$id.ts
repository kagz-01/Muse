import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../server/auth";
import { deleteItem } from "../../server/items";

export const Route = createFileRoute("/api/items/$id")({
  server: { handlers: {
    DELETE: async ({ request, params }) => {
      const userId = await getSessionUser(request);
      if (!userId) return new Response("Unauthorized", { status: 401 });
      if (isDemoUser(userId)) return new Response("Demo users cannot delete items", { status: 403 });
      const deleted = await deleteItem(userId, params.id);
      return deleted ? Response.json({ success: true }) : new Response("Not found", { status: 404 });
    },
  }},
});
