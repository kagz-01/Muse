function getEnv(name: string): string | undefined {
  if (typeof Deno !== "undefined" && Deno?.env?.get) {
    return Deno.env.get(name);
  }
  return undefined;
}

export const AI_ENGINE_URL = getEnv("AI_ENGINE_URL") ||
  "http://localhost:8000";
export const BLOCKCHAIN_URL = getEnv("BLOCKCHAIN_URL") ||
  "http://localhost:3000";

export interface AIInsightsResponse {
  status: string;
  patterns_detected?: string[];
  sentiment?: string;
  keywords?: string[];
  message?: string;
}

export interface BlockchainStoreResponse {
  status: string;
  arweave_hash?: string;
  solana_transaction_id?: string;
  message?: string;
}

export interface MintRewardResponse {
  status: string;
  tokens_minted?: number;
  recipient?: string;
  message?: string;
}

export async function storeJournalOnBlockchain(
  userId: string,
  content: string,
  publicKey: string,
): Promise<BlockchainStoreResponse> {
  try {
    const response = await fetch(`${BLOCKCHAIN_URL}/api/store-journal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        raw_content: content,
        user_public_key: publicKey,
      }),
    });

    if (!response.ok) {
      return {
        status: "error",
        message: `Blockchain request failed: ${response.status}`,
      };
    }

    return await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Blockchain Storage Error:", error);
    return { status: "error", message };
  }
}

export async function getAIInsights(
  content: string,
  userId = "anonymous",
): Promise<AIInsightsResponse> {
  try {
    const response = await fetch(`${AI_ENGINE_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      return {
        status: "error",
        message: `AI request failed: ${response.status}`,
      };
    }

    return await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("AI Engine Error:", error);
    return { status: "error", message };
  }
}

export async function mintReward(
  publicKey: string,
  action: string,
): Promise<MintRewardResponse> {
  try {
    const response = await fetch(`${BLOCKCHAIN_URL}/api/mint-reward`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_public_key: publicKey,
        action: action,
      }),
    });

    if (!response.ok) {
      return {
        status: "error",
        message: `Mint reward request failed: ${response.status}`,
      };
    }

    return await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Minting Error:", error);
    return { status: "error", message };
  }
}
