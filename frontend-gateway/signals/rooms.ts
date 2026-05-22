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

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_ROOMS;
    const parsed = JSON.parse(stored) as Room[];
    const base = Array.isArray(parsed) ? parsed : INITIAL_ROOMS;

    // Restore session unlocks from sessionStorage (per-tab/session expiry)
    try {
      const unlocked = typeof sessionStorage !== "undefined"
        ? JSON.parse(sessionStorage.getItem("muse_vault_unlocked_v1") || "[]")
        : [];
      if (Array.isArray(unlocked) && unlocked.length > 0) {
        return base.map((r) => ({ ...r, isVaultUnlocked: unlocked.includes(r.id) || !!r.isVaultUnlocked }));
      }
    } catch {
      // ignore
    }

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

// Attempt to unlock a vault room by verifying the provided password.
// Returns true when unlocked successfully, false otherwise.
// Generate a random salt (hex string)
export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Hash password with salt using SHA-256 and return `salt$hex` format
export async function hashPassword(password: string, salt?: string): Promise<string> {
  const s = salt || generateSalt();
  const encoder = new TextEncoder();
  const data = encoder.encode(s + password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${s}$${hex}`;
}

export async function unlockVault(id: string, password: string): Promise<boolean> {
  const room = roomsSignal.value.find((r) => r.id === id);
  if (!room || !room.isVault || !room.vaultPassword) return false;

  const [salt] = room.vaultPassword.split("$");
  const candidate = await hashPassword(password, salt);
  const matches = candidate === room.vaultPassword;
  if (!matches) return false;

  roomsSignal.value = roomsSignal.value.map((r) =>
    r.id === id ? { ...r, isVaultUnlocked: true, updatedAt: new Date().toISOString() } : r
  );

  // Persist unlock to sessionStorage so page refresh preserves unlocked state within session
  try {
    if (typeof sessionStorage !== "undefined") {
      const key = "muse_vault_unlocked_v1";
      const current = JSON.parse(sessionStorage.getItem(key) || "[]");
      if (!current.includes(id)) {
        current.push(id);
        sessionStorage.setItem(key, JSON.stringify(current));
      }
    }
  } catch (_err) {
    void _err;
  }

  return true;
}

export function clearSessionVaultUnlocks() {
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem("muse_vault_unlocked_v1");
    }
  } catch (_err) {
    void _err;
  }
}
