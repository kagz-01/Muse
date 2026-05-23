import { useState } from "preact/hooks";
import { Download, FileCode, FileJson, FileText, X } from "lucide-preact";
import { JournalEntry } from "../../signals/journal.ts";
import {
  type ExportOptions,
  getExportStats,
  triggerExport,
} from "../../components/journal/ExportUtils.ts";

interface ExportModalProps {
  entries: JournalEntry[];
  onClose: () => void;
}

export function ExportModal({ entries, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<"json" | "csv" | "markdown">("json");
  const [includeVaulted, setIncludeVaulted] = useState(false);
  const [loading, setLoading] = useState(false);

  const stats = getExportStats(entries, {
    format,
    includeVaulted,
  });

  const handleExport = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        triggerExport(entries, {
          format,
          includeVaulted,
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
              <Download size={20} class="text-white" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-white">Export Journal</h2>
              <p class="text-sm text-white/60">
                Save your entries to your device
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            class="p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <X size={20} class="text-white" />
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
                value: "json" as const,
                label: "JSON",
                desc: "Structured data format",
                icon: FileJson,
              },
              {
                value: "csv" as const,
                label: "CSV",
                desc: "Spreadsheet compatible",
                icon: FileText,
              },
              {
                value: "markdown" as const,
                label: "Markdown",
                desc: "Human-readable text",
                icon: FileCode,
              },
            ].map(({ value, label, desc, icon: Icon }) => (
              <button
                key={value}
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

        {/* Options */}
        <div class="mb-6 space-y-3">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeVaulted}
              onChange={(e) =>
                setIncludeVaulted((e.target as HTMLInputElement).checked)}
              class="w-4 h-4 rounded"
            />
            <span class="text-sm text-white">Include vaulted entries</span>
          </label>
        </div>

        {/* Stats Preview */}
        <div class="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <p class="text-xs text-white/60 font-semibold">EXPORT PREVIEW</p>
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
              <p class="text-xl font-bold text-white">{stats.synthesisCount}</p>
            </div>
            <div>
              <p class="text-white/80">Public</p>
              <p class="text-xl font-bold text-white">{stats.publicCount}</p>
            </div>
          </div>
          {stats.dateRange && (
            <p class="text-xs text-white/50 pt-2 border-t border-white/10">
              From {stats.dateRange.earliest.toLocaleDateString()} to{" "}
              {stats.dateRange.latest.toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Actions */}
        <div class="flex gap-3">
          <button
            onClick={onClose}
            class="flex-1 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            class="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={loading || stats.entryCount === 0}
          >
            <Download size={16} />
            {loading ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
