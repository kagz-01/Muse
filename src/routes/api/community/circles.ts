import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser } from "../../../server/auth";
import { queryDB } from "../../../server/db";
export const Route=createFileRoute("/api/community/circles")({server:{handlers:{GET:async({request})=>{const userId=await getSessionUser(request);if(!userId)return new Response("Unauthorized",{status:401});const rows=await queryDB("SELECT c.*,COUNT(cm.user_id)::int AS member_count FROM circles c LEFT JOIN circle_members cm ON cm.circle_id=c.id GROUP BY c.id ORDER BY c.created_at DESC");return Response.json(rows)}}}});
