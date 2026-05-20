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

export type RoomCategory = "workspace" | "journal" | "archive" | "brainstorm" | "inspiration";
export type RoomSize = "small" | "medium" | "large";

export interface Room {
  id: string;
  name: string;
  description?: string;
  emoji?: string; // Room icon/emoji (e.g., 🎨, 📖, 🏗️)
  category?: RoomCategory; // Room type/template (workspace, journal, archive, brainstorm, inspiration)
  size?: RoomSize; // Room capacity (small, medium, large)
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
  isVault?: boolean; // True if this is a private vault room (like Snapchat's "my eyes only")
  vaultPassword?: string; // Encrypted/hashed password for vault access
  isVaultUnlocked?: boolean; // True if user has unlocked this vault in session
}

const STORAGE_KEY = "muse_rooms_v1";

const INITIAL_ROOMS: Room[] = [
  {
    id: "r1",
    name: "Aesthetic Brutalism",
    description: "A sanctuary for monolithic forms and raw digital honesty.",
    emoji: "🏗️",
    category: "inspiration",
    size: "medium",
    themeColor: "indigo",
    coverImage:
      "https://images.unsplash.com/photo-1518005020250-58003994bf3b?auto=format&fit=crop&w=1200&q=80",
    isPublic: true,
    count: 5,
    tags: ["architecture", "design", "brutalism", "visual"],
    notificationsEnabled: true,
    updatedAt: new Date().toISOString(),
    semanticTags: ["architecture", "design", "brutalism"],
    resonanceMetrics: { views: 420, wovenCount: 12 },
  },
  {
    id: "r2",
    name: "Cognitive Stoicism",
    description: "Practices and signals for maintaining digital sovereignty.",
    emoji: "🧠",
    category: "journal",
    size: "small",
    themeColor: "emerald",
    coverImage:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    isPublic: false,
    count: 3,
    tags: ["stoicism", "philosophy", "mindfulness", "personal"],
    notificationsEnabled: false,
    updatedAt: new Date().toISOString(),
    semanticTags: ["stoicism", "philosophy", "mindfulness"],
    resonanceMetrics: { views: 0, wovenCount: 0 },
  },
];

function loadRooms(): Room[] {
  if (typeof localStorage === "undefined") return INITIAL_ROOMS;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return INITIAL_ROOMS;

  try {
    const parsed = JSON.parse(stored) as Room[];
    return Array.isArray(parsed) ? parsed : INITIAL_ROOMS;
  } catch {
    return INITIAL_ROOMS;
  }
}

export const roomsSignal = signal<Room[]>(loadRooms());

if (typeof localStorage !== "undefined") {
  roomsSignal.subscribe((rooms: Room[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
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
