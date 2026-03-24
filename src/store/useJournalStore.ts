import { create } from 'zustand';

interface JournalState {
  content: string;
  lastSaved: string | null;
  setContent: (content: string) => void;
  saveContent: () => void;
}

export const useJournalStore = create<JournalState>((set) => ({
  content: '# My Thoughts Today\n\n...',
  lastSaved: null,
  setContent: (content) => set({ content }),
  saveContent: () => set({ lastSaved: new Date().toISOString() })
}));
