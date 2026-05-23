import { useState } from "preact/hooks";
import { Eye, EyeOff, Lock, X } from "lucide-preact";

interface VaultModalProps {
  isOpen: boolean;
  mode: "create" | "unlock";
  onClose: () => void;
  onSubmit: (password: string) => void;
  loading?: boolean;
  error?: string;
}

export function VaultModal({
  isOpen,
  mode,
  onClose,
  onSubmit,
  loading = false,
  error,
}: VaultModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password);
      setPassword("");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        class="bg-white/10 rounded-3xl border border-white/20 p-8 w-full max-w-md backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="bg-gradient-to-br from-amber-500 to-orange-600 rounded-full p-2.5">
              <Lock size={20} class="text-white" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-white">
                {mode === "create" ? "Create Vault" : "Unlock Vault"}
              </h2>
              <p class="text-sm text-white/60">
                {mode === "create"
                  ? "Protect this entry with a password"
                  : "Enter password to view this entry"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            class="p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <X size={20} class="text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} class="space-y-4">
          <div class="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) =>
                setPassword((e.target as HTMLInputElement).value)}
              placeholder="Enter password"
              class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-all"
              tabIndex={-1}
            >
              {showPassword
                ? <EyeOff size={18} class="text-white/60" />
                : <Eye size={18} class="text-white/60" />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div class="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
              <p class="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Password Tips */}
          {mode === "create" && (
            <div class="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p class="text-xs text-blue-300">
                💡 Use a strong, memorable password. This is stored locally
                only.
              </p>
            </div>
          )}

          {/* Actions */}
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              class="flex-1 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold transition-all disabled:opacity-50"
              disabled={loading || !password.trim()}
            >
              {loading
                ? "Processing..."
                : mode === "create"
                ? "Create Vault"
                : "Unlock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
