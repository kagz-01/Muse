import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../../server/auth";
import { queryDB } from "../../../server/db";

export const Route=createFileRoute("/api/user/export")({server:{handlers:{GET:async({request})=>{
 const userId=await getSessionUser(request);if(!userId)return new Response("Unauthorized",{status:401});
 const format=new URL(request.url).searchParams.get("format")==="csv"?"csv":"json";
 if(isDemoUser(userId)){const data={user:{username:"Muse Guest",email:"demo@muse.local"},journals:[],exportDate:new Date().toISOString()};if(format==="csv"){return new Response("id,raw_thought,mood,tags,created_at\n",{headers:{ContentType:"text/csv","Content-Disposition":"attachment; filename=muse_export.csv"}})}return Response.json(data,{headers:{ "Content-Disposition":"attachment; filename=muse_export.json"}});}
 const [users,journals]=await Promise.all([queryDB("SELECT username,email,created_at FROM users WHERE id=$1",userId),queryDB("SELECT id,raw_thought,mood,tags,is_favorited,created_at,updated_at FROM journal_entries WHERE user_id=$1 ORDER BY created_at DESC",userId)]);
 const data={user:users[0],journals,exportDate:new Date().toISOString()};
 if(format==="csv"){const escape=(v:unknown)=>`"${String(v??"").replace(/"/g,'""')}"`;let csv="id,raw_thought,mood,tags,created_at\n";for(const row of journals){csv+=`${escape(row.id)},${escape(row.raw_thought)},${escape(row.mood)},${escape(Array.isArray(row.tags)?row.tags.join(","):row.tags)},${escape(row.created_at)}\n`;}return new Response(csv,{headers:{"Content-Type":"text/csv","Content-Disposition":"attachment; filename=muse_export.csv"}});}
 return Response.json(data,{headers:{"Content-Disposition":"attachment; filename=muse_export.json"}});
}}}});
