import { useState } from "preact/hooks";

export default function WalletConnectButton() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    // @ts-ignore - Phantom wallet injects solana object into window
    const provider = window.solana;
    if (provider?.isPhantom) {
      try {
        const resp = await provider.connect();
        setWalletAddress(resp.publicKey.toString());
      } catch (err) {
        console.error("User rejected request.");
      }
    } else {
      window.open("https://phantom.app/", "_blank");
    }
  };

  return (
    <button
      onClick={connectWallet}
      class="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition"
    >
      {walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
    </button>
  );
}
