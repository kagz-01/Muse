import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { JournalEntry } from "../../signals/journal.ts";
import {
  getExportStats,
  triggerExport,
} from "../../components/journal/ExportUtils.ts";

interface ExportModalProps {
  entries: JournalEntry[];
  onClose: () => void;
}

export function ExportModal({ entries, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<"markdown" | "pdf" | "docx">("markdown");
  const [loading, setLoading] = useState(false);

  const stats = getExportStats(entries, {
    format,
    includeVaulted: false,
  });

  const handleExport = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        triggerExport(entries, {
          format,
          includeVaulted: false,
        });
      } finally {
        setLoading(false);
        onClose();
      }
    }, 300);
  };

  return (
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white/10 rounded-3xl border border-white/20 p-8 w-full max-w-md backdrop-blur-xl">
        {/* Header */}
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Icons.Download size={20} class="text-white" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-white">
                {entries.length === 1 ? "Export Entry" : "Export Journal"}
              </h2>
              <p class="text-sm text-white/60">
                {entries.length === 1
                  ? "Save this entry to your device"
                  : "Save your entries to your device"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            class="p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <Icons.X size={20} class="text-white" />
          </button>
        </div>

        {/* Format Selection */}
        <div class="mb-6">
          <label class="block text-sm font-semibold text-white mb-3">
            Export Format
          </label>
          <div class="space-y-2">
            {[
              {
                value: "markdown" as const,
                label: "Markdown",
                desc: "Plain text format",
                icon: Icons.FileCode,
              },
              {
                value: "pdf" as const,
                label: "PDF Document",
                desc: "Standard portable format",
                icon: Icons.FileText,
              },
              {
                value: "docx" as const,
                label: "Word (DOCX)",
                desc: "Rich text document",
                icon: Icons.FileText,
              },
            ].map(({ value, label, desc, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormat(value)}
                class={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  format === value
                    ? "bg-green-500/20 border-green-500/50"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <Icon
                  size={20}
                  class={format === value ? "text-green-400" : "text-white/60"}
                />
                <div class="text-left">
                  <p
                    class={`font-semibold ${
                      format === value ? "text-green-300" : "text-white"
                    }`}
                  >
                    {label}
                  </p>
                  <p class="text-xs text-white/50">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Preview */}
        <div class="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <p class="text-xs text-white/60 font-semibold">EXPORT PREVIEW</p>
          {entries.length > 1 && (
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p class="text-white/80">Entries</p>
                <p class="text-xl font-bold text-white">{stats.entryCount}</p>
              </div>
              <div>
                <p class="text-white/80">Words</p>
                <p class="text-xl font-bold text-white">
                  {stats.wordCount.toLocaleString()}
                </p>
              </div>
              <div>
                <p class="text-white/80">Synthesis</p>
                <p class="text-xl font-bold text-white">
                  {stats.synthesisCount}
                </p>
              </div>
              <div>
                <p class="text-white/80">Public</p>
                <p class="text-xl font-bold text-white">{stats.publicCount}</p>
              </div>
            </div>
          )}
          {entries.length === 1 && (
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p class="text-white/80">Words</p>
                <p class="text-xl font-bold text-white">
                  {stats.wordCount.toLocaleString()}
                </p>
              </div>
              <div>
                <p class="text-white/80">Visibility</p>
                <p class="text-xl font-bold text-white">
                  {entries[0].isPublic ? "Public" : "Private"}
                </p>
              </div>
            </div>
          )}
          {stats.dateRange && entries.length > 1 && (
            <p class="text-xs text-white/50 pt-2 border-t border-white/10">
              From {stats.dateRange.earliest.toLocaleDateString()} to{" "}
              {stats.dateRange.latest.toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Actions */}
        <div class="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            class="flex-1 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            class="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={loading || stats.entryCount === 0}
          >
            <Icons.Download size={16} />
            {loading ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
