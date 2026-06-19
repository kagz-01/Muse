import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEME_COLORS = [
  "#10b981", // Emerald
  "#8b5cf6", // Violet
  "#3b82f6", // Blue
  "#f43f5e", // Rose
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#71717a", // Zinc (Neutral)
];

export default function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0]);
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("theme_color", themeColor);
      formData.append("tags", tags);

      const response = await fetch("/api/rooms/create", {
        method: "POST",
        body: formData,
        redirect: "manual",
      });

      if (!response.ok && response.type !== "opaqueredirect") {
        const text = await response.text();
        setError(text || "Failed to create Room");
        setIsSubmitting(false);
        return;
      }

      // Success, refresh the page to show the new room
      globalThis.location.reload();
    } catch (err) {
      setError("Network error.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[var(--muse-bg)] border border-[var(--muse-border)] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--muse-border)] flex items-center justify-between bg-[var(--muse-surface)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--muse-bg)] border border-[var(--muse-border)] flex items-center justify-center text-[var(--muse-text)]">
              <Icons.LayoutGrid size={16} />
            </div>
            <h2 className="text-lg font-bold">Initialize Room</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-colors rounded-full hover:bg-[var(--muse-bg)]">
            <Icons.X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-lg">
              [ERROR]: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)] mb-2">
                Room Designation
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
                placeholder="e.g. Stoic Philosophy, Quantum Physics..."
                className="w-full bg-[var(--muse-surface)] border border-[var(--muse-border)] rounded-xl px-4 py-3 text-[var(--muse-text)] placeholder-[var(--muse-muted)] focus:outline-none focus:border-canvas-primary/50 transition-colors font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)] mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
                placeholder="What knowledge will be synthesized here?"
                rows={3}
                className="w-full bg-[var(--muse-surface)] border border-[var(--muse-border)] rounded-xl px-4 py-3 text-[var(--muse-text)] placeholder-[var(--muse-muted)] focus:outline-none focus:border-canvas-primary/50 transition-colors resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)] mb-2">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags((e.target as HTMLInputElement).value)}
                placeholder="e.g. philosophy, personal, research"
                className="w-full bg-[var(--muse-surface)] border border-[var(--muse-border)] rounded-xl px-4 py-3 text-[var(--muse-text)] placeholder-[var(--muse-muted)] focus:outline-none focus:border-canvas-primary/50 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)] mb-3">
                Theme Resonance
              </label>
              <div className="flex flex-wrap gap-3">
                {THEME_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setThemeColor(color)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${themeColor === color ? 'ring-2 ring-offset-2 ring-offset-[var(--muse-bg)]' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color, ringColor: color }}
                  >
                    {themeColor === color && <Icons.Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--muse-border)] mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-[var(--muse-text)] text-[var(--muse-bg)] font-bold uppercase tracking-[0.2em] text-[10px] hover:-translate-y-0.5 transition-transform disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_var(--muse-text)]/10"
              >
                {isSubmitting ? "Initializing..." : "Create Room"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
