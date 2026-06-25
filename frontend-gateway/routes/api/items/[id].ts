import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { executeDB } from "../../../utils/db.ts";

export const handler: Handlers = {
  async DELETE(req, ctx) {
    const userId = await getSessionUser(req);
    if (!userId || userId === "__demo__") {
      return new Response("Unauthorized", { status: 401 });
    }

    const itemId = ctx.params.id;

    try {
      await executeDB(
        "DELETE FROM items WHERE id = $1 AND user_id = $2",
        itemId,
        userId,
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Error deleting item:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
