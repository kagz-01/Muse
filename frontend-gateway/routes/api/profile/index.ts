import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { queryDB } from "../../../utils/db.ts";

export const handler: Handlers = {
  /** GET — fetch the current user's profile from the DB */
  async GET(req) {
    try {
      const userId = await getSessionUser(req);
      if (!userId) {
        return new Response("Unauthorized", { status: 401 });
      }

      if (userId === "__demo__") {
        const { DEMO_USER } = await import("../../../utils/demo_data.ts");
        return new Response(
          JSON.stringify({
            id: DEMO_USER.id,
            email: DEMO_USER.email,
            username: DEMO_USER.username,
            name: DEMO_USER.name,
            wallet_address: null,
            resonance_score: DEMO_USER.resonance,
            current_streak: DEMO_USER.cognitiveStreak,
            created_at: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const rows = await queryDB(
        "SELECT id, email, username, name, wallet_address, resonance_score, current_streak, created_at FROM users WHERE id = $1",
        userId,
      );

      if (rows.length === 0) {
        return new Response("User not found", { status: 404 });
      }

      // Convert any BigInt values returned by the DB into safe JSON values.
      const sanitize = (val: unknown): unknown => {
        if (val === null || val === undefined) return val;
        if (typeof val === "bigint") return Number(val);
        if (val instanceof Date) return val.toISOString();
        if (Array.isArray(val)) return val.map(sanitize);
        if (val && typeof val === "object") {
          const o: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
            o[k] = sanitize(v);
          }
          return o;
        }
        return val;
      };

      const safeRow = sanitize(rows[0]);

      return new Response(JSON.stringify(safeRow), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(`Internal Server Error: ${(e as Error).message}`, {
        status: 500,
      });
    }
  },

  /** PATCH — update username and/or email for the logged-in user */
  async PATCH(req) {
    try {
      const userId = await getSessionUser(req);
      if (!userId) {
        return new Response("Unauthorized", { status: 401 });
      }

      if (userId === "__demo__") {
        return new Response(JSON.stringify({ success: true, user: { id: "__demo__" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const body = await req.json() as Record<string, string>;
      const allowed = ["username", "email"];
      const updates: string[] = [];
      const values: string[] = [];
      let paramIndex = 1;

      for (const key of allowed) {
        if (body[key] !== undefined) {
          updates.push(`${key} = $${paramIndex++}`);
          values.push(body[key]);
        }
      }

      if (updates.length === 0) {
        return new Response("No valid fields to update", { status: 400 });
      }

      // Check uniqueness for username/email
      if (body.username || body.email) {
        const conflictCheck = await queryDB(
          `SELECT id FROM users WHERE (${
            body.username ? "username = $1" : "email = $1"
          }) AND id != $2`,
          body.username || body.email,
          userId,
        );
        if (conflictCheck.length > 0) {
          return new Response("Username or email already taken", {
            status: 409,
          });
        }
      }

      values.push(userId);
      const result = await queryDB(
        `UPDATE users SET ${
          updates.join(", ")
        } WHERE id = $${paramIndex} RETURNING id, email, username`,
        ...values,
      );

      return new Response(JSON.stringify({ success: true, user: result[0] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(`Internal Server Error: ${(e as Error).message}`, {
        status: 500,
      });
    }
  },
};
