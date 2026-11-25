import { queryDB } from "./db";

export interface MuseRoom {
  id: string;
  name: string;
  description: string | null;
  emoji: string | null;
  category: string | null;
  size: string;
  mood: string | null;
  themeColor: string;
  customThemeHex: string | null;
  coverImage: string | null;
  isPublic: boolean;
  tags: string[];
  notificationsEnabled: boolean;
  updatedAt: string | Date | null;
  semanticTags: string[];
  resonanceMetrics: Record<string, unknown>;
  customStyling: Record<string, unknown> | null;
  isVault: boolean;
  count: number;
}

export interface RoomInput {
  name?: string;
  description?: string | null;
  emoji?: string | null;
  category?: string | null;
  size?: string;
  mood?: string | null;
  themeColor?: string;
  customThemeHex?: string | null;
  coverImage?: string | null;
  isPublic?: boolean;
  tags?: string[];
  notificationsEnabled?: boolean;
  semanticTags?: string[];
  resonanceMetrics?: Record<string, unknown>;
  customStyling?: Record<string, unknown> | null;
  isVault?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) &&
      value.every((entry): entry is string => typeof entry === "string")
    ? value
    : [];
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

export function mapRoomRow(row: Record<string, unknown>): MuseRoom {
  return {
    id: String(row.id),
    name: String(row.title ?? ""),
    description: typeof row.description === "string" ? row.description : null,
    emoji: typeof row.emoji === "string" ? row.emoji : null,
    category: typeof row.category === "string" ? row.category : null,
    size: typeof row.size === "string" ? row.size : "medium",
    mood: typeof row.mood === "string" ? row.mood : null,
    themeColor: typeof row.theme_color === "string"
      ? row.theme_color
      : "indigo",
    customThemeHex: typeof row.custom_theme_hex === "string"
      ? row.custom_theme_hex
      : null,
    coverImage: typeof row.cover_image === "string" ? row.cover_image : null,
    isPublic: row.is_public === true,
    tags: stringArray(row.tags),
    notificationsEnabled: row.notifications_enabled !== false,
    updatedAt: row.updated_at instanceof Date ||
        typeof row.updated_at === "string"
      ? row.updated_at
      : null,
    semanticTags: stringArray(row.semantic_tags),
    resonanceMetrics: objectValue(row.resonance_metrics) ?? {
      views: 0,
      wovenCount: 0,
    },
    customStyling: objectValue(row.custom_styling),
    isVault: row.is_vault === true,
    count: Number(row.item_count ?? row.count ?? 0),
  };
}

export function parseRoomInput(
  value: unknown,
  requireName = false,
): RoomInput | null {
  if (!isRecord(value)) return null;

  const input: RoomInput = {};
  const name = value.name ?? value.title;
  if (name !== undefined || requireName) {
    if (typeof name !== "string" || !name.trim() || name.length > 255) {
      return null;
    }
    input.name = name.trim();
  }

  for (
    const field of [
      "description",
      "emoji",
      "category",
      "size",
      "mood",
      "themeColor",
      "customThemeHex",
      "coverImage",
    ] as const
  ) {
    const fieldValue = value[field];
    if (fieldValue === undefined) continue;
    if (fieldValue !== null && typeof fieldValue !== "string") return null;
    switch (field) {
      case "description":
        input.description = fieldValue;
        break;
      case "emoji":
        input.emoji = fieldValue;
        break;
      case "category":
        input.category = fieldValue;
        break;
      case "size":
        if (typeof fieldValue !== "string") return null;
        input.size = fieldValue;
        break;
      case "mood":
        input.mood = fieldValue;
        break;
      case "themeColor":
        if (typeof fieldValue !== "string") return null;
        input.themeColor = fieldValue;
        break;
      case "customThemeHex":
        input.customThemeHex = fieldValue;
        break;
      case "coverImage":
        input.coverImage = fieldValue;
        break;
    }
  }

  for (
    const [field, key] of [
      ["isPublic", "isPublic"],
      ["notificationsEnabled", "notificationsEnabled"],
      ["isVault", "isVault"],
    ] as const
  ) {
    const fieldValue = value[key];
    if (fieldValue === undefined) continue;
    if (typeof fieldValue !== "boolean") return null;
    input[field] = fieldValue;
  }

  for (const field of ["tags", "semanticTags"] as const) {
    const fieldValue = value[field];
    if (fieldValue === undefined) continue;
    if (!Array.isArray(fieldValue) || !fieldValue.every((entry) =>
      typeof entry === "string"
    )) {
      return null;
    }
    input[field] = fieldValue;
  }

  if (value.resonanceMetrics !== undefined) {
    if (!isRecord(value.resonanceMetrics)) return null;
    input.resonanceMetrics = value.resonanceMetrics;
  }
  if (value.customStyling !== undefined) {
    if (value.customStyling !== null && !isRecord(value.customStyling)) {
      return null;
    }
    input.customStyling = value.customStyling;
  }

  return input;
}

