import { create } from 'zustand';

export interface Room {
  id: string;
  name: string;
  count: number;
}

interface RoomsState {
  rooms: Room[];
  addRoom: (name: string) => void;
  updateCount: (id: string, delta: number) => void;
}

export const useRoomsStore = create<RoomsState>((set) => ({
  rooms: [
    { id: '1', name: 'Music & Ambience', count: 12 },
    { id: '2', name: 'Visuals & Architect', count: 8 },
    { id: '3', name: 'Ideas & Articles', count: 15 },
    { id: '4', name: 'Politics & Society', count: 4 },
    { id: '5', name: 'Technology', count: 9 },
    { id: '6', name: 'Romance', count: 2 },
    { id: '7', name: 'Sports', count: 5 },
    { id: '8', name: 'Humor', count: 22 },
  ],
  addRoom: (name) => set((state) => ({
    rooms: [...state.rooms, { id: Date.now().toString(), name, count: 0 }]
  })),
  updateCount: (id, delta) => set((state) => ({
    rooms: state.rooms.map(r => r.id === id ? { ...r, count: r.count + delta } : r)
  }))
}));
