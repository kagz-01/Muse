import { signal } from "@preact/signals";
import { threadsSignal, removeItemFromThread } from "./threads.ts";

export interface Item {
  id: string;
  roomId: string;
  title: string;
  sourceUrl: string;
  note?: string;
  isPublic: boolean;
  createdAt: string;
  // PERSISTENCE METADATA
  storedContent?: string; // The extracted raw data (text, JSON, etc.)
  localMediaPath?: string; // Path to the locally stored image/video
  dataProvenance: {
    platform: string;
    extractedAt: string;
    integrityHash: string;
  };
}

const STORAGE_KEY = "muse_items_v1";

const INITIAL_ITEMS: Item[] = [
  {
    id: "i1",
    roomId: "r1",
    title: "Brutalist Principles in Digital Spaces",
    sourceUrl: "https://design.com/brutalism",
    note: "Raw materials are the only honest way to build.",
    isPublic: true,
    createdAt: new Date().toISOString(),
    dataProvenance: {
      platform: "Web",
      extractedAt: new Date().toISOString(),
      integrityHash: "sha256-...",
    },
  },
];

function loadItems(): Item[] {
  if (typeof localStorage === "undefined") return INITIAL_ITEMS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_ITEMS;
    const parsed = JSON.parse(stored) as Item[];
    return Array.isArray(parsed) ? parsed : INITIAL_ITEMS;
  } catch {
    return INITIAL_ITEMS;
  }
}

export const itemsSignal = signal<Item[]>(loadItems());

if (typeof localStorage !== "undefined") {
  itemsSignal.subscribe((items: Item[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore write errors in restricted environments
    }
  });
}

export function addItem(
  item: Omit<Item, "id" | "createdAt" | "dataProvenance">,
) {
  const newItem: Item = {
    ...item,
    id: "i" + (itemsSignal.value.length + 1),
    createdAt: new Date().toISOString(),
    dataProvenance: {
      platform: item.sourceUrl.includes("x.com") ? "X" : "Web",
      extractedAt: new Date().toISOString(),
      integrityHash: "sha256-" + Math.random().toString(16).slice(2, 10),
    },
  };
  itemsSignal.value = [newItem, ...itemsSignal.value];
}

export function deleteItem(id: string) {
  // Remove the item from the store
  itemsSignal.value = itemsSignal.value.filter((i: Item) => i.id !== id);

  // Remove references to this item from all threads
  threadsSignal.value.forEach((t) => {
    if (t.itemIds.includes(id)) {
      removeItemFromThread(t.id, id);
    }
  });
}

export function resetItems() {
  itemsSignal.value = [];
}
