import { signal } from "@preact/signals";

export type ThreadMood = 'contemplative' | 'curious' | 'dark' | 'hopeful' | 'urgent' | 'serene';

export interface Thread {
  id: string;
  title: string;
  description: string;
  mood: ThreadMood;
  itemIds: string[]; // Artifacts woven into this thread
  sourceRoomIds: string[]; // Rooms that provided the artifacts
  isPublic: boolean;
  updatedAt: string;
  coverImage?: string;
  thesis?: string; // The AI-synthesized core question/pattern
  synthesisScore: number; // 0-100% resonance between artifacts
  customStyling?: {
    auraGradients: string[]; // Multi-room synthesis aura
    wallpaper?: string;
    fontFamily?: string;
  };
}

export const threadsSignal = signal<Thread[]>([
  {
    id: 't1',
    title: 'The Honesty of Raw Materials',
    description: 'Synthesizing brutalist architecture with digital sovereignty.',
    mood: 'contemplative',
    itemIds: ['i1', 'i2'],
    sourceRoomIds: ['r1', 'r2'],
    isPublic: true,
    updatedAt: new Date().toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    thesis: 'If digital interfaces reflect the honesty of raw concrete, we can achieve true sovereignty.',
    synthesisScore: 88,
    customStyling: {
      auraGradients: ['#6366f1', '#10b981'] // Indigo + Emerald
    }
  }
]);

export function addThread(thread: Omit<Thread, 'id' | 'updatedAt' | 'synthesisScore'>) {
  const newId = 't' + (threadsSignal.value.length + 1);
  threadsSignal.value = [...threadsSignal.value, { 
    ...thread, 
    id: newId, 
    updatedAt: new Date().toISOString(),
    synthesisScore: Math.floor(Math.random() * 40) + 60 // Simulated AI score
  }];
}

export function updateThreadMood(id: string, mood: ThreadMood) {
  threadsSignal.value = threadsSignal.value.map(t => t.id === id ? { ...t, mood } : t);
}

export function addItemToThread(threadId: string, itemId: string) {
  threadsSignal.value = threadsSignal.value.map(t => {
    if (t.id === threadId) {
      const newItemIds = t.itemIds.includes(itemId) ? t.itemIds : [...t.itemIds, itemId];
      return { ...t, itemIds: newItemIds };
    }
    return t;
  });
}

export function removeItemFromThread(threadId: string, itemId: string) {
  threadsSignal.value = threadsSignal.value.map(t => {
    if (t.id === threadId) {
      return { ...t, itemIds: t.itemIds.filter(id => id !== itemId) };
    }
    return t;
  });
}

export function toggleThreadPrivacy(id: string) {
  threadsSignal.value = threadsSignal.value.map(t => t.id === id ? { ...t, isPublic: !t.isPublic } : t);
}
