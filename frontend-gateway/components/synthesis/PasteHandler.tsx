import { useEffect, useRef } from "preact/hooks";
import { parseLink, synthesisSignal } from "../../signals/synthesis.ts";

interface PasteHandlerProps {
  onLinkDetected?: (url: string) => void;
  onSynthesisOpen?: () => void;
}

/**
 * PasteHandler component detects pasted links and triggers synthesis dialog.
 * Add this to any component where you want to enable link pasting.
 */
export default function PasteHandler({
  onLinkDetected,
  onSynthesisOpen,
}: PasteHandlerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const text = event.clipboardData?.getData("text/plain");

      if (!text) return;

      // Check if pasted text is a URL
      try {
        const url = new URL(text);
        event.preventDefault();

        onLinkDetected?.(text);

        // Parse the link
        await parseLink(text);

        // Trigger synthesis dialog
        onSynthesisOpen?.();
      } catch {
        // Not a valid URL, let default paste behavior continue
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("paste", handlePaste);
      return () => container.removeEventListener("paste", handlePaste);
    }
  }, [onLinkDetected, onSynthesisOpen]);

  return (
    <div
      ref={containerRef}
      className="contents"
      title="Paste links here to synthesize artifacts"
    />
  );
}
