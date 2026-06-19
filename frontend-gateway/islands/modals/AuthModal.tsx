import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { login } from "../../signals/user.ts";

interface AuthModalProps {
  initialMode: "signup" | "login";
  onClose: () => void;
}

export default function AuthModal({ initialMode, onClose }: AuthModalProps) {
  const [localMode, setLocalMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsSyncing(true);
    setErrorMsg("");

    const endpoint = localMode === "signup" ? "/api/auth/register" : "/api/auth/login";
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    if (localMode === "signup") formData.append("username", name);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        redirect: "manual", // We handle redirect so we can show success state
      });

      if (!response.ok && response.type !== "opaqueredirect") {
        const text = await response.text();
        setErrorMsg(text || "Authentication failed");
        setIsSyncing(false);
        return;
      }

      // Cinematic sync effect on success
      setIsSyncing(false);
      setIsSuccess(true);
      setTimeout(() => {
        login(email);
        globalThis.location.href = "/dashboard";
      }, 1000);
    } catch (err) {
      setErrorMsg("Network error connecting to Vault.");
      setIsSyncing(false);
    }
  };

  const handleDemoEntry = () => {
    setIsSyncing(true);
    setTimeout(() => {
      login("demo@muse.app");
      globalThis.location.href = "/dashboard?demo=1";
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/95 backdrop-blur-3xl transition-opacity animate-in fade-in duration-500"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm z-10 animate-in zoom-in-95 duration-500">
        {/* SCANNING OVERLAY */}
        <div className="absolute inset-x-0 h-1 bg-canvas-primary blur-md z-30 pointer-events-none animate-[scan_2s_linear_infinite]" />

        <div className="relative bg-[#050505] border border-white/10 rounded-[2rem] p-6 md:p-8 overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
          {/* DECORATIVE SPECTRUM */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-canvas-primary/10 blur-[100px] rounded-full animate-pulse" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/5 blur-[100px] rounded-full" />

          <button
            onClick={onClose}
            type="button"
            className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all cursor-pointer z-50 hover:rotate-90"
          >
            <Icons.X size={20} />
          </button>

          <div className="relative z-10">
            {/* TERMINAL HEADER */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-black font-bold text-xl shadow-2xl animate-[spin-y_4s_linear_infinite] [transform-style:preserve-3d]">
                <Icons.Infinity size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-canvas-primary uppercase tracking-[0.5em] leading-none mb-1.5">
                  Welcome
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-white leading-none uppercase">
                  {isSuccess
                    ? "Verified"
                    : localMode === "signup"
                    ? "Get Started"
                    : "Login"}
                </h2>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-lg animate-in fade-in duration-300">
                [ERROR]: {errorMsg}
              </div>
            )}

            {isSuccess
              ? (
                <div className="py-20 text-center space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 rounded-full mx-auto flex items-center justify-center text-emerald-400">
                    <Icons.Zap size={40} className="fill-emerald-400" />
                  </div>
                  <p className="text-xl font-serif italic text-gray-400">
                    Connecting to your cognitive vault...
                  </p>
                </div>
              )
              : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {localMode === "signup" && (
                    <div className="space-y-2.5 group animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-100">
                      <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-gray-600 group-focus-within:text-canvas-primary transition-colors">
                        <Icons.User size={12} /> Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) =>
                          setName((e.target as HTMLInputElement).value)}
                        placeholder="ENTER IDENTITY"
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-5 py-4 text-white placeholder-gray-800 focus:outline-none focus:border-canvas-primary/40 focus:bg-white/[0.05] transition-all text-sm font-mono tracking-widest"
                      />
                    </div>
                  )}

                  <div className="space-y-2.5 group animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-200">
                    <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-gray-600 group-focus-within:text-canvas-primary transition-colors">
                      <Icons.Mail size={12} /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) =>
                        setEmail((e.target as HTMLInputElement).value)}
                      placeholder="EMAIL@MUSE.SYSTEM"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-5 py-4 text-white placeholder-gray-800 focus:outline-none focus:border-canvas-primary/40 focus:bg-white/[0.05] transition-all text-sm font-mono tracking-widest"
                    />
                  </div>

                  <div className="space-y-2.5 group animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-300">
                    <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-gray-600 group-focus-within:text-canvas-primary transition-colors">
                      <Icons.Lock size={12} /> Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) =>
                        setPassword((e.target as HTMLInputElement).value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-5 py-4 text-white placeholder-gray-800 focus:outline-none focus:border-canvas-primary/40 focus:bg-white/[0.05] transition-all text-sm font-mono"
                    />
                  </div>

                  <div className="pt-2 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-500">
                    <button
                      type="submit"
                      disabled={isSyncing}
                      className="group relative w-full py-4 rounded-xl bg-white text-black font-bold uppercase tracking-[0.3em] text-[10px] shadow-[0_15px_30px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 hover:shadow-white/20 active:scale-95 transition-all cursor-pointer overflow-hidden disabled:opacity-50"
                    >
                      <div className="absolute inset-0 bg-canvas-primary/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {isSyncing
                          ? "AUTHENTICATING..."
                          : localMode === "signup"
                          ? "GET STARTED"
                          : "LOGIN"}
                        {!isSyncing && <ArrowRight size={14} />}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDemoEntry}
                      className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-gray-500 font-bold uppercase tracking-[0.2em] text-[9px] hover:bg-white/10 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-3 active:scale-95"
                    >
                      <Icons.Activity size={14} /> Continue as Guest
                    </button>
                  </div>
                </form>
              )}

            {!isSuccess && (
              <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-[600ms]">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                  <Icons.Shield size={12} className="text-gray-600" />
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    End-to-End Encryption Active
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
        @keyframes scan {
          0% { transform: translateY(-100vh); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes spin-y {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
      `}
      </style>
    </div>
  );
}

function ArrowRight({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  );
}
