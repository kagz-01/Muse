import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../../server/auth";
import { executeDB } from "../../../server/db";
import { AI_ENGINE_URL } from "../../../server/services";

export const Route=createFileRoute("/api/artifacts/upload-document")({server:{handlers:{POST:async({request})=>{
 const userId=await getSessionUser(request);if(!userId)return new Response("Unauthorized",{status:401});if(isDemoUser(userId))return new Response("Demo users cannot upload documents",{status:403});
 let form:FormData;try{form=await request.formData()}catch{return new Response("Invalid multipart form",{status:400})}const roomId=form.get("roomId")?.toString();const file=form.get("file");if(!roomId||!(file instanceof File))return new Response("Room ID and File required",{status:400});
 try{const proxy=new FormData();proxy.append("file",file,file.name);const ai=await fetch(`${AI_ENGINE_URL}/api/upload-document`,{method:"POST",body:proxy});if(!ai.ok)return new Response(`AI Engine Error: ${await ai.text()}`,{status:ai.status});const scraped=await ai.json();const name=file.name.toLowerCase();let type="document";if(name.endsWith(".pdf"))type="pdf";else if(name.endsWith(".docx"))type="word";else if(name.endsWith(".xlsx")||name.endsWith(".csv"))type="spreadsheet";await executeDB("INSERT INTO artifacts(room_id,type,source_url,unstructured_data) VALUES($1,$2,$3,$4)",roomId,type,file.name,JSON.stringify(scraped));return Response.json({success:true,type});}catch(error){console.error("Document upload failed:",error);return new Response("Internal Server Error",{status:500})}
}}}});
