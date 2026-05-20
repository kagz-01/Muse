import { useState } from "preact/hooks";
import { unlockVault } from "../../signals/rooms.ts";

export default function VaultUnlockModal({ roomId, onClose, onSuccess }: {
  roomId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const tryUnlock = async () => {
    setError("");
    try {
      const ok = await unlockVault(roomId, password);
      if (ok) {
        onSuccess();
        onClose();
      } else {
        setError("Incorrect password. Try again.");
      }
    } catch (err) {
      setError("Unlock failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl border border-[var(--muse-border)] bg-[var(--muse-surface)] p-6">
        <h3 className="text-lg font-bold">Unlock Vault</h3>
        <p className="mt-2 text-sm text-[var(--muse-muted)]">Enter the password to unlock this private room.</p>

        <input
          type="password"
          value={password}
          onInput={(e: any) => setPassword(e.target.value)}
          placeholder="Vault password"
          className="mt-4 w-full rounded-md border px-3 py-2 bg-transparent"
        />

        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md px-4 py-2 border">Cancel</button>
          <button onClick={tryUnlock} className="rounded-md bg-[var(--muse-text)] px-4 py-2 text-[var(--muse-bg)]">Unlock</button>
        </div>
      </div>
    </div>
  );
}
