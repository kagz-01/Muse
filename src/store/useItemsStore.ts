import { create } from 'zustand';

export interface AssetItem {
  id: string;
  roomId: string;
  title: string;
  sourceUrl: string;
  sourceIcon?: string;
  note?: string;
  dateSaved: string;
}

interface ItemsState {
  items: AssetItem[];
  addItem: (item: Omit<AssetItem, 'id' | 'dateSaved'>) => void;
  deleteItem: (id: string) => void;
  moveItem: (id: string, newRoomId: string) => void;
}

const INITIAL_ITEMS: AssetItem[] = [
  { id: 'i1', roomId: '1', title: 'Minimalist Poster Design', sourceUrl: 'https://pinterest.com/pin/123', note: 'Love the negative space here.', dateSaved: new Date().toISOString() },
  { id: 'i2', roomId: '2', title: 'Kyoto Ambient Mix', sourceUrl: 'https://youtube.com/watch?v=123', dateSaved: new Date().toISOString() },
];

export const useItemsStore = create<ItemsState>((set) => ({
  items: INITIAL_ITEMS,
  addItem: (item) => set((state) => ({
    items: [{ ...item, id: Date.now().toString(), dateSaved: new Date().toISOString() }, ...state.items]
  })),
  deleteItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),
  moveItem: (id, newRoomId) => set((state) => ({
    items: state.items.map(i => i.id === id ? { ...i, roomId: newRoomId } : i)
  }))
}));
