import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../server/auth";
import { queryDB } from "../../server/db";

export const Route=createFileRoute("/api/profile")({server:{handlers:{
  GET:async({request})=>{const userId=await getSessionUser(request);if(!userId)return new Response("Unauthorized",{status:401});if(isDemoUser(userId))return Response.json({id:"__demo__",username:"Muse Guest",name:"Muse Guest",email:"demo@muse.local"});
    const rows=await queryDB("SELECT id,email,username,name,bio,avatar_url,wallet_address,resonance_score,current_streak,created_at FROM users WHERE id=$1",userId);return rows[0]?Response.json(rows[0]):new Response("Not found",{status:404});
  },
  PATCH:async({request})=>{const userId=await getSessionUser(request);if(!userId)return new Response("Unauthorized",{status:401});if(isDemoUser(userId))return Response.json({success:true,user:{id:"__demo__"}});
    const body=await request.json().catch(()=>null) as Record<string,unknown>|null;if(!body)return new Response("Invalid JSON",{status:400});
    const allowed=["username","email"] as const;const clauses:string[]=[];const values:unknown[]=[];
    for(const key of allowed)if(typeof body[key]==="string"){values.push(body[key]);clauses.push(`${key}=$${values.length}`);}if(!clauses.length)return new Response("No valid fields",{status:400});
    values.push(userId);const rows=await queryDB(`UPDATE users SET ${clauses.join(",")} WHERE id=$${values.length} RETURNING id,email,username,name`,...values);return Response.json({success:true,user:rows[0]});
  },
}}});
