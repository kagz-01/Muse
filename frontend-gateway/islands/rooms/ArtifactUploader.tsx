import { useRef, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { openCapture } from "../../signals/ui.ts";

interface ArtifactUploaderProps {
  roomId: string;
  themeColor: string;
}

export default function ArtifactUploader(
  { roomId, themeColor }: ArtifactUploaderProps,
) {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispatchArtifactAdded = (artifact: {
    roomId: string;
    id: string;
    type: string;
    source_url: string;
    created_at: string;
  }) => {
    window.dispatchEvent(
      new CustomEvent("muse:artifact-added", { detail: artifact }),
    );
  };

  const handleUrlSubmit = async (e: Event) => {
    e.preventDefault();
    if (!url) return;

    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/artifacts/ingest-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, roomId }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      dispatchArtifactAdded({
        roomId,
        id: `artifact-${Date.now()}`,
        type: data.type || "url",
        source_url: url,
        created_at: new Date().toISOString(),
      });
      setUrl("");
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || "Failed to ingest URL");
      setIsProcessing(false);
    }
  };

  const uploadFile = async (file: File) => {
    setIsProcessing(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("roomId", roomId);
      formData.append("mimeType", file.type || "application/octet-stream");

      const response = await fetch("/api/artifacts/upload-document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      globalThis.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to upload document");
      setIsProcessing(false);
    }
  };

  const openCaptureFlow = (kind: "photo" | "video" | "audio") => {
    openCapture(roomId, kind);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: any) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="mb-8 space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-lg">
          [ERROR]: {error}
        </div>
      )}

      {/* URL Ingestion Form */}
      <form onSubmit={handleUrlSubmit} className="relative group">
        <div
          className="absolute inset-0 bg-canvas-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ backgroundColor: `${themeColor}20` }}
        />
        <div className="relative flex items-center bg-[var(--muse-surface)] border border-[var(--muse-border)] focus-within:border-white/20 rounded-2xl p-2 transition-all shadow-xl">
          <div className="pl-3 pr-2 text-[var(--muse-muted)]">
            <Icons.Link size={18} />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl((e.target as HTMLInputElement).value)}
            disabled={isProcessing}
            placeholder="Paste Twitter link, YouTube URL, or Blog article..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-[var(--muse-text)] placeholder-[var(--muse-muted)]"
          />
          <button
            type="submit"
            disabled={isProcessing || !url}
            className="px-4 py-2 bg-[var(--muse-bg)] border border-[var(--muse-border)] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 active:scale-95 transition-all disabled:opacity-50"
            style={{ color: themeColor }}
          >
            {isProcessing ? "Engulfing..." : "Engulf"}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => openCaptureFlow("photo")}
          className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--muse-border)] bg-[var(--muse-surface)] px-3 py-2 text-xs font-bold uppercase tracking-widest text-[var(--muse-text)] hover:border-white/20 transition-all"
        >
          <Icons.Camera size={16} />
          Photo
        </button>
        <button
          type="button"
          onClick={() => openCaptureFlow("video")}
          className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--muse-border)] bg-[var(--muse-surface)] px-3 py-2 text-xs font-bold uppercase tracking-widest text-[var(--muse-text)] hover:border-white/20 transition-all"
        >
          <Icons.Video size={16} />
          Video
        </button>
        <button
          type="button"
          onClick={() => openCaptureFlow("audio")}
          className="col-span-2 flex items-center justify-center gap-2 rounded-2xl border border-[var(--muse-border)] bg-[var(--muse-surface)] px-3 py-2 text-xs font-bold uppercase tracking-widest text-[var(--muse-text)] hover:border-white/20 transition-all"
        >
          <Icons.Mic2 size={16} />
          Audio
        </button>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
          isDragging
            ? "bg-white/5 border-white/40 scale-[1.02]"
            : "border-[var(--muse-border)] hover:border-white/20 hover:bg-white/[0.02]"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) uploadFile(file);
          }}
          accept="image/*,video/*,audio/*,.pdf,.docx,.xlsx,.csv,.txt"
        />
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-[var(--muse-surface)] border border-[var(--muse-border)] shadow-xl"
          style={{ color: themeColor }}
        >
          {isProcessing
            ? <Icons.Loader2 size={20} className="animate-spin" />
            : <Icons.Upload size={20} />}
        </div>
        <p className="text-sm font-bold text-[var(--muse-text)] mb-1">
          {isProcessing ? "Synthesizing Document..." : "Drop Document Here"}
        </p>
        <p className="text-xs text-[var(--muse-muted)]">
          Supports images, video, audio, PDF, Word, Excel, and text files
        </p>
      </div>
    </div>
  );
}
