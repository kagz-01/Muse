// Web Crypto API is native to Deno and modern browsers.
// We use SHA-256 for creating determinist hashes for the blockchain ledger.

/**
 * Generates a SHA-256 hash of a given text.
 * The hash is returned as a lowercase hexadecimal string.
 * This acts as the cryptographic proof of the journal entry.
 */
export async function generateBlockchainHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  // Hash the data using SHA-256
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  
  // Convert the ArrayBuffer to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  
  return hashHex;
}
