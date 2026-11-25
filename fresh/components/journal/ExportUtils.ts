import { JournalEntry } from "../../signals/journal.ts";

export interface ExportOptions {
  format: "markdown" | "pdf" | "docx";
  includeVaulted: boolean;
  dateRange?: {
    start: number;
    end: number;
  };
  filterMoods?: string[];
}

export function exportAsPDF(
  entries: JournalEntry[],
  options: Partial<ExportOptions> = {},
): string {
  // Mock PDF generation (outputs text that looks like a document)
  return exportAsMarkdown(entries, options);
}

export function exportAsDOCX(
  entries: JournalEntry[],
  options: Partial<ExportOptions> = {},
): string {
  // Mock DOCX generation
  return exportAsMarkdown(entries, options);
}

export function exportAsMarkdown(
  entries: JournalEntry[],
  options: Partial<ExportOptions> = {},
): string {
  const filtered = filterEntries(entries, options);

  const md = [
    "# Journal Export",
    "",
    `Exported: ${new Date().toLocaleString()}`,
    `Total Entries: ${filtered.length}`,
    "",
    "---",
    "",
  ];

  filtered.forEach((e, i) => {
    md.push(`## ${i + 1}. Entry #${e.id}`);
    md.push("");
    md.push(
      `**Date:** ${
        new Date(e.createdAt).toLocaleString()
      } | **Mood:** ${e.mood} | **Visibility:** ${
        e.isPublic ? "Public" : "Private"
      }`,
    );

    if (e.tags && e.tags.length > 0) {
      md.push(`**Tags:** ${e.tags.map((t) => `#${t}`).join(" ")}`);
    }

    if (e.synthesis) {
      md.push("");
      md.push("### Synthesis Details");
      if (e.synthesis.sourceRoomIds?.length) {
        md.push(`- **Source Rooms:** ${e.synthesis.sourceRoomIds.length}`);
      }
      if (e.synthesis.sourceThreadIds?.length) {
        md.push(`- **Source Threads:** ${e.synthesis.sourceThreadIds.length}`);
      }
      if (e.synthesis.keyInsights?.length) {
        md.push("");
        md.push("**Key Insights:**");
        e.synthesis.keyInsights.forEach((insight) => {
          md.push(`- ${insight}`);
        });
      }
      if (e.synthesis.patterns?.length) {
        md.push("");
        md.push("**Patterns:**");
        e.synthesis.patterns.forEach((pattern) => {
          md.push(`- ${pattern}`);
        });
      }
    }

    md.push("");
    md.push(e.body);
    md.push("");
    md.push("---");
    md.push("");
  });

  return md.join("\n");
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function triggerExport(
  entries: JournalEntry[],
  options: ExportOptions,
): void {
  let content: string;
  let filename: string;
  let mimeType: string;

  const dateStr = new Date().toISOString().split("T")[0];

  switch (options.format) {
    case "markdown":
      content = exportAsMarkdown(entries, options);
      filename = `journal-export-${dateStr}.md`;
      mimeType = "text/markdown";
      break;
    case "pdf":
      content = exportAsPDF(entries, options);
      filename = `journal-export-${dateStr}.pdf`;
      mimeType = "application/pdf";
      break;
    case "docx":
      content = exportAsDOCX(entries, options);
      filename = `journal-export-${dateStr}.docx`;
      mimeType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      break;
  }

  downloadFile(content, filename, mimeType);
}

function filterEntries(
  entries: JournalEntry[],
  options: Partial<ExportOptions>,
): JournalEntry[] {
  let filtered = [...entries];

  // Filter by vault status
  if (!options.includeVaulted) {
    filtered = filtered.filter((e) => !e.vault);
  }

  // Filter by date range
  if (options.dateRange) {
    filtered = filtered.filter(
      (e) =>
        e.createdAt >= options.dateRange!.start &&
        e.createdAt <= options.dateRange!.end,
    );
  }

  // Filter by moods
  if (options.filterMoods && options.filterMoods.length > 0) {
    filtered = filtered.filter((e) => options.filterMoods!.includes(e.mood));
  }

  return filtered.sort((a, b) => b.createdAt - a.createdAt);
}

export function getExportStats(
  entries: JournalEntry[],
  options: Partial<ExportOptions>,
) {
  const filtered = filterEntries(entries, options);
  const wordCount = filtered.reduce((sum, e) => sum + e.wordCount, 0);
  const synthesisCount = filtered.filter((e) => !!e.synthesis).length;

  return {
    entryCount: filtered.length,
    wordCount,
    synthesisCount,
    publicCount: filtered.filter((e) => e.isPublic).length,
    vaultedCount: filtered.filter((e) => !!e.vault).length,
    dateRange: filtered.length > 0
      ? {
        earliest: new Date(filtered[filtered.length - 1].createdAt),
        latest: new Date(filtered[0].createdAt),
      }
      : null,
  };
}
