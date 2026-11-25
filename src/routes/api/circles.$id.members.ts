import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser } from "../../server/auth";import{queryDB}from"../../server/db";
export const Route=createFileRoute("/api/circles/$id/members")({server:{handlers:{GET:async({request,params})=>{const userId=await getSessionUser(request);if(!userId)return new Response("Unauthorized",{status:401});const rows=await queryDB("SELECT u.id,u.username,u.name,u.avatar_url,cm.role,cm.added_at FROM circle_members cm JOIN users u ON u.id=cm.user_id WHERE cm.circle_id=$1 ORDER BY cm.added_at DESC",params.id);return Response.json(rows)}}}});
