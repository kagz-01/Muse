import { create } from 'zustand';

export interface Item {
  id: string;
  roomId: string;
  title: string;
  sourceUrl: string;
  note?: string;
  createdAt: number;
}

interface ItemsState {
  items: Item[];
  addItem: (item: Omit<Item, 'id' | 'createdAt'>) => void;
  deleteItem: (id: string) => void;
}

const mockItems: Item[] = [
  {
    id: '101',
    roomId: '2',
    title: 'Brutalist Architecture Concept - Tokyo',
    sourceUrl: 'https://pinterest.com/pin/brutalist-tokyo',
    note: 'The stark concrete feels isolating but serene.',
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: '102',
    roomId: '1',
    title: 'Ambient Rain Mix - 4 Hours',
    sourceUrl: 'https://youtube.com/watch?v=ambient-rain',
    note: 'Listened while viewing the concrete designs.',
    createdAt: Date.now() - 86400000 * 1
  },
  {
    id: '103',
    roomId: '3',
    title: 'The Age of Algorithmic Anxiety',
    sourceUrl: 'https://theatlantic.com/tech/anxiety',
    note: 'Exactly why I started using Muse. Grounding.',
    createdAt: Date.now() - 4000000
  },
  {
    id: '104',
    roomId: '2',
    title: 'Dieter Rams - 10 Principles',
    sourceUrl: 'https://vitsoe.com/10-principles',
    note: 'Less, but better. Always.',
    createdAt: Date.now() - 20000000
  },
  {
    id: '105',
    roomId: '5',
    title: 'AI and The Future of Solitude',
    sourceUrl: 'https://wired.com/ai-solitude',
    note: 'Interesting juxtaposition against the community pods.',
    createdAt: Date.now() - 1000000
  }
];

export const useItemsStore = create<ItemsState>((set) => ({
  items: mockItems,
  addItem: (item) => set((state) => ({
    items: [{ ...item, id: Date.now().toString(), createdAt: Date.now() }, ...state.items]
  })),
  deleteItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  }))
}));
