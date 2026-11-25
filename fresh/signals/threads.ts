import { signal } from "@preact/signals";
import { userSignal } from "./user.ts";
import { safeFetch } from "../utils/safeFetch.ts";
import { registerIdSwapCallback } from "../utils/syncQueue.ts";
import { DEMO_THREADS } from "../utils/demo_data.ts";

export type ThreadMood = string;

export type ThreadFormat = string;
export type ThreadDepth = string;

export interface DialogueLayer {
  id: string;
  userId: string;
  userName: string;
  content: string;
  type: "insight" | "challenge" | "signal";
  resonanceScore: number;
  timestamp: string;
}

export interface Thread {
  id: string;
  title: string;
  description: string;
  mood: ThreadMood;
  format?: ThreadFormat;
  depth?: ThreadDepth;
  theme?: string;
  itemIds: string[];
  sourceRoomIds: string[];
  isPublic: boolean;
  isFavorited?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  updatedAt: string;
  coverImage?: string;
  thesis?: string;
  synthesisScore: number;
  resonanceMetrics: {
    views: number;
    connections: number; // Other threads that link back to this synthesis
  };
  dialogueLayers: DialogueLayer[]; // The "Rich Comment" section
  customStyling?: {
    auraGradients: string[];
    wallpaper?: string;
    fontFamily?: string;
  };
  // Vault functionality (now ties into the global vault)
  isVault?: boolean; // Private thread protected by the Master Vault Password
  // Synthesis analysis
  synthesis?: {
    patterns: string[];
    tensions: string[];
    coherenceScore: number;
    recommendations: string[];
  };
}

const STORAGE_KEY = "muse_threads_v2";

const INITIAL_THREADS: Thread[] = [];

function getDemoThreads(): Thread[] {
  return DEMO_THREADS.map((thread) => ({
    id: thread.id,
    title: thread.title,
    description: thread.description,
    mood: thread.mood as ThreadMood,
    format: thread.format,
    depth: thread.depth,
    theme: thread.theme,
    itemIds: thread.itemIds,
    sourceRoomIds: thread.sourceRoomIds,
    isPublic: thread.isPublic,
    updatedAt: thread.updatedAt,
    coverImage: thread.coverImage,
    thesis: thread.thesis,
    synthesisScore: thread.synthesisScore,
    resonanceMetrics: thread.resonanceMetrics,
    dialogueLayers: thread.dialogueLayers as DialogueLayer[],
    customStyling: thread.customStyling,
    synthesis: thread.synthesis,
  })) as Thread[];
}

function loadThreads(): Thread[] {
  const isDemo = userSignal.value?.id === "__demo__";

  if (typeof localStorage === "undefined") {
    return isDemo ? getDemoThreads() : INITIAL_THREADS;
  }

  try {
    if (!isDemo) return INITIAL_THREADS;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDemoThreads();
    const parsed = JSON.parse(stored) as Thread[];
    return Array.isArray(parsed) ? parsed : getDemoThreads();
  } catch {
    return isDemo ? getDemoThreads() : INITIAL_THREADS;
  }
}

export const threadsSignal = signal<Thread[]>(loadThreads());

// Keep localStorage as a fast cache for demo mode only
if (typeof localStorage !== "undefined") {
  threadsSignal.subscribe((threads: Thread[]) => {
    const isDemo = userSignal.value?.id === "__demo__";
    if (isDemo) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
      } catch { /* ignore */ }
    }
  });

  userSignal.subscribe((user) => {
    if (user?.id === "__demo__") {
      if (!threadsSignal.value.some((thread) => thread.id.startsWith("demo-"))) {
        threadsSignal.value = getDemoThreads();
      }
    } else {
      threadsSignal.value = INITIAL_THREADS;
      localStorage.removeItem(STORAGE_KEY);
    }
  });
}

// Load threads from backend for authenticated users
export async function syncThreadsFromBackend(): Promise<void> {
  const isDemo = userSignal.value?.id === "__demo__";
  if (isDemo) return;
  try {
    const response = await fetch("/api/threads");
    if (response.ok) {
      const threads = await response.json();
      threadsSignal.value = threads;
    }
  } catch (e) {
    console.error("Failed to sync threads from backend:", e);
  }
}

