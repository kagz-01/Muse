import { executeDB, queryDB } from "./db";

export interface MuseItem {
  id: string;
  roomId: string | null;
  title: string;
  sourceUrl: string;
  note: string | null;
  isPublic: boolean;
  storedContent: string | null;
  localMediaPath: string | null;
  dataProvenance: Record<string, unknown>;
  createdAt: string | Date | null;
  authorId: string | null;
  authorName?: string;
  authorAvatar?: string;
}

export function mapItemRow(row: Record<string, unknown>): MuseItem {
  return {
    id: String(row.id),
    roomId: row.room_id == null ? null : String(row.room_id),
    title: String(row.title ?? ""),
    sourceUrl: typeof row.source_url === "string" ? row.source_url : "",
    note: typeof row.note === "string" ? row.note : null,
    isPublic: row.is_public === true,
    storedContent: typeof row.stored_content === "string" ? row.stored_content : null,
    localMediaPath: typeof row.local_media_path === "string" ? row.local_media_path : null,
    dataProvenance: row.data_provenance && typeof row.data_provenance === "object"
      ? row.data_provenance as Record<string, unknown>
      : { platform: "Web", integrityHash: "" },
    createdAt: row.created_at instanceof Date || typeof row.created_at === "string"
      ? row.created_at
      : null,
    authorId: row.user_id == null ? null : String(row.user_id),
    authorName: typeof row.author_name === "string" ? row.author_name : undefined,
    authorAvatar: typeof row.author_avatar === "string" ? row.author_avatar : undefined,
  };
}

export async function listItems(userId: string): Promise<MuseItem[]> {
  const rows = await queryDB(
    `SELECT DISTINCT i.*, u.name AS author_name, u.avatar_url AS author_avatar
     FROM items i
     LEFT JOIN rooms r ON i.room_id = r.id
     LEFT JOIN room_collaborators rc ON r.id = rc.room_id
     LEFT JOIN users u ON i.user_id = u.id
     WHERE i.user_id = $1 OR r.user_id = $1 OR rc.user_id = $1
     ORDER BY i.created_at DESC`,
    userId,
  );
  return rows.map(mapItemRow);
}

export async function deleteItem(userId: string, itemId: string): Promise<boolean> {
  const result = await executeDB(
    "DELETE FROM items WHERE id = $1 AND user_id = $2",
    itemId,
    userId,
  );
  return (result.rowCount ?? 0) > 0;
}
