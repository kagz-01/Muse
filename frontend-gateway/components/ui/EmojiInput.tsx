import { useEffect, useRef, useState } from "preact/hooks";
import * as Icons from "lucide-preact";

declare global {
  namespace preact.JSX {
    interface IntrinsicElements {
      // deno-lint-ignore no-explicit-any
      "emoji-picker": Record<string, any>;
    }
  }
}

interface Props {
  value: string;
  onInput: (value: string) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
  iconLeft?: any;
  style?: Record<string, string | number>;
}

export default function EmojiInput({
  value,
  onInput,
  onKeyDown,
  placeholder,
  className = "",
  multiline = false,
  rows = 2,
  iconLeft,
  style,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const pickerRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically import the web component only on the client side
    // to avoid SSR errors (like missing requestAnimationFrame)
    import("emoji-picker-element").catch(console.error);

    const handleEmojiClick = (e: Event) => {
      const detail = (e as CustomEvent<{ unicode: string }>).detail;
      const emoji = detail.unicode;

      if (inputRef.current) {
        const input = inputRef.current;
        const start = input.selectionStart ?? value.length;
        const end = input.selectionEnd ?? value.length;

        const newValue = value.slice(0, start) + emoji + value.slice(end);
        onInput(newValue);

        // Restore cursor position after state update
        setTimeout(() => {
          input.focus();
          input.setSelectionRange(start + emoji.length, start + emoji.length);
        }, 0);
      } else {
        onInput(value + emoji);
      }

      setShowPicker(false);
    };

    const picker = pickerRef.current;
    if (picker) {
      picker.addEventListener("emoji-click", handleEmojiClick);
    }

    return () => {
      if (picker) {
        picker.removeEventListener("emoji-click", handleEmojiClick);
      }
    };
  }, [value, onInput]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = onKeyDown as any;

  return (
    <div className="relative w-full" ref={containerRef}>
      {iconLeft && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          {iconLeft}
        </div>
      )}

      {multiline
        ? (
          <textarea
            ref={inputRef as any}
            value={value}
            onInput={(e) => onInput((e.target as HTMLTextAreaElement).value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={rows}
            className={`${className} ${iconLeft ? "pl-10" : ""} pr-12`}
            style={style}
          />
        )
        : (
          <input
            ref={inputRef as any}
            type="text"
            value={value}
            onInput={(e) => onInput((e.target as HTMLInputElement).value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`${className} ${iconLeft ? "pl-10" : ""} pr-12`}
            style={style}
          />
        )}

      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className={`absolute right-4 text-gray-500 hover:text-white transition-colors flex items-center justify-center ${
          multiline ? "top-4" : "top-1/2 -translate-y-1/2"
        }`}
      >
        <Icons.Smile size={18} />
      </button>

      {showPicker && (
        <div className="absolute right-0 top-full mt-2 z-[200] shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-[#111318]">
          {/* @ts-expect-error Custom element */}
          <emoji-picker
            ref={pickerRef as any}
            class="dark"
            style="--background: #111318; --border-color: rgba(255,255,255,0.1); --indicator-color: #6366f1; --button-hover-background: rgba(255,255,255,0.05);"
          >
          </emoji-picker>
        </div>
      )}
    </div>
  );
}
