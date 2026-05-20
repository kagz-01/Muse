import { signal } from "@preact/signals";

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

export const itemsSignal = signal<Item[]>([
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
]);

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
  itemsSignal.value = itemsSignal.value.filter((i: Item) => i.id !== id);
}

export function resetItems() {
  itemsSignal.value = [];
}
