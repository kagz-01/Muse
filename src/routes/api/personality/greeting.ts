import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser } from "../../../server/auth";
export const Route=createFileRoute("/api/personality/greeting")({server:{handlers:{GET:async({request})=>{const userId=await getSessionUser(request);const hour=new Date().getHours();const greeting=hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";return Response.json({greeting,user:!!userId})}}}});
