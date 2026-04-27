import { useState } from "preact/hooks";
import { updateProfile, userSignal } from "../signals/user.ts";

export default function WalletConnectButton() {
  const user = userSignal.value;
  const [walletAddress, setWalletAddress] = useState<string | null>(user?.walletAddress || null);

  const connectWallet = async () => {
    interface SolanaProvider {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
    }
    const provider = (globalThis as unknown as { solana: SolanaProvider }).solana;
    if (provider?.isPhantom) {
      try {
        const resp = await provider.connect();
        const address = resp.publicKey.toString();
        setWalletAddress(address);
        updateProfile({ walletAddress: address });
      } catch (_err) {
        console.error("User rejected request.");
      }
    } else {
      globalThis.open("https://phantom.app/", "_blank");
    }
  };

  return (
    <button
      type="button"
      onClick={connectWallet}
      class="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition"
    >
      {walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
    </button>
  );
}
