/// <reference path="../../../types/fresh.d.ts" />

import { FreshContext } from "$fresh/server.ts";
import { AI_ENGINE_URL, BLOCKCHAIN_URL } from "../../../utils/api.ts";

type ServiceName = "ai" | "blockchain";

interface ServiceHealth {
  status: "up" | "down";
  statusCode: number | null;
  endpoint: string;
}

async function probeService(endpoint: string): Promise<ServiceHealth> {
  try {
    const response = await fetch(endpoint, { method: "GET" });
    return {
      status: response.ok ? "up" : "down",
      statusCode: response.status,
      endpoint,
    };
  } catch {
    return {
      status: "down",
      statusCode: null,
      endpoint,
    };
  }
}

export const handler = async (
  _req: Request,
  _ctx: FreshContext,
): Promise<Response> => {
  const [ai, blockchain] = await Promise.all([
    probeService(`${AI_ENGINE_URL}/`),
    probeService(`${BLOCKCHAIN_URL}/`),
  ]);

  const services: Record<ServiceName, ServiceHealth> = {
    ai,
    blockchain,
  };

  return new Response(
    JSON.stringify({
      status: ai.status === "up" && blockchain.status === "up"
        ? "healthy"
        : "degraded",
      checkedAt: new Date().toISOString(),
      services,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
};
