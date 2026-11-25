import "dotenv/config";
import process from "node:process";

export const AI_ENGINE_URL = process.env.AI_ENGINE_URL ??
  "https://muse-ai-engine.onrender.com";
export const BLOCKCHAIN_URL = process.env.BLOCKCHAIN_URL ??
  "https://muse-blockchain-security.onrender.com";

export interface ServiceHealth {
  status: "up" | "down";
  statusCode: number | null;
  endpoint: string;
}

export async function probeService(endpoint: string): Promise<ServiceHealth> {
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
