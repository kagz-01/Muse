/// <reference path="../../../types/fresh.d.ts" />

import { Handlers } from "$fresh/server.ts";
import { executeDB } from "../../../utils/db.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { setCookie } from "$std/http/cookie.ts";

export const handler: Handlers = {
  async DELETE(req) {
    try {
      const userId = await getSessionUser(req);

      if (!userId) {
        return new Response("Unauthorized", { status: 401 });
      }

      // Demo users cannot be deleted
      if (userId === "__demo__") {
        return new Response("Demo account cannot be deleted.", { status: 403 });
      }

      // We must perform a cascading delete since foreign keys might not have ON DELETE CASCADE setup.
      // Order matters: delete children before parents.

      // 1. Delete from circle_members
      await executeDB("DELETE FROM circle_members WHERE user_id = $1", userId);

      // Note: If the user created circles, those circles might be orphaned.
      // We could transfer ownership or delete the circles. For now, we'll just delete them.
      // First, find circles owned/founded by this user if we had an owner field.
      // In our current schema, circles don't have a strict owner, just members.
      // But we should clean up if they are the only member. Let's just delete their membership.

      // 2. Delete journal entries
      await executeDB("DELETE FROM journal_entries WHERE user_id = $1", userId);

      // 3. Delete rooms
      await executeDB("DELETE FROM rooms WHERE user_id = $1", userId);

      // 4. Finally, delete the user record
      await executeDB("DELETE FROM users WHERE id = $1", userId);

      // 5. Clear session cookie
      const headers = new Headers();
      // To clear a cookie, we set maxAge to 0
      setCookie(headers, {
        name: "muse_session",
        value: "",
        maxAge: 0,
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      });

      return new Response("Account deleted successfully.", {
        status: 200,
        headers,
      });
    } catch (e) {
      console.error("Account deletion error:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
