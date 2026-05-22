import * as Icons from "lucide-preact";
import { LinkMetadata } from "../../signals/synthesis.ts";

interface LinkPreviewProps {
  metadata: LinkMetadata;
  onClose?: () => void;
}

export default function LinkPreview({ metadata, onClose }: LinkPreviewProps) {
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return "Link";
    }
  };

  const getTypeIcon = (type: LinkMetadata["type"]) => {
    switch (type) {
      case "article":
        return <Icons.FileText size={16} />;
      case "image":
        return <Icons.Image size={16} />;
      case "video":
        return <Icons.Play size={16} />;
      case "document":
        return <Icons.File size={16} />;
      default:
        return <Icons.Link2 size={16} />;
    }
  };

  return (
    <div className="bg-[var(--muse-surface-bright)] rounded-xl border border-[var(--muse-border-light)] overflow-hidden hover:border-[var(--muse-border-active)] transition-colors">
      {/* Header with close button */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--muse-border-light)]">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[var(--muse-surface-soft)] rounded-lg">
            {getTypeIcon(metadata.type)}
          </div>
          <span className="text-xs font-semibold text-[var(--muse-text-muted)] uppercase tracking-wide">
            {getDomain(metadata.url)}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--muse-surface-soft)] rounded-lg transition-colors"
          >
            <Icons.X size={16} className="text-[var(--muse-text-muted)]" />
          </button>
        )}
      </div>

      {/* Image */}
      {metadata.image && (
        <div className="w-full h-40 overflow-hidden bg-[var(--muse-surface-soft)]">
          <img
            src={metadata.image}
            alt={metadata.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-[var(--muse-text)] mb-2 line-clamp-2">
          {metadata.title}
        </h3>

        <p className="text-sm text-[var(--muse-text-muted)] mb-4 line-clamp-2">
          {metadata.description || "No description available"}
        </p>

        {/* URL */}
        <div className="flex items-center gap-2 p-3 bg-[var(--muse-surface-soft)] rounded-lg mb-4">
          <Icons.Link2 size={14} className="text-[var(--muse-text-muted)] flex-shrink-0" />
          <a
            href={metadata.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--muse-accent)] hover:underline truncate"
          >
            {metadata.url}
          </a>
        </div>

        {/* Source badge */}
        <div className="text-xs text-[var(--muse-text-muted)]">
          <span className="inline-block px-2 py-1 bg-[var(--muse-surface-soft)] rounded">
            {metadata.source}
          </span>
        </div>
      </div>
    </div>
  );
}
