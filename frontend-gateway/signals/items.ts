import { signal } from "@preact/signals";
import { removeItemFromThread, threadsSignal } from "./threads.ts";
import { userSignal } from "./user.ts";
import { safeFetch } from "../utils/safeFetch.ts";
import { registerIdSwapCallback } from "../utils/syncQueue.ts";
import { DEMO_ITEMS } from "../utils/demo_data.ts";

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
  annotations?: {
    id: string;
    annotation: string;
    createdAt: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
  }[];
}

const STORAGE_KEY = "muse_items_v2";

const INITIAL_ITEMS: Item[] = [];

function getDemoItems(): Item[] {
  return DEMO_ITEMS.map((item) => ({
    ...item,
    createdAt: item.createdAt,
  })) as Item[];
}

function loadItems(): Item[] {
  const isDemo = userSignal.value?.id === "__demo__";

  if (typeof localStorage === "undefined") {
    return isDemo ? getDemoItems() : INITIAL_ITEMS;
  }
  try {
    if (!isDemo) return INITIAL_ITEMS;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDemoItems();
    const parsed = JSON.parse(stored) as Item[];
    return Array.isArray(parsed) ? parsed : getDemoItems();
  } catch {
    return isDemo ? getDemoItems() : INITIAL_ITEMS;
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

  userSignal.subscribe((user) => {
    if (user?.id === "__demo__") {
      if (!itemsSignal.value.some((item) => item.id.startsWith("demo-"))) {
        itemsSignal.value = getDemoItems();
      }
    } else {
      itemsSignal.value = INITIAL_ITEMS;
      localStorage.removeItem(STORAGE_KEY);
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

export async function fetchAnnotations(itemId: string) {
  try {
    const response = await fetch(`/api/items/${itemId}/annotate`);
    if (response.ok) {
      const data = await response.json();
      itemsSignal.value = itemsSignal.value.map((i: Item) => 
        i.id === itemId ? { ...i, annotations: data.annotations } : i
      );
    }
  } catch (e) {
    console.error("Failed to fetch annotations:", e);
  }
}

export async function annotateItem(itemId: string, annotationText: string) {
  const isDemo = userSignal.value?.id === "__demo__";

  if (isDemo) {
    const newAnnotation = {
      id: "a" + Math.random().toString(16).slice(2),
      annotation: annotationText,
      createdAt: new Date().toISOString(),
      authorId: "__demo__",
      authorName: "Demo User",
      authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DemoUser",
    };
    
    itemsSignal.value = itemsSignal.value.map((i: Item) => {
      if (i.id === itemId) {
        return { ...i, annotations: [...(i.annotations || []), newAnnotation] };
      }
      return i;
    });
    return;
  }

  try {
    const response = await fetch(`/api/items/${itemId}/annotate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ annotation: annotationText }),
    });

    if (response.ok) {
      const data = await response.json();
      itemsSignal.value = itemsSignal.value.map((i: Item) => {
        if (i.id === itemId) {
          return { ...i, annotations: [...(i.annotations || []), data.annotation] };
        }
        return i;
      });
    } else {
      throw new Error(await response.text());
    }
  } catch (e) {
    console.error("Failed to post annotation:", e);
    throw e;
  }
}
