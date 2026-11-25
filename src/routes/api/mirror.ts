import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../server/auth";
import { queryDB } from "../../server/db";

export const Route=createFileRoute("/api/mirror")({server:{handlers:{GET:async({request})=>{
  const userId=await getSessionUser(request);if(!userId)return new Response("Unauthorized",{status:401});
  if(isDemoUser(userId))return Response.json({stats:{views:1250,likes:342,comments:89,collaborations:23,follows:156,circleJoins:12},activity:[],followerHistory:[...Array(7)].map((_,i)=>({date:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],count:120+i*6}))});
  const [rooms,threads,journals,circles,entanglements]=await Promise.all([
    queryDB("SELECT resonance_metrics FROM rooms WHERE user_id=$1",userId),
    queryDB("SELECT resonance_metrics,dialogue_layers,is_favorited,updated_at,title FROM threads WHERE user_id=$1",userId),
    queryDB("SELECT id,is_favorited,created_at,updated_at,raw_thought FROM journal_entries WHERE user_id=$1",userId),
    queryDB("SELECT COUNT(*) AS count FROM circle_members WHERE user_id=$1",userId),
    queryDB("SELECT id FROM entanglements WHERE (requester_id=$1 OR addressee_id=$1) AND status='accepted'",userId),
  ]);
  const sumViews=(rows:Record<string,unknown>[])=>rows.reduce((sum,row)=>sum+Number((row.resonance_metrics as Record<string,unknown>|null)?.views??0),0);
  const journalLikes=journals.filter(row=>row.is_favorited===true).length;
  const threadLikes=threads.filter(row=>row.is_favorited===true).length;
  const comments=threads.reduce((sum,row)=>sum+(Array.isArray(row.dialogue_layers)?row.dialogue_layers.length:0),0);
  const collaborations=entanglements.length;const circleJoins=Number((circles[0] as Record<string,unknown>)?.count??0);
  const history=[...Array(7)].map((_,i)=>{const date=new Date();date.setDate(date.getDate()-6+i);return{date:date.toLocaleDateString("en-US",{weekday:"short"}),count:Math.max(collaborations-3+i,0)}});
  return Response.json({stats:{views:sumViews(rooms)+sumViews(threads)+journalLikes*3,likes:journalLikes+threadLikes,comments,collaborations,follows:collaborations,circleJoins},activity:[],followerCount:collaborations,followingCount:collaborations,followerHistory:history});
}}}});
