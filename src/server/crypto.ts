import { createHash } from "node:crypto";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function generateBlockchainHash(content: string): Promise<string> {
  return createHash("sha256").update(content).digest("hex");
}
