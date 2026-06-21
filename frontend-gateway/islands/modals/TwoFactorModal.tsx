import { useState, useEffect } from "preact/hooks";
import * as Icons from "lucide-preact";
import QRCode from "qrcode";

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  themeColor: string;
}

export default function TwoFactorModal({ isOpen, onClose, onSuccess, themeColor }: TwoFactorModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError("");
      setToken("");
      fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate" }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to generate 2FA secret");
          return res.json();
        })
        .then(async (data) => {
          setSecret(data.secret);
          const url = await QRCode.toDataURL(data.otpauthUrl, {
            color: { dark: "#000000", light: "#ffffff" },
            margin: 2,
            width: 200,
          });
          setQrCodeDataUrl(url);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (token.length < 6) return;
    setIsVerifying(true);
    setError("");

    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", token, secret }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      onSuccess();
    } catch (err: unknown) {
      setError((err as Error).message || "Invalid code");
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      {/* Background Dimmer */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md flex flex-col bg-[var(--muse-bg)] border border-[var(--muse-border)] rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Subtle top glow */}
        <div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-20 blur-[100px] opacity-30 pointer-events-none"
          style={{ backgroundColor: themeColor }}
        />

        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--muse-border)]/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${themeColor}20` }}
            >
              <Icons.ShieldCheck size={20} style={{ color: themeColor }} />
            </div>
            <h2 className="text-lg font-bold text-[var(--muse-text)] tracking-tight">Enable 2FA</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:bg-[var(--muse-surface)] rounded-full transition-colors"
          >
            <Icons.X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center gap-4">
              <Icons.Loader2 size={32} className="animate-spin" style={{ color: themeColor }} />
              <p className="text-sm text-[var(--muse-muted)]">Generating secure keys...</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-[var(--muse-muted)] text-center mb-6">
                Scan this QR code with Google Authenticator, Authy, or any compatible TOTP app.
              </p>
              
              {qrCodeDataUrl && (
                <div className="bg-white p-2 rounded-2xl shadow-xl mb-6">
                  <img src={qrCodeDataUrl} alt="2FA QR Code" className="w-[200px] h-[200px]" />
                </div>
              )}

              <div className="w-full space-y-4">
                <div className="relative">
                  <Icons.KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muse-muted)]" />
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken((e.target as HTMLInputElement).value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full bg-[var(--muse-surface)] border border-[var(--muse-border)] rounded-xl py-3 pl-12 pr-4 text-[var(--muse-text)] focus:outline-none focus:border-[var(--theme-color)] transition-colors text-center tracking-[0.5em] font-mono text-lg"
                    style={{ "--theme-color": themeColor } as Record<string, string>}
                  />
                </div>

                {error && <p className="text-red-400 text-xs font-mono text-center">{error}</p>}

                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isVerifying || token.length < 6}
                  className="w-full py-3 rounded-xl bg-[var(--muse-text)] text-[var(--muse-bg)] text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isVerifying ? (
                    <Icons.Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Verify & Enable"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
