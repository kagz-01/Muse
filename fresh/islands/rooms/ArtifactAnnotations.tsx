import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { annotateItem, fetchAnnotations, Item } from "../../signals/items.ts";

interface Props {
  item: Item;
  theme: {
    bg: string;
    text: string;
    border: string;
  };
}

export default function ArtifactAnnotations({ item, theme }: Props) {
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationText, setAnnotationText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch annotations on mount
    fetchAnnotations(item.id);
  }, [item.id]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!annotationText.trim()) return;

    setIsSubmitting(true);
    try {
      await annotateItem(item.id, annotationText);
      setAnnotationText("");
      setIsAnnotating(false);
    } catch (err) {
      console.error(err);
      alert("Failed to post annotation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-[var(--muse-text)]/5">
      {item.annotations && item.annotations.length > 0 && (
        <div className="space-y-3 mb-4 max-h-[150px] overflow-y-auto no-scrollbar pr-2">
          <h5 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--muse-muted)] mb-2 flex items-center gap-1.5">
            <Icons.MessagesSquare size={10} /> Parallel Annotations
          </h5>
          {item.annotations.map(ann => (
            <div key={ann.id} className="flex gap-2.5 items-start bg-[var(--muse-text)]/5 p-3 rounded-[1rem] hover:bg-[var(--muse-text)]/10 transition-colors">
              <img src={ann.authorAvatar} alt="" className="w-5 h-5 rounded-full shrink-0 border border-[var(--muse-text)]/10" />
              <div>
                <div className="text-[8px] uppercase font-bold text-[var(--muse-muted)] tracking-widest mb-0.5">{ann.authorName}</div>
                <p className="text-xs text-[var(--muse-text)] font-serif italic leading-relaxed opacity-90">"{ann.annotation}"</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAnnotating ? (
        <form onSubmit={handleSubmit} className="relative mt-3 animate-in fade-in zoom-in-95 duration-200">
          <textarea
            value={annotationText}
            onInput={(e) => setAnnotationText((e.target as HTMLTextAreaElement).value)}
            placeholder="Add your parallel insight..."
            className={`w-full bg-[var(--muse-text)]/5 border border-[var(--muse-text)]/10 rounded-[1rem] p-3 text-xs text-[var(--muse-text)] font-serif italic focus:outline-none focus:border-[var(--muse-text)]/30 transition-colors min-h-[60px] resize-none ${theme.text}`}
            disabled={isSubmitting}
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setIsAnnotating(false)}
              className="px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !annotationText.trim()}
              className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-[var(--muse-text)]/10 text-[var(--muse-text)] hover:bg-[var(--muse-text)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
            >
              {isSubmitting ? <Icons.RefreshCcw size={10} className="animate-spin" /> : <Icons.Send size={10} />}
              Post
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAnnotating(true)}
          className="w-full py-2.5 rounded-[1rem] border border-dashed border-[var(--muse-text)]/20 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:bg-[var(--muse-text)]/5 hover:border-[var(--muse-text)]/40 transition-all flex items-center justify-center gap-2"
        >
          <Icons.Plus size={12} /> Add Parallel Annotation
        </button>
      )}
    </div>
  );
}
