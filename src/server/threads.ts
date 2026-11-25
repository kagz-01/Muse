import { queryDB } from "./db";

export interface MuseThread {
  id: string;
  roomId: string | null;
  title: string;
  description: string;
  mood: string;
  format: string | null;
  depth: string | null;
  theme: string | null;
  thesis: string | null;
  coverImage: string | null;
  isPublic: boolean;
  isFavorited: boolean;
  isPinned: boolean;
  isArchived: boolean;
  isVault: boolean;
  synthesisScore: number;
  itemIds: string[];
  sourceRoomIds: string[];
  dialogueLayers: unknown[];
  resonanceMetrics: Record<string, unknown>;
  synthesis: unknown;
  updatedAt: string | Date | null;
}

export function mapThreadRow(row: Record<string, unknown>): MuseThread {
  return {
    id: String(row.id),
    roomId: row.room_id == null ? null : String(row.room_id),
    title: String(row.title ?? "Untitled Thread"),
    description: String(row.description ?? ""),
    mood: typeof row.mood === "string" ? row.mood : "focus",
    format: typeof row.format === "string" ? row.format : null,
    depth: typeof row.depth === "string" ? row.depth : null,
    theme: typeof row.theme === "string" ? row.theme : null,
    thesis: typeof row.thesis === "string" ? row.thesis : null,
    coverImage: typeof row.cover_image === "string" ? row.cover_image : null,
    isPublic: row.is_public === true,
    isFavorited: row.is_favorited === true,
    isPinned: row.is_pinned === true,
    isArchived: row.is_archived === true,
    isVault: row.is_vault === true,
    synthesisScore: Number(row.synthesis_score ?? 0),
    itemIds: Array.isArray(row.artifact_ids) ? row.artifact_ids.map(String) : [],
    sourceRoomIds: Array.isArray(row.source_room_ids) ? row.source_room_ids.map(String) : [],
    dialogueLayers: Array.isArray(row.dialogue_layers) ? row.dialogue_layers : [],
    resonanceMetrics: row.resonance_metrics && typeof row.resonance_metrics === "object"
      ? row.resonance_metrics as Record<string, unknown>
      : { views: 0, connections: 0 },
    synthesis: row.synthesis ?? null,
    updatedAt: row.updated_at instanceof Date || typeof row.updated_at === "string" ? row.updated_at : null,
  };
}

export async function listThreads(userId: string): Promise<MuseThread[]> {
  const rows = await queryDB(
    `SELECT t.* FROM threads t
     LEFT JOIN rooms r ON t.room_id = r.id
     WHERE t.user_id = $1 OR r.user_id = $1
     ORDER BY t.updated_at DESC`,
    userId,
  );
  return rows.map(mapThreadRow);
}
