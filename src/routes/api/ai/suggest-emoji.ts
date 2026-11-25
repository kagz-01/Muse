import { createFileRoute } from "@tanstack/react-router";
export const Route=createFileRoute("/api/ai/suggest-emoji")({server:{handlers:{POST:async({request})=>{
 const body=await request.json().catch(()=>null) as Record<string,unknown>|null;const sentence=typeof body?.sentence==="string"?body.sentence.toLowerCase():"";if(!sentence)return new Response("Sentence is required",{status:400});const emojis=["✨"];if(sentence.includes("love"))emojis.push("💗");if(sentence.includes("idea"))emojis.push("💡");if(sentence.includes("growth")||sentence.includes("progress"))emojis.push("🌱");if(sentence.includes("calm")||sentence.includes("peace"))emojis.push("🕊️");return Response.json({emojis:[...new Set(emojis)]});
}}}});
