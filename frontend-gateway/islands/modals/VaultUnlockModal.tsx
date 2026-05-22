import { h } from "preact";
import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { unlockVaultThread } from "../../signals/threads.ts";

interface ThreadVaultUnlockModalProps {
  threadId: string;
  threadTitle: string;
  onUnlock: () => void;
  onClose: () => void;
}

export default function ThreadVaultUnlockModal({
  threadId,
  threadTitle,
  onUnlock,
  onClose,
}: ThreadVaultUnlockModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = async (e: Event) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (unlockVaultThread(threadId, password)) {
      setIsLoading(false);
      onUnlock();
    } else {
      setError("Incorrect password. Try again.");
      setPassword("");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-indigo-200/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Icons.Lock size={24} className="text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Vault Locked
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This is a private synthesis thread
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleUnlock} className="p-6 space-y-4">
          {/* Thread info */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              Thread
            </p>
            <p className="font-semibold text-slate-900 dark:text-white truncate">
              {threadTitle}
            </p>
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Vault Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onInput={(e) => {
                  setPassword((e.target as HTMLInputElement).value);
                  setError("");
                }}
                placeholder="Enter password to unlock"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                autoFocus
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <Icons.EyeOff size={20} />
                ) : (
                  <Icons.Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-start gap-2">
              <Icons.AlertCircle
                size={18}
                className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={!password || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Unlocking...
                </>
              ) : (
                <>
                  <Icons.Unlock size={18} />
                  Unlock Vault
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer tip */}
        <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-3 text-xs text-slate-600 dark:text-slate-400">
          💡 <span className="font-medium">Tip:</span> Only you can unlock this
          private synthesis thread with your password.
        </div>
      </div>
    </div>
  );
}
