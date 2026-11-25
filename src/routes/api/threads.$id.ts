import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../server/auth";
import { executeDB, queryDB } from "../../server/db";
import { mapThreadRow } from "../../server/threads";

export const Route = createFileRoute("/api/threads/$id")({
  server: { handlers: {
    GET: async ({ request, params }) => {
      const userId=await getSessionUser(request); if(!userId)return new Response("Unauthorized",{status:401});
      const rows=await queryDB("SELECT t.* FROM threads t LEFT JOIN rooms r ON t.room_id=r.id WHERE t.id=$1 AND (t.user_id=$2 OR r.user_id=$2)",params.id,userId);
      return rows[0]?Response.json(mapThreadRow(rows[0])):new Response("Not found",{status:404});
    },
    PUT: async ({ request, params }) => {
      const userId=await getSessionUser(request); if(!userId||isDemoUser(userId))return new Response("Unauthorized",{status:401});
      const owned=await queryDB("SELECT t.id FROM threads t JOIN rooms r ON t.room_id=r.id WHERE t.id=$1 AND r.user_id=$2",params.id,userId);
      if(!owned[0])return new Response("Not found",{status:404});
      const body=await request.json().catch(()=>null) as Record<string,unknown>|null;if(!body)return new Response("Invalid JSON",{status:400});
      const map:Record<string,string>={title:"title",description:"description",mood:"mood",format:"format",depth:"depth",theme:"theme",thesis:"thesis",coverImage:"cover_image",isPublic:"is_public",isFavorited:"is_favorited",isPinned:"is_pinned",isArchived:"is_archived",isVault:"is_vault",itemIds:"artifact_ids",sourceRoomIds:"source_room_ids",dialogueLayers:"dialogue_layers",resonanceMetrics:"resonance_metrics",customStyling:"custom_styling",synthesis:"synthesis"};
      const clauses=["updated_at=NOW()"];const values:unknown[]=[];
      for(const [key,col]of Object.entries(map))if(body[key]!==undefined){values.push(body[key]);clauses.push(`${col}=$${values.length}`);}
      values.push(params.id);const rows=await queryDB(`UPDATE threads SET ${clauses.join(",")} WHERE id=$${values.length} RETURNING *`,...values);
      return rows[0]?Response.json({success:true,thread:mapThreadRow(rows[0])}):new Response("Not found",{status:404});
    },
    DELETE: async ({ request, params }) => {
      const userId=await getSessionUser(request);if(!userId||isDemoUser(userId))return new Response("Unauthorized",{status:401});
      const owned=await queryDB("SELECT t.id FROM threads t JOIN rooms r ON t.room_id=r.id WHERE t.id=$1 AND r.user_id=$2",params.id,userId);
      if(!owned[0])return new Response("Not found",{status:404});
      await executeDB("DELETE FROM journal_entries WHERE thread_id=$1",params.id);await executeDB("DELETE FROM threads WHERE id=$1",params.id);
      return Response.json({success:true});
    },
  }},
});
