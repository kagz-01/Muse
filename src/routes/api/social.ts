import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../server/auth";
import { executeDB, queryDB } from "../../server/db";

export const Route=createFileRoute("/api/social")({server:{handlers:{POST:async({request})=>{const userId=await getSessionUser(request);if(!userId)return new Response("Unauthorized",{status:401});if(isDemoUser(userId))return new Response("Demo users cannot mutate follows",{status:403});const body=await request.json().catch(()=>null) as Record<string,unknown>|null;const target=typeof body?.targetUserId==="string"?body.targetUserId:"";if(!target)return new Response("targetUserId required",{status:400});if(target===userId)return new Response("Cannot follow yourself",{status:400});await executeDB("INSERT INTO follows(follower_id,followee_id) VALUES($1,$2) ON CONFLICT DO NOTHING",userId,target);return Response.json({success:true,action:"followed"});}}}});
