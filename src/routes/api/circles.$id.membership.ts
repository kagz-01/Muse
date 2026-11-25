import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser } from "../../server/auth";import{queryDB}from"../../server/db";
export const Route=createFileRoute("/api/circles/$id/membership")({server:{handlers:{GET:async({request,params})=>{const userId=await getSessionUser(request);if(!userId)return new Response("Unauthorized",{status:401});const rows=await queryDB("SELECT role FROM circle_members WHERE circle_id=$1 AND user_id=$2",params.id,userId);return Response.json({isMember:rows.length>0,role:(rows[0] as Record<string,unknown>|undefined)?.role||null})}}}});
