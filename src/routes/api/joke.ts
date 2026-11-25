import { createFileRoute } from "@tanstack/react-router";

export const Route=createFileRoute("/api/joke")({server:{handlers:{GET:async()=>Response.json({joke:"Why did the Muse room stay organized? It kept every signal in context."})}}});
