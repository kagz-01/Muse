export const AI_ENGINE_URL = Deno.env.get("AI_ENGINE_URL") || "http://localhost:8000";
export const BLOCKCHAIN_URL = Deno.env.get("BLOCKCHAIN_URL") || "http://localhost:3000";

export async function storeJournalOnBlockchain(userId: string, content: string, publicKey: string) {
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
    return await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Blockchain Storage Error:", error);
    return { status: "error", message };
  }
}

export async function getAIInsights(content: string) {
  try {
    const response = await fetch(`${AI_ENGINE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: content }),
    });
    return await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("AI Engine Error:", error);
    return { status: "error", message };
  }
}

export async function mintReward(publicKey: string, action: string) {
  try {
    const response = await fetch(`${BLOCKCHAIN_URL}/api/mint-reward`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_public_key: publicKey,
        action: action,
      }),
    });
    return await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Minting Error:", error);
    return { status: "error", message };
  }
}
