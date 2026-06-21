import { useCallback, useEffect, useRef, useState } from "preact/hooks";

/**
 * useDraft — persist form state to localStorage as the user types.
 *
 * Usage:
 *   const { draft, updateDraft, clearDraft, hasDraft } = useDraft<MyForm>("room_draft");
 *
 * - `draft`        : the current saved draft (or null if none)
 * - `hasDraft`     : true when a non-empty draft exists on mount
 * - `updateDraft`  : call this with partial form state on every change
 * - `clearDraft`   : call on successful submit or manual discard
 */
export function useDraft<T extends Record<string, unknown>>(storageKey: string) {
  const [hasDraft, setHasDraft] = useState(false);
  const [draft, setDraft] = useState<T | null>(null);
  const saveTimer = useRef<number | null>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        // Only count it as a "real" draft if at least one meaningful field is set
        const hasContent = Object.values(parsed).some((v) =>
          typeof v === "string" ? v.trim().length > 0 :
          Array.isArray(v) ? v.length > 0 :
          false
        );
        if (hasContent) {
          setDraft(parsed);
          setHasDraft(true);
        }
      }
    } catch {
      // Ignore corrupt storage
    }
  }, [storageKey]);

  // Debounced save — batches rapid keystrokes into a single write
  const updateDraft = (partial: Partial<T>) => {
    setDraft((prev) => {
      const next = { ...(prev ?? {}), ...partial } as T;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = globalThis.setTimeout(() => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // Ignore storage quota errors
        }
      }, 400) as unknown as number;
      return next;
    });
  };

  const clearDraft = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setDraft(null);
    setHasDraft(false);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
  }, [storageKey]);

  return { draft, hasDraft, updateDraft, clearDraft };
}
