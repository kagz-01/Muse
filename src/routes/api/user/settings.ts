import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../../server/auth";
import { executeDB, queryDB } from "../../../server/db";

export const Route=createFileRoute("/api/user/settings")({server:{handlers:{
 GET:async({request})=>{const userId=await getSessionUser(request);if(!userId)return new Response("Unauthorized",{status:401});if(isDemoUser(userId))return Response.json({name:"Muse Guest",bio:"",avatarUrl:"",preferences:{}});
 const rows=await queryDB("SELECT name,bio,avatar_url,preferences FROM users WHERE id=$1",userId);if(!rows[0])return new Response("Not found",{status:404});const r=rows[0] as Record<string,unknown>;return Response.json({name:r.name||"",bio:r.bio||"",avatarUrl:r.avatar_url||"",preferences:r.preferences||{}});
 },
 PUT:async({request})=>{const userId=await getSessionUser(request);if(!userId)return new Response("Unauthorized",{status:401});if(isDemoUser(userId))return Response.json({success:true});
 const body=await request.json().catch(()=>null) as Record<string,unknown>|null;if(!body)return new Response("Invalid JSON",{status:400});
 const map:Record<string,string>={name:"name",bio:"bio",avatarUrl:"avatar_url",username:"username",email:"email",preferences:"preferences"};
 const clauses:string[]=[];const values:unknown[]=[];
 for(const[key,column]of Object.entries(map)){if(body[key]===undefined)continue;if(key==="preferences"&&typeof body[key]==="object"){const existing=await queryDB("SELECT preferences FROM users WHERE id=$1",userId);const base=((existing[0] as Record<string,unknown>|undefined)?.preferences as Record<string,unknown>)||{};values.push({...base,...body[key] as Record<string,unknown>});}else values.push(body[key]);clauses.push(`${column}=$${values.length}`);}
 if(!clauses.length)return new Response("No valid fields",{status:400});values.push(userId);await executeDB(`UPDATE users SET ${clauses.join(",")} WHERE id=$${values.length}`,...values);return Response.json({success:true});
 },
}}});
