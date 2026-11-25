import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../server/auth";
import { queryDB } from "../../server/db";
import { listThreads, mapThreadRow } from "../../server/threads";

export const Route = createFileRoute("/api/threads")({
  server: { handlers: {
    GET: async ({ request }) => {
      const userId = await getSessionUser(request);
      if (!userId) return new Response("Unauthorized", { status: 401 });
      if (isDemoUser(userId)) return Response.json([]);
      return Response.json(await listThreads(userId));
    },
    POST: async ({ request }) => {
      const userId = await getSessionUser(request);
      if (!userId) return new Response("Unauthorized", { status: 401 });
      if (isDemoUser(userId)) return new Response("Demo users cannot create threads", { status: 403 });
      try {
        const body = await request.json() as Record<string, unknown>;
        const title = typeof body.title === "string" ? body.title.trim() : "";
        const roomId = typeof body.roomId === "string" ? body.roomId : null;
        if (!title || !roomId) return new Response("Title and roomId are required", { status: 400 });
        const room = await queryDB("SELECT id FROM rooms WHERE id=$1 AND user_id=$2", roomId, userId);
        if (!room[0]) return new Response("Room not found or unauthorized", { status: 403 });
        const rows = await queryDB(
          `INSERT INTO threads (room_id,user_id,title,description,mood,format,depth,theme,thesis,cover_image,is_public,is_vault,artifact_ids,source_room_ids,synthesis_score,updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW()) RETURNING *`,
          roomId,userId,title,typeof body.description==="string"?body.description:"",typeof body.mood==="string"?body.mood:"focus",
          typeof body.format==="string"?body.format:null,typeof body.depth==="string"?body.depth:null,typeof body.theme==="string"?body.theme:null,
          typeof body.thesis==="string"?body.thesis:null,typeof body.coverImage==="string"?body.coverImage:null,body.isPublic===true,
          body.isVault===true,Array.isArray(body.itemIds)?body.itemIds:[],Array.isArray(body.sourceRoomIds)?body.sourceRoomIds:[],
          Math.floor(Math.random()*40)+60,
        );
        return Response.json({ success:true, thread:mapThreadRow(rows[0]) },{status:201});
      } catch (error) { console.error("Thread creation failed:",error); return new Response("Internal Server Error",{status:500}); }
    },
  }},
});