export function parseRoomForm(form: FormData): RoomInput | null {
  const tags = form.get("tags")?.toString()
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  return parseRoomInput({
    name: form.get("title")?.toString(),
    description: form.get("description")?.toString() || null,
    themeColor: form.get("theme_color")?.toString() ||
      form.get("themeColor")?.toString(),
    tags,
  }, true);
}

export async function createRoomRecord(
  userId: string,
  input: RoomInput & { name: string },
): Promise<MuseRoom> {
  const rows = await queryDB(
    `INSERT INTO rooms (
       user_id, title, description, emoji, category, size, mood,
       theme_color, custom_theme_hex, cover_image, is_public, tags,
       notifications_enabled, semantic_tags, resonance_metrics,
       custom_styling, is_vault, updated_at
     )
     VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
       $13, $14, $15, $16, $17, NOW()
     )
     RETURNING *, 0::int AS item_count`,
    userId,
    input.name,
    input.description ?? "",
    input.emoji ?? null,
    input.category ?? null,
    input.size ?? "medium",
    input.mood ?? null,
    input.themeColor ?? "indigo",
    input.customThemeHex ?? null,
    input.coverImage ?? null,
    input.isPublic ?? false,
    input.tags ?? [],
    input.notificationsEnabled ?? true,
    input.semanticTags ?? [],
    input.resonanceMetrics ?? { views: 0, wovenCount: 0 },
    input.customStyling ?? null,
    input.isVault ?? false,
  );
  return mapRoomRow(rows[0]);
}

export const DEMO_ROOMS: MuseRoom[] = [
  {
    id: "demo-r1",
    name: "Love & Romance",
    description: "Notes and fragments about intimacy and modern romance.",
    emoji: "💘",
    category: "journal",
    size: "large",
    mood: "warm",
    themeColor: "rose",
    customThemeHex: null,
    coverImage: null,
    isPublic: true,
    tags: ["romance", "relationships", "intimacy"],
    notificationsEnabled: true,
    updatedAt: "2026-11-23T12:00:00.000Z",
    semanticTags: ["dating", "love languages", "social cues"],
    resonanceMetrics: { views: 1240, wovenCount: 18 },
    customStyling: null,
    isVault: false,
    count: 6,
  },
  {
    id: "demo-r2",
    name: "Quiet Rituals",
    description: "Reflections on attention, identity, and steadier habits.",
    emoji: "🌿",
    category: "journal",
    size: "medium",
    mood: "zen",
    themeColor: "emerald",
    customThemeHex: null,
    coverImage: null,
    isPublic: true,
    tags: ["ritual", "attention", "identity"],
    notificationsEnabled: true,
    updatedAt: "2026-11-19T12:00:00.000Z",
    semanticTags: ["human behavior", "rituals", "attention"],
    resonanceMetrics: { views: 911, wovenCount: 11 },
    customStyling: null,
    isVault: false,
    count: 4,
  },
];
