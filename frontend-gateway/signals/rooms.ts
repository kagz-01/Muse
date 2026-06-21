import { signal } from "@preact/signals";
import { itemsSignal } from "./items.ts";
import { threadsSignal } from "./threads.ts";

export type RoomTheme =
  | "indigo"
  | "emerald"
  | "rose"
  | "amber"
  | "cyan"
  | "slate";

export type RoomCategory =
  | "workspace"
  | "journal"
  | "archive"
  | "brainstorm"
  | "inspiration";
export type RoomSize = "small" | "medium" | "large";
export type RoomMood =
  | "focus"
  | "zen"
  | "chaos"
  | "energetic"
  | "melancholy"
  | "dreamy"
  | "noir"
  | "warm"
  | "electric"
  | "minimal"
  | "cosmic"
  | "storm";

export const MOOD_OPTIONS: {
  id: RoomMood;
  emoji: string;
  label: string;
  description: string;
}[] = [
  {
    id: "focus",
    emoji: "🎯",
    label: "Focus",
    description: "Deep work, no distractions",
  },
  {
    id: "zen",
    emoji: "🧘",
    label: "Zen",
    description: "Calm, meditative breathing",
  },
  {
    id: "chaos",
    emoji: "🌀",
    label: "Chaos",
    description: "Glitchy, raw creative energy",
  },
  {
    id: "energetic",
    emoji: "⚡",
    label: "Energetic",
    description: "Fast-paced, vibrant pulse",
  },
  {
    id: "melancholy",
    emoji: "🌧️",
    label: "Melancholy",
    description: "Thoughtful, introspective depth",
  },
  {
    id: "dreamy",
    emoji: "☁️",
    label: "Dreamy",
    description: "Soft, floating, ethereal",
  },
  {
    id: "noir",
    emoji: "🖤",
    label: "Noir",
    description: "Dark cinematic mystery",
  },
  {
    id: "warm",
    emoji: "🕯️",
    label: "Warm",
    description: "Cozy, candlelit comfort",
  },
  {
    id: "electric",
    emoji: "💜",
    label: "Electric",
    description: "Neon-lit cyberpunk haze",
  },
  {
    id: "minimal",
    emoji: "◻️",
    label: "Minimal",
    description: "Clean, stripped-back clarity",
  },
  {
    id: "cosmic",
    emoji: "🌌",
    label: "Cosmic",
    description: "Deep space, infinite scale",
  },
  {
    id: "storm",
    emoji: "🌩️",
    label: "Storm",
    description: "Intense, volatile urgency",
  },
];

export interface Room {
  id: string;
  name: string;
  description?: string;
  emoji?: string; // Room icon/emoji (e.g., 🎨, 📖, 🏗️)
  category?: RoomCategory; // Room type/template (workspace, journal, archive, brainstorm, inspiration)
  size?: RoomSize; // Room capacity (small, medium, large)
  mood?: RoomMood; // Ambient mode (focus, zen, chaos, energetic)
  themeColor: RoomTheme;
  customThemeHex?: string; // Custom hex color chosen by user (overrides themeColor if present)
  coverImage?: string;
  isPublic: boolean;
  count: number;
  tags: string[]; // Initial/managed tags for the room
  notificationsEnabled: boolean; // User notification preference for room activity
  updatedAt: string;
  semanticTags: string[];
  resonanceMetrics: {
    views: number;
    wovenCount: number; // Number of times artifacts from this room were woven into public threads
  };
  customStyling?: {
    wallpaper?: string;
    auraIntensity?: number;
    fontFamily?: string;
  };
  // Vault-related properties
  isVault?: boolean; // True if this is a private vault room
}

const STORAGE_KEY = "muse_rooms_v1";

const INITIAL_ROOMS: Room[] = [
  {
    id: "r1",
    name: "World Politics Debate",
    description: "A space to discuss and analyze global political movements and local elections.",
    emoji: "🗳️",
    category: "brainstorm",
    size: "medium",
    themeColor: "indigo",
    coverImage:
      "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80",
    isPublic: true,
    count: 5,
    tags: ["politics", "news", "debate", "society"],
    notificationsEnabled: true,
    updatedAt: new Date().toISOString(),
    semanticTags: ["politics", "debate", "society"],
    resonanceMetrics: { views: 420, wovenCount: 12 },
  },
  {
    id: "r2",
    name: "Love & Relationships",
    description: "Reflections on modern romance, connection, and the five love languages.",
    emoji: "❤️",
    category: "journal",
    size: "small",
    themeColor: "rose",
    coverImage:
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80",
    isPublic: false,
    count: 3,
    tags: ["romance", "love", "relationships", "personal"],
    notificationsEnabled: false,
    updatedAt: new Date().toISOString(),
    semanticTags: ["romance", "love", "relationships"],
    resonanceMetrics: { views: 0, wovenCount: 0 },
  },
];

function loadRooms(): Room[] {
  if (typeof localStorage === "undefined") return INITIAL_ROOMS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_ROOMS;
    const parsed = JSON.parse(stored) as Room[];
    const base = Array.isArray(parsed) ? parsed : INITIAL_ROOMS;

    return base;
  } catch {
    return INITIAL_ROOMS;
  }
}

export const roomsSignal = signal<Room[]>(loadRooms());

if (typeof localStorage !== "undefined") {
  roomsSignal.subscribe((rooms: Room[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
    } catch {
      // ignore write errors in restricted environments
    }
  });
}

export function addRoom(
  room: Omit<
    Room,
    "id" | "updatedAt" | "count" | "semanticTags" | "resonanceMetrics"
  >,
) {
  const newId = "r" + (roomsSignal.value.length + 1);
  const newRoom: Room = {
    ...room,
    id: newId,
    updatedAt: new Date().toISOString(),
    count: 0,
    semanticTags: [],
    resonanceMetrics: { views: 0, wovenCount: 0 },
  };
  roomsSignal.value = [...roomsSignal.value, newRoom];
  return newId;
}

export function updateRoomTheme(id: string, theme: RoomTheme) {
  roomsSignal.value = roomsSignal.value.map((r: Room) =>
    r.id === id ? { ...r, themeColor: theme } : r
  );
}

export function updateRoomCover(id: string, cover: string) {
  roomsSignal.value = roomsSignal.value.map((r: Room) =>
    r.id === id ? { ...r, coverImage: cover } : r
  );
}

export function toggleRoomPrivacy(id: string) {
  roomsSignal.value = roomsSignal.value.map((r: Room) =>
    r.id === id ? { ...r, isPublic: !r.isPublic } : r
  );
}

export function updateRoom(id: string, updates: Partial<Room>) {
  roomsSignal.value = roomsSignal.value.map((r: Room) =>
    r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
  );
}

export function deleteRoom(id: string) {
  // Remove the room itself
  roomsSignal.value = roomsSignal.value.filter((r: Room) => r.id !== id);

  // Remove items belonging to the room
  const removedItemIds = itemsSignal.value
    .filter((it) => it.roomId === id)
    .map((it) => it.id);

  itemsSignal.value = itemsSignal.value.filter((it) => it.roomId !== id);

  // Remove references to removed items and the room from threads
  threadsSignal.value = threadsSignal.value
    .map((t) => ({
      ...t,
      itemIds: t.itemIds.filter((iid) => !removedItemIds.includes(iid)),
      sourceRoomIds: t.sourceRoomIds.filter((rid) => rid !== id),
    }))
    // Optionally remove threads that now have no items and no source rooms
    .filter((t) => t.itemIds.length > 0 || t.sourceRoomIds.length > 0);
}

export function resetRooms() {
  roomsSignal.value = [];
}
