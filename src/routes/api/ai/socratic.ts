import { createFileRoute } from "@tanstack/react-router";
import process from "node:process";

export const Route=createFileRoute("/api/ai/socratic")({server:{handlers:{POST:async({request})=>{
 try{const body=await request.json() as Record<string,unknown>;const recentText=typeof body.recentText==="string"?body.recentText.trim():"";if(!recentText)return new Response(JSON.stringify({error:"Missing recentText"}),{status:400,headers:{"Content-Type":"application/json"}});
 const aiUrl=process.env.AI_ENGINE_URL||"https://muse-ai-engine.onrender.com";
 try{const r=await fetch(`${aiUrl}/api/socratic`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});if(r.ok){const d=await r.json() as Record<string,unknown>;if(typeof d.question==="string")return Response.json({question:d.question});}}catch{}
 return Response.json({question:`What is the strongest assumption beneath this signal: "${recentText.slice(0,160)}"?`});
 }catch(error){console.error("Socratic question failed:",error);return new Response(JSON.stringify({error:"Failed to generate socratic question"}),{status:500,headers:{"Content-Type":"application/json"}})}
}}}});
