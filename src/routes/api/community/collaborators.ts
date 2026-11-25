import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../../server/auth";
import { queryDB } from "../../../server/db";

export const Route=createFileRoute("/api/community/collaborators")({server:{handlers:{GET:async({request})=>{
 const userId=await getSessionUser(request);
 if(isDemoUser(userId))return Response.json({collaborators:[{id:"demo-collaborator",name:"Muse Explorer",avatar:"https://api.dicebear.com/7.x/avataaars/svg?seed=Muse",role:"Systems thinker",status:"Reflecting",bio:"Explores connections across ideas.",sharedThemes:["Design","AI"],matchPercentage:82,matchReason:"Shared interest in systems and synthesis.",topCitedNode:"Mental Models"}]});
 if(!userId)return new Response("Unauthorized",{status:401});
 const users=await queryDB("SELECT u.id,u.username,u.avatar_url FROM users u WHERE u.id<>$1 LIMIT 10",userId);
 const collaborators=users.map((row,index)=>({id:row.id,name:row.username||String(row.id).slice(0,8),avatar:row.avatar_url||`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.username||row.id}`,role:"Muse collaborator",status:["Online","Reflecting","Deep Focus","Offline"][index%4],bio:"A Muse community collaborator.",sharedThemes:["Ideas","Synthesis"],aura:"#6366f1",intelligenceProfile:"Systems thinker",matchPercentage:60+(index%30),matchReason:"Potential thematic overlap across public Muse signals.",topCitedNode:"Mental Models"}));
 return Response.json({collaborators});
}}}});
