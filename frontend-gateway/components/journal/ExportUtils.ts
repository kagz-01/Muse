import { JournalEntry } from "../../signals/journal.ts";

export interface ExportOptions {
  format: "json" | "csv" | "markdown";
  includeVaulted: boolean;
  dateRange?: {
    start: number;
    end: number;
  };
  filterMoods?: string[];
}

export function exportAsJSON(entries: JournalEntry[], options: Partial<ExportOptions> = {}): string {
  const filtered = filterEntries(entries, options);
  const data = {
    exported: new Date().toISOString(),
    totalEntries: filtered.length,
    entries: filtered.map((e) => ({
      id: e.id,
      body: e.body.substring(0, 100) + "...",
      mood: e.mood,
      tags: e.tags,
      isPublic: e.isPublic,
      isSynthesis: !!e.synthesis,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      wordCount: e.wordCount,
      ...(e.synthesis && {
        synthesis: {
          sourceRoomIds: e.synthesis.sourceRoomIds,
          sourceThreadIds: e.synthesis.sourceThreadIds,
          keyInsights: e.synthesis.keyInsights,
          patterns: e.synthesis.patterns,
        },
      }),
    })),
  };

  return JSON.stringify(data, null, 2);
}

export function exportAsCSV(entries: JournalEntry[], options: Partial<ExportOptions> = {}): string {
  const filtered = filterEntries(entries, options);

  const headers = [
    "Date",
    "Mood",
    "Tags",
    "Is Public",
    "Word Count",
    "Synthesis",
    "Sources",
  ];

  const rows = filtered.map((e) => [
    new Date(e.createdAt).toISOString().split("T")[0],
    e.mood,
    `"${(e.tags || []).join(", ")}"`,
    e.isPublic ? "Yes" : "No",
    e.wordCount,
    !!e.synthesis ? "Yes" : "No",
    e.synthesis
      ? `${e.synthesis.sourceRoomIds?.length || 0} rooms, ${e.synthesis.sourceThreadIds?.length || 0} threads`
      : "",
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csv;
}

export function exportAsMarkdown(entries: JournalEntry[], options: Partial<ExportOptions> = {}): string {
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
      `**Date:** ${new Date(e.createdAt).toLocaleString()} | **Mood:** ${e.mood} | **Visibility:** ${e.isPublic ? "Public" : "Private"}`
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

export function downloadFile(content: string, filename: string, mimeType: string): void {
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
  options: ExportOptions
): void {
  let content: string;
  let filename: string;
  let mimeType: string;

  const dateStr = new Date().toISOString().split("T")[0];

  switch (options.format) {
    case "json":
      content = exportAsJSON(entries, options);
      filename = `journal-export-${dateStr}.json`;
      mimeType = "application/json";
      break;
    case "csv":
      content = exportAsCSV(entries, options);
      filename = `journal-export-${dateStr}.csv`;
      mimeType = "text/csv";
      break;
    case "markdown":
      content = exportAsMarkdown(entries, options);
      filename = `journal-export-${dateStr}.md`;
      mimeType = "text/markdown";
      break;
  }

  downloadFile(content, filename, mimeType);
}

function filterEntries(entries: JournalEntry[], options: Partial<ExportOptions>): JournalEntry[] {
  let filtered = [...entries];

  // Filter by vault status
  if (!options.includeVaulted) {
    filtered = filtered.filter((e) => !e.vault);
  }

  // Filter by date range
  if (options.dateRange) {
    filtered = filtered.filter(
      (e) => e.createdAt >= options.dateRange!.start && e.createdAt <= options.dateRange!.end
    );
  }

  // Filter by moods
  if (options.filterMoods && options.filterMoods.length > 0) {
    filtered = filtered.filter((e) => options.filterMoods!.includes(e.mood));
  }

  return filtered.sort((a, b) => b.createdAt - a.createdAt);
}

export function getExportStats(entries: JournalEntry[], options: Partial<ExportOptions>) {
  const filtered = filterEntries(entries, options);
  const wordCount = filtered.reduce((sum, e) => sum + e.wordCount, 0);
  const synthesisCount = filtered.filter((e) => !!e.synthesis).length;

  return {
    entryCount: filtered.length,
    wordCount,
    synthesisCount,
    publicCount: filtered.filter((e) => e.isPublic).length,
    vaultedCount: filtered.filter((e) => !!e.vault).length,
    dateRange: filtered.length > 0 ? {
      earliest: new Date(filtered[filtered.length - 1].createdAt),
      latest: new Date(filtered[0].createdAt),
    } : null,
  };
}
