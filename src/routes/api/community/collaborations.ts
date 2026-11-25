import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../../server/auth";
import { queryDB } from "../../../server/db";

export const Route=createFileRoute("/api/community/collaborations")({server:{handlers:{GET:async({request})=>{
 const userId=await getSessionUser(request);
 if(isDemoUser(userId))return Response.json({collaborations:[{id:"collab-demo-1",title:"Launch a civic reflection pulse",description:"Convert this week's insights into a shared public stream.",circleName:"Local Politics Watch",participants:4,urgency:"High",actionLabel:"Open collaboration"}]});
 const circles=await queryDB("SELECT id,name,description,theme,member_count FROM circles ORDER BY member_count DESC LIMIT 4");
 const collaborations=circles.map(row=>{const count=Number(row.member_count||0);return{id:`collab-${row.id}`,title:`Start a shared inquiry in ${String(row.name)}`,description:`Invite thinkers into ${String(row.theme||"emergent").toLowerCase()} through a short active pulse across the circle.`,circleName:String(row.name),participants:Math.max(3,count||1),urgency:count>80?"High":count>30?"Medium":"Low",actionLabel:"Open collaboration"}});
 return Response.json({collaborations});
}}}});
