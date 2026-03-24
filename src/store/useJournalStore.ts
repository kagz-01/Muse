import { create } from 'zustand';

interface JournalState {
  content: string;
  setContent: (content: string) => void;
  lastSaved: number | null;
  saveContent: () => void;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  content: `I've been contemplating the heavy intersection of brutalist architecture and ambient noise. 

There's something incredibly grounding about raw concrete. It doesn't pretend to be anything else—it is just structure and shadows. When you pair that stark visual with the 4-hour ambient rain mix I collected yesterday, it completely changes the atmosphere of the room. It builds a kind of "cognitive fortress."

The Atlantic article really nailed it: our brains are so over-stimulated by vibrant, algorithmic content that these "heavy" or "dull" themes actually feel lightweight and healing to us now. The friction of the concrete is the point.

I want to explore this more in the portrait. Maybe set up a specific Interest Pod around architectural brutalism?`,
  lastSaved: Date.now() - 60000,
  setContent: (content) => set({ content }),
  saveContent: () => {
    // In a real app, this would be an API call
    set({ lastSaved: Date.now() });
  }
}));
