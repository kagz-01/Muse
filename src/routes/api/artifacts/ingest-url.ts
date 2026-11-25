import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../../server/auth";
import { executeDB } from "../../../server/db";
import { AI_ENGINE_URL } from "../../../server/services";
export const Route=createFileRoute("/api/artifacts/ingest-url")({server:{handlers:{POST:async({request})=>{
 const userId=await getSessionUser(request);if(!userId)return new Response("Unauthorized",{status:401});if(isDemoUser(userId))return new Response("Demo users cannot ingest URLs",{status:403});let body:Record<string,unknown>;try{body=await request.json() as Record<string,unknown>}catch{return new Response("Invalid JSON",{status:400})}const url=typeof body.url==="string"?body.url:"";const roomId=typeof body.roomId==="string"?body.roomId:"";if(!url||!roomId)return new Response("URL and Room ID required",{status:400});
 try{const r=await fetch(`${AI_ENGINE_URL}/api/scrape`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url})});if(!r.ok)return new Response(`AI Engine Error: ${await r.text()}`,{status:r.status});const scraped=await r.json() as Record<string,unknown>;const type=scraped.source==="youtube"?"youtube":scraped.source==="social"?"social":"url";await executeDB("INSERT INTO artifacts(room_id,type,source_url,unstructured_data) VALUES($1,$2,$3,$4)",roomId,type,url,JSON.stringify(scraped));return Response.json({success:true,type});}catch(error){console.error("URL ingestion failed:",error);return new Response("Internal Server Error",{status:500})}
}}}});
