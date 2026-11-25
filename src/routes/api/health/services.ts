import { createFileRoute } from "@tanstack/react-router";
import {
  AI_ENGINE_URL,
  BLOCKCHAIN_URL,
  probeService,
  type ServiceHealth,
} from "../../../server/services";

export const Route = createFileRoute("/api/health/services")({
  server: {
    handlers: {
      GET: async () => {
        const [ai, blockchain] = await Promise.all([
          probeService(`${AI_ENGINE_URL}/`),
          probeService(`${BLOCKCHAIN_URL}/`),
        ]);
        const services: Record<"ai" | "blockchain", ServiceHealth> = {
          ai,
          blockchain,
        };

        return Response.json({
          status: ai.status === "up" && blockchain.status === "up"
            ? "healthy"
            : "degraded",
          checkedAt: new Date().toISOString(),
          services,
        });
      },
    },
  },
});
