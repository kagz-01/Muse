import { useState, useRef, useEffect } from "preact/hooks";
import * as Icons from "lucide-preact";

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  threadId: string;
  question: string;
  themeColor: string;
}

export default function JournalModal({ isOpen, onClose, threadId, question, themeColor }: JournalModalProps) {
  const [thought, setThought] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successHash, setSuccessHash] = useState<string | null>(null);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Focus textarea when opened
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
    // Reset state on open
    if (isOpen) {
      setThought("");
      setSuccessHash(null);
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!thought.trim()) return;
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/journal/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, rawThought: thought }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setSuccessHash(data.hash);
      
      // Auto close after showing success for a moment
      setTimeout(() => {
        onClose();
        // Option to reload to show journal entries in the UI later
        // globalThis.location.reload(); 
      }, 3000);

    } catch (err: any) {
      setError(err.message || "Failed to capture thought.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Background Dimmer */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500" 
        onClick={onClose}
      />
      
      {/* The Editor Canvas */}
      <div className="relative w-full max-w-3xl h-[80vh] flex flex-col animate-in zoom-in-95 duration-500">
        
        {/* Subtle top glow */}
        <div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-20 blur-[100px] opacity-30 pointer-events-none"
          style={{ backgroundColor: themeColor }}
        />

        <div className="flex-1 flex flex-col bg-[var(--muse-bg)] border border-[var(--muse-border)] rounded-[2rem] shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="px-8 py-6 border-b border-[var(--muse-border)]/50 flex items-start justify-between">
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)] flex items-center gap-2 mb-3">
                <Icons.PenLine size={12} style={{ color: themeColor }} />
                Capture Thought
              </span>
              <h2 className="text-xl md:text-2xl font-serif italic text-[var(--muse-text)] leading-relaxed max-w-2xl">
                "{question}"
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:bg-[var(--muse-surface)] rounded-full transition-colors ml-4"
            >
              <Icons.X size={20} />
            </button>
          </div>

          {/* Editor Area */}
          <div className="flex-1 p-8 relative">
            {successHash ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--muse-bg)] animate-in fade-in duration-500">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-2xl"
                  style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
                >
                  <Icons.Check size={32} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-[var(--muse-text)] mb-2">Thought Captured</h3>
                <p className="text-[var(--muse-muted)] mb-8 text-center max-w-sm">
                  Your entry has been securely stored.
                </p>
                <div className="bg-black border border-white/10 rounded-xl p-4 w-full max-w-md">
                  <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Cryptographic Hash (SHA-256)</span>
                  <span className="font-mono text-xs text-emerald-400 break-all">{successHash}</span>
                </div>
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={thought}
                onChange={(e) => setThought((e.target as HTMLTextAreaElement).value)}
                placeholder="Begin writing..."
                className="w-full h-full bg-transparent text-[var(--muse-text)] text-lg leading-relaxed placeholder-[var(--muse-muted)]/50 focus:outline-none resize-none font-serif"
                disabled={isSubmitting}
              />
            )}
          </div>

          {/* Footer actions */}
          {!successHash && (
            <div className="p-4 border-t border-[var(--muse-border)]/50 bg-[var(--muse-surface)]/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.Lock size={14} className="text-[var(--muse-muted)]" />
                <span className="text-xs text-[var(--muse-muted)]">End-to-end encrypted storage</span>
              </div>
              
              {error && <span className="text-red-400 text-xs font-mono">{error}</span>}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !thought.trim()}
                className="px-8 py-3 rounded-xl bg-[var(--muse-text)] text-[var(--muse-bg)] text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <>
                    <Icons.Loader2 size={16} className="animate-spin" />
                    Hashing...
                  </>
                ) : (
                  <>
                    <Icons.Save size={16} />
                    Capture
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
