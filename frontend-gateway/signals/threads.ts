import { signal } from "@preact/signals";

export type ThreadMood =
  | "contemplative"
  | "curious"
  | "dark"
  | "hopeful"
  | "urgent"
  | "serene";

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
  itemIds: string[];
  sourceRoomIds: string[];
  isPublic: boolean;
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
  // Vault functionality
  isVault?: boolean; // Private thread with password protection
  vaultPassword?: string; // Hashed password for vault threads
  isVaultUnlocked?: boolean; // Runtime flag for unlocked status
  // Synthesis analysis
  synthesis?: {
    patterns: string[];
    tensions: string[];
    coherenceScore: number;
    recommendations: string[];
  };
}

const STORAGE_KEY = "muse_threads_v1";

const INITIAL_THREADS: Thread[] = [
  {
    id: "t1",
    title: "The Honesty of Raw Materials",
    description:
      "Synthesizing brutalist architecture with digital sovereignty.",
    mood: "contemplative",
    itemIds: ["i1", "i2"],
    sourceRoomIds: ["r1", "r2"],
    isPublic: true,
    updatedAt: new Date().toISOString(),
    coverImage:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    thesis:
      "If digital interfaces reflect the honesty of raw concrete, we can achieve true sovereignty.",
    synthesisScore: 88,
    resonanceMetrics: { views: 1240, connections: 86 },
    dialogueLayers: [
      {
        id: "d1",
        userId: "u2",
        userName: "Elena",
        content:
          'This resonance between architecture and data is striking. Have you considered the material cost of digital storage as a form of "rawness"?',
        type: "insight",
        resonanceScore: 42,
        timestamp: new Date().toISOString(),
      },
    ],
    customStyling: {
      auraGradients: ["#6366f1", "#10b981"],
    },
    synthesis: {
      patterns: ["authenticity", "sovereignty", "structure"],
      tensions: ["minimal vs complex - balancing opposite forces"],
      coherenceScore: 85,
      recommendations: [
        'Explore the theme of "authenticity" more deeply across your rooms',
        "Address the tension: minimal vs complex - balancing opposite forces",
        "Consider how these patterns interconnect: authenticity, sovereignty, structure",
      ],
    },
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

if (typeof localStorage !== "undefined") {
  threadsSignal.subscribe((threads: Thread[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    } catch {
      // Ignore storage write errors (readonly or restricted environments)
    }
  });
}

export function addThread(
  thread: Omit<
    Thread,
    | "id"
    | "updatedAt"
    | "synthesisScore"
    | "resonanceMetrics"
    | "dialogueLayers"
  >,
) {
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
      return { ...t, dialogueLayers: [...t.dialogueLayers, newLayer] };
    }
    return t;
  });
}

export function toggleThreadPrivacy(id: string) {
  threadsSignal.value = threadsSignal.value.map((t) =>
    t.id === id ? { ...t, isPublic: !t.isPublic } : t
  );
}

export function updateThreadMood(id: string, mood: ThreadMood) {
  threadsSignal.value = threadsSignal.value.map((t) =>
    t.id === id ? { ...t, mood, updatedAt: new Date().toISOString() } : t
  );
}

export function removeItemFromThread(threadId: string, itemId: string) {
  threadsSignal.value = threadsSignal.value.map((t) =>
    t.id === threadId
      ? {
        ...t,
        itemIds: t.itemIds.filter((i) => i !== itemId),
        updatedAt: new Date().toISOString(),
      }
      : t
  );
}

export function resetThreads() {
  threadsSignal.value = [];
}

// Vault functionality
export function unlockVaultThread(threadId: string, password: string): boolean {
  const thread = threadsSignal.value.find((t) => t.id === threadId);
  if (!thread || !thread.isVault) return false;

  // Simple hash comparison (in production, use proper bcrypt)
  const inputHash = hashPassword(password);
  if (inputHash === thread.vaultPassword) {
    threadsSignal.value = threadsSignal.value.map((t) =>
      t.id === threadId ? { ...t, isVaultUnlocked: true } : t
    );
    return true;
  }
  return false;
}

export function lockVaultThread(threadId: string) {
  threadsSignal.value = threadsSignal.value.map((t) =>
    t.id === threadId ? { ...t, isVaultUnlocked: false } : t
  );
}

export function createVaultThread(
  thread: Omit<
    Thread,
    | "id"
    | "updatedAt"
    | "synthesisScore"
    | "resonanceMetrics"
    | "dialogueLayers"
  >,
  password: string,
) {
  const newId = "t" + (threadsSignal.value.length + 1);
  const hashedPassword = hashPassword(password);
  const newThread: Thread = {
    ...thread,
    id: newId,
    updatedAt: new Date().toISOString(),
    synthesisScore: Math.floor(Math.random() * 40) + 60,
    resonanceMetrics: { views: 0, connections: 0 },
    dialogueLayers: [],
    isVault: true,
    vaultPassword: hashedPassword,
    isVaultUnlocked: false,
  };
  threadsSignal.value = [...threadsSignal.value, newThread];
  return newId;
}

// Simple hash function (for demo - use proper bcrypt in production)
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return "hash_" + Math.abs(hash).toString(16);
}
