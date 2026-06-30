/// <reference path="../../../types/fresh.d.ts" />

import { Handlers } from "$fresh/server.ts";
import { generatePersonalityGreeting } from "../../../utils/ai.ts";
import { type GreetingPeriod } from "../../../utils/dynamicHumor.ts";

interface Body {
  period: GreetingPeriod;
  streak: number;
  resonanceScore: number;
  entries: number;
  rooms: number;
  threads: number;
}

export const handler: Handlers = {
  async POST(req) {
    const body = await req.json().catch(() => null) as Body | null;
    if (!body) {
      return new Response("Invalid request payload", { status: 400 });
    }

    const { period, streak, resonanceScore, entries, rooms, threads } = body;
    if (!period || !["morning", "afternoon", "evening"].includes(period)) {
      return new Response("Invalid period", { status: 400 });
    }

    const greeting = await generatePersonalityGreeting(
      period,
      Number(streak) || 0,
      Number(resonanceScore) || 0,
      Number(entries) || 0,
      Number(rooms) || 0,
      Number(threads) || 0,
    );

    return Response.json({ greeting });
  },
};
