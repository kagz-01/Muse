import { Head } from "$fresh/runtime.ts";
import { PageProps } from "$fresh/server.ts";
import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";

export default function ResetPasswordPage({ url }: PageProps) {
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">
            Invalid Link
          </h1>
          <p className="text-gray-400 font-mono text-sm mb-6">
            The password reset link is malformed or missing data.
          </p>
          <a
            href="/"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg uppercase tracking-wider text-xs font-bold transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: password }),
      });

      const text = await response.text();

      if (!response.ok) {
        setErrorMsg(text || "Failed to reset password.");
      } else {
        setSuccessMsg(text);
        setTimeout(() => {
          globalThis.location.href = "/";
        }, 2000);
      }
    } catch (_err) {
      setErrorMsg("Network error connecting to Vault.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password | Muse</title>
      </Head>
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-canvas-primary/5 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 blur-[100px] rounded-full" />
        </div>

        <div className="w-full max-w-sm relative z-10 bg-[#050505] border border-white/10 rounded-[2rem] p-8 shadow-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white uppercase tracking-widest leading-tight">
              Secure<br />Reset
            </h1>
            <p className="text-gray-500 font-mono text-xs mt-2 truncate">
              For {email}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-lg">
              [ERROR]: {errorMsg}
            </div>
          )}

          {successMsg
            ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full mx-auto flex items-center justify-center text-emerald-400 mb-4">
                  <Icons.Check size={32} />
                </div>
                <p className="text-emerald-400 font-mono text-sm uppercase tracking-wider">
                  {successMsg}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Redirecting to login...
                </p>
              </div>
            )
            : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-gray-600">
                    <Icons.Lock size={12} /> New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) =>
                        setPassword((e.target as HTMLInputElement).value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-5 pr-12 py-4 text-white placeholder-gray-800 focus:outline-none focus:border-canvas-primary/40 focus:bg-white/[0.05] transition-all text-sm font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword
                        ? <Icons.EyeOff size={16} />
                        : <Icons.Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-gray-600">
                    <Icons.Lock size={12} /> Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword((e.target as HTMLInputElement).value)}
                    placeholder="••••••••"
                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-5 py-4 text-white placeholder-gray-800 focus:outline-none focus:border-canvas-primary/40 focus:bg-white/[0.05] transition-all text-sm font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full py-4 rounded-xl bg-white text-black font-bold uppercase tracking-[0.3em] text-[10px] hover:-translate-y-0.5 active:scale-95 transition-all overflow-hidden disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-canvas-primary/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isSubmitting ? "UPDATING..." : "CONFIRM NEW PASSWORD"}
                    {!isSubmitting && <Icons.ArrowRight size={14} />}
                  </span>
                </button>
              </form>
            )}
        </div>
      </div>
    </>
  );
}
