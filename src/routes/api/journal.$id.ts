import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../server/auth";
import { executeDB, queryDB } from "../../server/db";
import { deleteJournalEntry, mapJournalRow } from "../../server/journal";

export const Route = createFileRoute("/api/journal/$id")({
  server: { handlers: {
    GET: async ({ request, params }) => {
      const userId = await getSessionUser(request);
      if (!userId) return new Response("Unauthorized", { status: 401 });
      const rows = await queryDB("SELECT * FROM journal_entries WHERE id=$1 AND user_id=$2", params.id, userId);
      return rows[0] ? Response.json(mapJournalRow(rows[0])) : new Response("Not found", { status: 404 });
    },
    PUT: async ({ request, params }) => {
      const userId = await getSessionUser(request);
      if (!userId || isDemoUser(userId)) return new Response("Unauthorized", { status: 401 });
      const body = await request.json().catch(() => null) as Record<string, unknown> | null;
      if (!body) return new Response("Invalid JSON", { status: 400 });
      const fields: Array<[string,string]> = [["rawThought","raw_thought"],["mood","mood"],["tags","tags"],["isFavorited","is_favorited"],["isPinned","is_pinned"],["isArchived","is_archived"],["isPublic","is_public"]];
      const clauses = ["updated_at=NOW()"]; const values: unknown[]=[];
      for (const [key,column] of fields) if (body[key] !== undefined) { values.push(body[key]); clauses.push(`${column}=$${values.length}`); }
      values.push(params.id, userId);
      const rows = await queryDB(`UPDATE journal_entries SET ${clauses.join(",")} WHERE id=$${values.length-1} AND user_id=$${values.length} RETURNING *`, ...values);
      return rows[0] ? Response.json({ success:true, entry:mapJournalRow(rows[0]) }) : new Response("Not found", { status:404 });
    },
    DELETE: async ({ request, params }) => {
      const userId = await getSessionUser(request);
      if (!userId || isDemoUser(userId)) return new Response("Unauthorized", { status:401 });
      return await deleteJournalEntry(userId,params.id) ? Response.json({success:true}) : new Response("Not found",{status:404});
    },
  }},
});
