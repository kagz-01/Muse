import { create } from 'zustand';

export interface Thread {
  id: string;
  name: string;
  itemIds: string[]; // references Item.id
  description?: string;
}

interface ThreadsState {
  threads: Thread[];
  addThread: (name: string, description?: string) => void;
  addItemToThread: (threadId: string, itemId: string) => void;
}

export const useThreadsStore = create<ThreadsState>((set) => ({
  threads: [
    {
      id: 't1',
      name: 'Themes of Isolation',
      itemIds: ['101', '102'],
      description: 'Connections between brutalist structure and ambient rain. A cohesive aesthetic of being entirely alone, but totally safe and insulated from the noise.'
    },
    {
      id: 't2',
      name: 'Digital Detox',
      itemIds: ['103', '105'],
      description: 'Thoughts on escaping the algorithmic void through tech-minimalism.'
    }
  ],
  addThread: (name, description) => set((state) => ({
    threads: [...state.threads, { id: Date.now().toString(), name, description, itemIds: [] }]
  })),
  addItemToThread: (threadId, itemId) => set((state) => ({
    threads: state.threads.map(t => 
      t.id === threadId && !t.itemIds.includes(itemId)
        ? { ...t, itemIds: [...t.itemIds, itemId] }
        : t
    )
  }))
}));
