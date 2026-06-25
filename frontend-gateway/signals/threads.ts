import { signal } from "@preact/signals";
import { userSignal } from "./user.ts";

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

const INITIAL_THREADS: Thread[] = [
  {
    id: "t1",
    title: "The Impact of Local Elections",
    description:
      "Analyzing how municipal votes shape daily life more than national ones.",
    mood: "focus",
    format: "essay",
    depth: "50",
    itemIds: ["i1", "i2"],
    sourceRoomIds: ["r1"],
    isPublic: true,
    updatedAt: new Date().toISOString(),
    coverImage:
      "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80",
    thesis:
      "Local elections have more direct impact on our communities, yet they suffer the lowest turnout.",
    synthesisScore: 88,
    resonanceMetrics: { views: 1240, connections: 86 },
    dialogueLayers: [
      {
        id: "d1",
        userId: "u2",
        userName: "Elena",
        content:
          "This is so true. Our city council just passed a zoning law that completely changed my neighborhood, and only 15% of people voted on it.",
        type: "insight",
        resonanceScore: 42,
        timestamp: new Date().toISOString(),
      },
    ],
    customStyling: {
      auraGradients: ["#6366f1", "#10b981"],
    },
    synthesis: {
      patterns: ["local engagement", "policy impact", "voter apathy"],
      tensions: ["national media focus vs local reality"],
      coherenceScore: 85,
      recommendations: [
        "Explore ways to make local election information more accessible",
      ],
    },
    isVault: false,
  },
  {
    id: "t2",
    title: "The Evolution of Modern Dating",
    description:
      "How dating apps and social media have shifted human connection.",
    mood: "melancholy",
    format: "manifesto",
    depth: "80",
    itemIds: ["i3"],
    sourceRoomIds: ["r2"],
    isPublic: true,
    updatedAt: new Date().toISOString(),
    coverImage:
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80",
    thesis:
      "Modern dating apps have fundamentally shifted human connection from serendipitous moments to gamified transactions.",
    synthesisScore: 75,
    resonanceMetrics: { views: 890, connections: 45 },
    dialogueLayers: [],
    customStyling: {
      auraGradients: ["#f43f5e", "#fbbf24"],
    },
    synthesis: {
      patterns: ["gamification", "choice paralysis", "digital romance"],
      tensions: ["efficiency vs authentic connection"],
      coherenceScore: 78,
      recommendations: [
        "Look into the psychological effects of endless swiping",
      ],
    },
    isVault: false,
  },
];

function loadThreads(): Thread[] {
  if (typeof localStorage === "undefined") return INITIAL_THREADS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_THREADS;
    const parsed = JSON.parse(stored) as Thread[];
    return Array.isArray(parsed) ? parsed : INITIAL_THREADS;
  } catch {
    return INITIAL_THREADS;
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

  const response = await fetch("/api/threads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(thread),
  });

  if (!response.ok) {
    throw new Error(`Failed to create thread: ${await response.text()}`);
  }

  const { thread: newThread } = await response.json();
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
      await fetch(`/api/threads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
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
        fetch(`/api/threads/${threadId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dialogueLayers: updated.dialogueLayers }),
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
      await fetch(`/api/threads/${id}`, { method: "DELETE" });
    } catch (e) {
      console.error("Failed to delete thread on backend:", e);
    }
  }
}
