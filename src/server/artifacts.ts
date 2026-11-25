export interface MuseArtifact {
  id: string;
  type: string;
  sourceUrl: string;
  createdAt: string | Date | null;
}

export function mapArtifactRow(row: Record<string, unknown>): MuseArtifact {
  return {
    id: String(row.id),
    type: typeof row.type === "string" ? row.type : "document",
    sourceUrl: typeof row.source_url === "string" ? row.source_url : "",
    createdAt: row.created_at instanceof Date ||
        typeof row.created_at === "string"
      ? row.created_at
      : null,
  };
}
