import { create } from 'zustand';

export interface Room {
  id: string;
  name: string;
  count: number;
}

interface RoomsState {
  rooms: Room[];
  addRoom: (name: string) => void;
  deleteRoom: (id: string) => void;
  renameRoom: (id: string, newName: string) => void;
}

const INITIAL_ROOMS: Room[] = [
  { id: '1', name: 'Visual Idea', count: 12 },
  { id: '2', name: 'Music', count: 34 },
  { id: '3', name: 'Architecture', count: 8 },
  { id: '4', name: 'Politics', count: 4 },
];

export const useRoomsStore = create<RoomsState>((set) => ({
  rooms: INITIAL_ROOMS,
  addRoom: (name) => set((state) => ({
    rooms: [...state.rooms, { id: Date.now().toString(), name, count: 0 }]
  })),
  deleteRoom: (id) => set((state) => ({
    rooms: state.rooms.filter(r => r.id !== id)
  })),
  renameRoom: (id, newName) => set((state) => ({
    rooms: state.rooms.map(r => r.id === id ? { ...r, name: newName } : r)
  }))
}));
