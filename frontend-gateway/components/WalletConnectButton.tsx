import { useState } from "preact/hooks";

export default function WalletConnectButton() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    // @ts-ignore - Phantom wallet injects solana object into window
    const provider = (globalThis as any).solana;
    if (provider?.isPhantom) {
      try {
        const resp = await provider.connect();
        setWalletAddress(resp.publicKey.toString());
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
