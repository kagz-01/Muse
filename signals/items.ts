import { signal } from "@preact/signals";

export interface Item {
  id: string;
  roomId: string;
  title: string;
  sourceUrl: string;
  note?: string;
  isPublic: boolean;
  createdAt: number;
}

const mockItems: Item[] = [
  {
    id: '101',
    roomId: 'visuals-architect', // updated to match actual default room IDs roughly
    title: 'Brutalist Architecture Concept - Tokyo',
    sourceUrl: 'https://pinterest.com/pin/brutalist-tokyo',
    note: 'The stark concrete feels isolating but serene.',
    isPublic: false,
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: '102',
    roomId: 'music-ambience',
    title: 'Ambient Rain Mix - 4 Hours',
    sourceUrl: 'https://youtube.com/watch?v=ambient-rain',
    note: 'Listened while viewing the concrete designs.',
    isPublic: true,
    createdAt: Date.now() - 86400000 * 1
  },
  {
    id: '103',
    roomId: 'ideas-articles',
    title: 'The Age of Algorithmic Anxiety',
    sourceUrl: 'https://theatlantic.com/tech/anxiety',
    note: 'Exactly why I started using Muse. Grounding.',
    isPublic: false,
    createdAt: Date.now() - 4000000
  },
  {
    id: '104',
    roomId: 'visuals-architect',
    title: 'Dieter Rams - 10 Principles',
    sourceUrl: 'https://vitsoe.com/10-principles',
    note: 'Less, but better. Always.',
    isPublic: false,
    createdAt: Date.now() - 20000000
  },
  {
    id: '105',
    roomId: 'technology',
    title: 'AI and The Future of Solitude',
    sourceUrl: 'https://wired.com/ai-solitude',
    note: 'Interesting juxtaposition against the community pods.',
    isPublic: true,
    createdAt: Date.now() - 1000000
  }
];

export const itemsSignal = signal<Item[]>(mockItems);

export function addItem(item: Omit<Item, 'id' | 'createdAt'>): Item {
  const newItem: Item = { ...item, id: Date.now().toString(), createdAt: Date.now() };
  itemsSignal.value = [newItem, ...itemsSignal.value];
  return newItem;
}

export function deleteItem(id: string) {
  itemsSignal.value = itemsSignal.value.filter(item => item.id !== id);
}
