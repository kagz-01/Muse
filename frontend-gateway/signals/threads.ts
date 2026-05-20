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
}

export const threadsSignal = signal<Thread[]>([
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
  },
]);

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
  threadsSignal.value = [...threadsSignal.value, {
    ...thread,
    id: newId,
    updatedAt: new Date().toISOString(),
    synthesisScore: Math.floor(Math.random() * 40) + 60,
    resonanceMetrics: { views: 0, connections: 0 },
    dialogueLayers: [],
  }];
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
