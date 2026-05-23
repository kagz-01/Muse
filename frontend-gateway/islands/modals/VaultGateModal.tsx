import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  attemptUnlockVault,
  hasMasterPasswordSignal,
  setupMasterVault,
} from "../../signals/vault.ts";

interface VaultGateModalProps {
  onUnlock: () => void;
  onClose: () => void;
}

export default function VaultGateModal({
  onUnlock,
  onClose,
}: VaultGateModalProps) {
  const isSetup = !hasMasterPasswordSignal.value;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    globalThis.addEventListener("keydown", handler);
    return () => globalThis.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");

    if (isSetup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setIsLoading(true);

    try {
      if (isSetup) {
        await setupMasterVault(password);
        onUnlock();
      } else {
        const success = await attemptUnlockVault(password);
        if (success) {
          onUnlock();
        } else {
          setError("Incorrect master password. Try again.");
          setPassword("");
        }
      }
    } catch (_err) {
      setError("An error occurred accessing the vault.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300"
    >
      <div className="bg-[#111318] border border-white/10 rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-[#111318] p-8 border-b border-white/5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-4 mb-3 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Icons.Lock size={26} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {isSetup ? "Initialize Vault" : "Vault Locked"}
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                {isSetup ? "Set Master Password" : "Enter Master Password"}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Master Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onInput={(e) => {
                    setPassword((e.target as HTMLInputElement).value);
                    setError("");
                  }}
                  placeholder={isSetup
                    ? "Create a master password"
                    : "Enter your master password"}
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-all font-mono"
                  autoFocus
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showPassword
                    ? <Icons.EyeOff size={18} />
                    : <Icons.Eye size={18} />}
                </button>
              </div>
            </div>

            {isSetup && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onInput={(e) => {
                    setConfirmPassword((e.target as HTMLInputElement).value);
                    setError("");
                  }}
                  placeholder="Confirm your master password"
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-all font-mono"
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <Icons.AlertTriangle
                size={18}
                className="text-rose-400 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-rose-300 font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-[1] py-4 rounded-2xl border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all cursor-pointer disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-4 rounded-2xl bg-white text-black text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-50"
              disabled={!password || (isSetup && !confirmPassword) || isLoading}
            >
              {isLoading
                ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                )
                : (
                  <>
                    <Icons.Key size={16} />
                    {isSetup ? "Initialize Vault" : "Unlock"}
                  </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
