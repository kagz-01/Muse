/// <reference path="../../../types/fresh.d.ts" />

import { Handlers } from "$fresh/server.ts";
import { getSessionUser, isDemoUser } from "../../../utils/auth.ts";
import { DEMO_USER } from "../../../utils/demo_data.ts";
import { queryDB } from "../../../utils/db.ts";

export const handler: Handlers = {
  async GET(req) {
    const userId = await getSessionUser(req);
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (isDemoUser(userId)) {
      return new Response(
        JSON.stringify({
          id: DEMO_USER.id,
          name: DEMO_USER.name,
          username: DEMO_USER.username,
          email: DEMO_USER.email,
          isDemo: true,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const users = await queryDB(
      "SELECT id, name, username, email FROM users WHERE id = $1",
      userId,
    );
    if (users.length === 0) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userRow = users[0] as Record<string, string>;
    return new Response(
      JSON.stringify({
        id: userId,
        name: userRow.name,
        username: userRow.username,
        email: userRow.email,
        isDemo: false,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  },
};
