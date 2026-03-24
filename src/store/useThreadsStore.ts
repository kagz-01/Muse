import { create } from 'zustand';

export interface Thread {
  id: string;
  title: string;
  description: string;
  itemIds: string[];
}

interface ThreadsState {
  threads: Thread[];
  addThread: (title: string, description: string, itemIds: string[]) => void;
  deleteThread: (id: string) => void;
}

const INITIAL_THREADS: Thread[] = [
  { id: 't1', title: 'Themes of Isolation', description: 'Connections between the brutalist architecture and ambient mix.', itemIds: ['i1', 'i2'] }
];

export const useThreadsStore = create<ThreadsState>((set) => ({
  threads: INITIAL_THREADS,
  addThread: (title, description, itemIds) => set((state) => ({
    threads: [{ id: Date.now().toString(), title, description, itemIds }, ...state.threads]
  })),
  deleteThread: (id) => set((state) => ({
    threads: state.threads.filter(t => t.id !== id)
  }))
}));
