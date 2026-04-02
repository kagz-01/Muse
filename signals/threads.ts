import { signal } from "@preact/signals";

export type ThreadMood = 'contemplative' | 'curious' | 'dark' | 'hopeful' | 'urgent' | 'serene';

export interface Thread {
  id: string;
  title: string;
  description: string;
  thesis: string;
  mood: ThreadMood;
  coverImage: string;
  itemIds: string[];
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

const now = Date.now();

const defaultThreads: Thread[] = [
  {
    id: 't1',
    title: 'Themes of Isolation',
    description: 'Connections between brutalist structure and ambient rain.',
    thesis: 'Can physical and sonic isolation produce the same emotional architecture — a feeling of being entirely alone, but totally safe and insulated from the noise?',
    mood: 'contemplative',
    coverImage: 'https://images.unsplash.com/photo-1509460913899-515f1df34fea?auto=format&fit=crop&w=1200&q=80',
    itemIds: ['101', '102'],
    isPublic: true,
    createdAt: now - 86400000 * 3,
    updatedAt: now - 86400000 * 1,
  },
  {
    id: 't2',
    title: 'Digital Detox',
    description: 'Thoughts on escaping the algorithmic void through tech-minimalism.',
    thesis: 'What does it mean to be intentional in a world designed to capture every idle second of attention?',
    mood: 'urgent',
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    itemIds: ['103', '105'],
    isPublic: false,
    createdAt: now - 86400000 * 2,
    updatedAt: now - 86400000 * 1,
  },
  {
    id: 't3',
    title: 'The Aesthetic of Restraint',
    description: 'What happens when you remove everything that doesn\'t belong?',
    thesis: 'Dieter Rams and ambient composers share the same philosophy: remove everything until what remains is only what is necessary.',
    mood: 'serene',
    coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c3a14f57?auto=format&fit=crop&w=1200&q=80',
    itemIds: ['104'],
    isPublic: true,
    createdAt: now - 86400000 * 5,
    updatedAt: now - 86400000 * 2,
  }
];

export const threadsSignal = signal<Thread[]>(defaultThreads);

// Actions
export function addThread(data: Omit<Thread, 'id' | 'createdAt' | 'updatedAt' | 'itemIds'>): Thread {
  const newThread: Thread = {
    ...data,
    id: 'th-' + Date.now(),
    itemIds: [],
    isPublic: data.isPublic ?? false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  threadsSignal.value = [newThread, ...threadsSignal.value];
  return newThread;
}

export function updateThread(id: string, updates: Partial<Omit<Thread, 'id' | 'createdAt'>>) {
  threadsSignal.value = threadsSignal.value.map(t => t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t);
}

export function deleteThread(id: string) {
  threadsSignal.value = threadsSignal.value.filter(t => t.id !== id);
}

export function addItemToThread(threadId: string, itemId: string) {
  threadsSignal.value = threadsSignal.value.map(t =>
    t.id === threadId && !t.itemIds.includes(itemId)
      ? { ...t, itemIds: [...t.itemIds, itemId], updatedAt: Date.now() }
      : t
  );
}

export function removeItemFromThread(threadId: string, itemId: string) {
  threadsSignal.value = threadsSignal.value.map(t =>
    t.id === threadId
      ? { ...t, itemIds: t.itemIds.filter(i => i !== itemId), updatedAt: Date.now() }
      : t
  );
}

export function toggleThreadPrivacy(id: string) {
  threadsSignal.value = threadsSignal.value.map(t => t.id === id ? { ...t, isPublic: !t.isPublic, updatedAt: Date.now() } : t);
}

export function resetThreads() {
  threadsSignal.value = defaultThreads.map((thread) => ({ ...thread, itemIds: [...thread.itemIds] }));
}
