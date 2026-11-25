import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser } from "../../server/auth";
import { queryDB } from "../../server/db";
export const Route=createFileRoute("/api/followers/status")({server:{handlers:{GET:async({request})=>{const userId=await getSessionUser(request);if(!userId)return new Response("Unauthorized",{status:401});const target=new URL(request.url).searchParams.get("targetUserId");if(!target)return Response.json({error:"targetUserId required"},{status:400});const rows=await queryDB("SELECT 1 FROM follows WHERE follower_id=$1 AND followee_id=$2",userId,target);return Response.json({isFollowing:rows.length>0})}}}});
