import { signal } from "@preact/signals";
import { itemsSignal } from "./items.ts";
import { threadsSignal } from "./threads.ts";
import { userSignal } from "./user.ts";

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

const STORAGE_KEY = "muse_rooms_v2";

const INITIAL_ROOMS: Room[] = [];

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

// Keep localStorage as a fast cache for demo mode + offline display
if (typeof localStorage !== "undefined") {
  roomsSignal.subscribe((rooms: Room[]) => {
    const isDemo = userSignal.value?.id === "__demo__";
    if (isDemo) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
      } catch { /* ignore */ }
    }
  });
}

// Load rooms from backend for authenticated users
export async function syncRoomsFromBackend(): Promise<void> {
  const isDemo = userSignal.value?.id === "__demo__";
  if (isDemo) return;
  try {
    const response = await fetch("/api/rooms");
    if (response.ok) {
      const rooms = await response.json();
      roomsSignal.value = rooms;
    }
  } catch (e) {
    console.error("Failed to sync rooms from backend:", e);
  }
}

export async function addRoom(
  room: Omit<
    Room,
    "id" | "updatedAt" | "count" | "semanticTags" | "resonanceMetrics"
  >,
): Promise<string> {
  const isDemo = userSignal.value?.id === "__demo__";

  if (isDemo) {
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

  const response = await fetch("/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(room),
  });

  if (!response.ok) {
    throw new Error(`Failed to create room: ${await response.text()}`);
  }

  const { room: newRoom } = await response.json();
  roomsSignal.value = [...roomsSignal.value, newRoom];
  return newRoom.id;
}

export async function updateRoom(id: string, updates: Partial<Room>) {
  const isDemo = userSignal.value?.id === "__demo__";

  // Optimistic update
  roomsSignal.value = roomsSignal.value.map((r: Room) =>
    r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
  );

  if (!isDemo && !id.startsWith("r")) {
    try {
      await fetch(`/api/rooms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.error("Failed to update room on backend:", e);
    }
  }
}

export async function updateRoomTheme(id: string, theme: RoomTheme) {
  await updateRoom(id, { themeColor: theme });
}

export async function updateRoomCover(id: string, cover: string) {
  await updateRoom(id, { coverImage: cover });
}

export async function toggleRoomPrivacy(id: string) {
  const room = roomsSignal.value.find((r) => r.id === id);
  if (room) {
    await updateRoom(id, { isPublic: !room.isPublic });
  }
}

export async function deleteRoom(id: string) {
  const isDemo = userSignal.value?.id === "__demo__";

  // Remove from signal first (optimistic)
  roomsSignal.value = roomsSignal.value.filter((r: Room) => r.id !== id);

  // Clean up local signal references
  const removedItemIds = itemsSignal.value
    .filter((it) => it.roomId === id)
    .map((it) => it.id);
  itemsSignal.value = itemsSignal.value.filter((it) => it.roomId !== id);
  threadsSignal.value = threadsSignal.value
    .map((t) => ({
      ...t,
      itemIds: t.itemIds.filter((iid) => !removedItemIds.includes(iid)),
      sourceRoomIds: t.sourceRoomIds.filter((rid) => rid !== id),
    }))
    .filter((t) => t.itemIds.length > 0 || t.sourceRoomIds.length > 0);

  if (!isDemo && !id.startsWith("r")) {
    try {
      await fetch(`/api/rooms/${id}`, { method: "DELETE" });
    } catch (e) {
      console.error("Failed to delete room on backend:", e);
    }
  }
}

export function resetRooms() {
  roomsSignal.value = [];
}
