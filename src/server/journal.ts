import { executeDB, queryDB } from "./db";

export interface MuseJournalEntry {
  id: string;
  userId: string;
  threadId: string | null;
  rawThought: string;
  mood: string | null;
  tags: string[];
  isFavorited: boolean;
  isPinned: boolean;
  isArchived: boolean;
  isPublic: boolean;
  synthesizedContext: unknown;
  createdAt: string | Date | null;
  updatedAt: string | Date | null;
}

export function mapJournalRow(row: Record<string, unknown>): MuseJournalEntry {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    threadId: row.thread_id == null ? null : String(row.thread_id),
    rawThought: String(row.raw_thought ?? ""),
    mood: typeof row.mood === "string" ? row.mood : null,
    tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [],
    isFavorited: row.is_favorited === true,
    isPinned: row.is_pinned === true,
    isArchived: row.is_archived === true,
    isPublic: row.is_public === true,
    synthesizedContext: row.synthesized_context ?? null,
    createdAt: row.created_at instanceof Date || typeof row.created_at === "string" ? row.created_at : null,
    updatedAt: row.updated_at instanceof Date || typeof row.updated_at === "string" ? row.updated_at : null,
  };
}

export async function listJournalEntries(userId: string): Promise<MuseJournalEntry[]> {
  const rows = await queryDB(
    "SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC",
    userId,
  );
  return rows.map(mapJournalRow);
}

export async function deleteJournalEntry(userId: string, entryId: string): Promise<boolean> {
  const result = await executeDB(
    "DELETE FROM journal_entries WHERE id = $1 AND user_id = $2",
    entryId,
    userId,
  );
  return (result.rowCount ?? 0) > 0;
}
