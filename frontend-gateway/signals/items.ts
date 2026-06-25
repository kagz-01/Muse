import { signal } from "@preact/signals";
import { removeItemFromThread, threadsSignal } from "./threads.ts";
import { userSignal } from "./user.ts";
import { safeFetch } from "../utils/safeFetch.ts";
import { registerIdSwapCallback } from "../utils/syncQueue.ts";

export interface Item {
  id: string;
  roomId: string;
  title: string;
  sourceUrl: string;
  note?: string;
  isPublic: boolean;
  createdAt: string;
  storedContent?: string;
  localMediaPath?: string;
  dataProvenance: {
    platform: string;
    extractedAt: string;
    integrityHash: string;
  };
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
}

const STORAGE_KEY = "muse_items_v2";

const INITIAL_ITEMS: Item[] = [
  {
    id: "i1",
    roomId: "r1",
    title: "Voter Turnout Statistics 2024",
    sourceUrl: "https://politics.news/voter-turnout",
    note:
      "The lowest engagement we've seen in a decade for municipal elections.",
    isPublic: true,
    createdAt: new Date().toISOString(),
    dataProvenance: {
      platform: "Web",
      extractedAt: new Date().toISOString(),
      integrityHash: "sha256-a1b2c3",
    },
  },
  {
    id: "i2",
    roomId: "r1",
    title: "City Council Zoning Proposal",
    sourceUrl: "https://localgov.city/zoning",
    note: "This will affect housing availability dramatically.",
    isPublic: true,
    createdAt: new Date().toISOString(),
    dataProvenance: {
      platform: "Web",
      extractedAt: new Date().toISOString(),
      integrityHash: "sha256-d4e5f6",
    },
  },
  {
    id: "i3",
    roomId: "r2",
    title: "The 5 Love Languages Explained",
    sourceUrl: "https://psychology.com/love-languages",
    note:
      "Fascinating how acts of service can be misinterpreted if your partner values words of affirmation.",
    isPublic: false,
    createdAt: new Date().toISOString(),
    dataProvenance: {
      platform: "Web",
      extractedAt: new Date().toISOString(),
      integrityHash: "sha256-x7y8z9",
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

// Keep localStorage cache for demo mode only
if (typeof localStorage !== "undefined") {
  itemsSignal.subscribe((items: Item[]) => {
    const isDemo = userSignal.value?.id === "__demo__";
    if (isDemo) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch { /* ignore */ }
    }
  });
}

export async function syncItemsFromBackend(): Promise<void> {
  const isDemo = userSignal.value?.id === "__demo__";
  if (isDemo) return;
  try {
    const response = await fetch("/api/items");
    if (response.ok) {
      const items = await response.json();
      itemsSignal.value = items;
    }
  } catch (e) {
    console.error("Failed to sync items from backend:", e);
  }
}

export async function addItem(
  item: Omit<Item, "id" | "createdAt" | "dataProvenance">,
) {
  const isDemo = userSignal.value?.id === "__demo__";

  if (isDemo) {
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
    return;
  }

  const tempId = "i" + (itemsSignal.value.length + 1) + "_pending";
  const response = await safeFetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
    entity: "item",
    tempId,
  });

  if (!response.ok) {
    throw new Error(`Failed to add item: ${await response.text()}`);
  }

  const data = await response.json();
  if (data.queued) {
    const newItem: Item = {
      ...item,
      id: tempId,
      createdAt: new Date().toISOString(),
      dataProvenance: {
        platform: item.sourceUrl?.includes("x.com") ? "X" : "Web",
        extractedAt: new Date().toISOString(),
        integrityHash: "sha256-" + Math.random().toString(16).slice(2, 10),
      },
    };
    itemsSignal.value = [newItem, ...itemsSignal.value];
    return;
  }

  const { item: newItem } = data;
  itemsSignal.value = [newItem, ...itemsSignal.value];
}

export async function deleteItem(id: string) {
  const isDemo = userSignal.value?.id === "__demo__";

  itemsSignal.value = itemsSignal.value.filter((i: Item) => i.id !== id);

  threadsSignal.value.forEach((t) => {
    if (t.itemIds.includes(id)) {
      removeItemFromThread(t.id, id);
    }
  });

  if (!isDemo && !id.startsWith("i")) {
    try {
      await safeFetch(`/api/items/${id}`, {
        method: "DELETE",
        entity: "item",
      });
    } catch (e) {
      console.error("Failed to delete item on backend:", e);
    }
  }
}

// ─── Offline Sync Callback ───────────────────────────────────────────────
registerIdSwapCallback("item", (tempId, realId) => {
  itemsSignal.value = itemsSignal.value.map((i) =>
    i.id === tempId ? { ...i, id: realId } : i
  );
});

export function resetItems() {
  itemsSignal.value = [];
}
