import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../server/auth";
import { executeDB, queryDB } from "../../server/db";

export const Route=createFileRoute("/api/followers")({server:{handlers:{
 GET:async({request})=>{const userId=await getSessionUser(request);if(!userId)return new Response("Unauthorized",{status:401});if(isDemoUser(userId))return Response.json({followers:[],following:[]});const[followers,following]=await Promise.all([queryDB("SELECT u.id,u.username,u.name,u.avatar_url FROM follows f JOIN users u ON u.id=f.follower_id WHERE f.followee_id=$1",userId),queryDB("SELECT u.id,u.username,u.name,u.avatar_url FROM follows f JOIN users u ON u.id=f.followee_id WHERE f.follower_id=$1",userId)]);return Response.json({followers,following})},
}}});