export async function addThread(
  thread: Omit<
    Thread,
    | "id"
    | "updatedAt"
    | "synthesisScore"
    | "resonanceMetrics"
    | "dialogueLayers"
  >,
): Promise<string> {
  const isDemo = userSignal.value?.id === "__demo__";

  if (isDemo) {
    const newId = "t" + (threadsSignal.value.length + 1);
    const newThread: Thread = {
      ...thread,
      id: newId,
      updatedAt: new Date().toISOString(),
      synthesisScore: Math.floor(Math.random() * 40) + 60,
      resonanceMetrics: { views: 0, connections: 0 },
      dialogueLayers: [],
    };
    threadsSignal.value = [...threadsSignal.value, newThread];
    return newId;
  }

  const tempId = "t" + (threadsSignal.value.length + 1) + "_pending";
  const response = await safeFetch("/api/threads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(thread),
    entity: "thread",
    tempId,
  });

  if (!response.ok) {
    throw new Error(`Failed to create thread: ${await response.text()}`);
  }

  const data = await response.json();
  if (data.queued) {
    const newThread: Thread = {
      ...thread,
      id: tempId,
      updatedAt: new Date().toISOString(),
      synthesisScore: Math.floor(Math.random() * 40) + 60,
      resonanceMetrics: { views: 0, connections: 0 },
      dialogueLayers: [],
    };
    threadsSignal.value = [...threadsSignal.value, newThread];
    return tempId;
  }

  const { thread: newThread } = data;
  threadsSignal.value = [...threadsSignal.value, newThread];
  return newThread.id;
}

export async function updateThread(id: string, updates: Partial<Thread>) {
  const isDemo = userSignal.value?.id === "__demo__";

  // Optimistic update
  threadsSignal.value = threadsSignal.value.map((t) =>
    t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
  );

  if (!isDemo && !id.startsWith("t")) {
    try {
      await safeFetch(`/api/threads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        entity: "thread",
      });
    } catch (e) {
      console.error("Failed to update thread on backend:", e);
    }
  }
}

export function addDialogueLayer(
  threadId: string,
  layer: Omit<DialogueLayer, "id" | "resonanceScore" | "timestamp">,
) {
  threadsSignal.value = threadsSignal.value.map((t) => {
    if (t.id === threadId) {
      const newLayer: DialogueLayer = {
        ...layer,
        id: "d" + (t.dialogueLayers.length + 1),
        resonanceScore: 0,
        timestamp: new Date().toISOString(),
      };
      const updated = { ...t, dialogueLayers: [...t.dialogueLayers, newLayer] };
      // Persist dialogue layers to backend
      const isDemo = userSignal.value?.id === "__demo__";
      if (!isDemo && !threadId.startsWith("t")) {
        safeFetch(`/api/threads/${threadId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dialogueLayers: updated.dialogueLayers }),
          entity: "thread",
        }).catch((e) => console.error("Failed to sync dialogue layers:", e));
      }
      return updated;
    }
    return t;
  });
}

export async function toggleThreadPrivacy(id: string) {
  const thread = threadsSignal.value.find((t) => t.id === id);
  if (thread) await updateThread(id, { isPublic: !thread.isPublic });
}

export async function updateThreadMood(id: string, mood: ThreadMood) {
  await updateThread(id, { mood });
}

export function removeItemFromThread(threadId: string, itemId: string) {
  const thread = threadsSignal.value.find((t) => t.id === threadId);
  if (!thread) return;
  const newItemIds = thread.itemIds.filter((i) => i !== itemId);
  updateThread(threadId, { itemIds: newItemIds });
}

export function resetThreads() {
  threadsSignal.value = [];
}

export async function toggleFavoriteThread(id: string) {
  const thread = threadsSignal.value.find((t) => t.id === id);
  if (thread) await updateThread(id, { isFavorited: !thread.isFavorited });
}

export async function togglePinThread(id: string) {
  const thread = threadsSignal.value.find((t) => t.id === id);
  if (thread) await updateThread(id, { isPinned: !thread.isPinned });
}

export async function toggleArchiveThread(id: string) {
  const thread = threadsSignal.value.find((t) => t.id === id);
  if (thread) await updateThread(id, { isArchived: !thread.isArchived });
}

export async function deleteThread(id: string) {
  const isDemo = userSignal.value?.id === "__demo__";
  threadsSignal.value = threadsSignal.value.filter((t) => t.id !== id);

  if (!isDemo && !id.startsWith("t")) {
    try {
      await safeFetch(`/api/threads/${id}`, {
        method: "DELETE",
        entity: "thread",
      });
    } catch (e) {
      console.error("Failed to delete thread on backend:", e);
    }
  }
}

// ─── Offline Sync Callback ───────────────────────────────────────────────
registerIdSwapCallback("thread", (tempId, realId) => {
  threadsSignal.value = threadsSignal.value.map((t) =>
    t.id === tempId ? { ...t, id: realId } : t
  );
});
