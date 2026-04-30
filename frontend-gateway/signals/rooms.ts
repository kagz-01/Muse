import { signal } from "@preact/signals";

export type RoomTheme = 'indigo' | 'emerald' | 'rose' | 'amber' | 'cyan' | 'slate';

export interface Room {
  id: string;
  name: string;
  description?: string;
  themeColor: RoomTheme;
  coverImage?: string;
  isPublic: boolean;
  count: number;
  updatedAt: string;
  semanticTags: string[]; // AI-extracted tags for cross-room synthesis
  customStyling?: {
    wallpaper?: string;
    auraIntensity?: number;
    fontFamily?: string;
  };
}

export const roomsSignal = signal<Room[]>([
  {
    id: 'r1',
    name: 'Aesthetic Brutalism',
    description: 'A sanctuary for monolithic forms and raw digital honesty.',
    themeColor: 'indigo',
    coverImage: 'https://images.unsplash.com/photo-1518005020250-58003994bf3b?auto=format&fit=crop&w=1200&q=80',
    isPublic: true,
    count: 5,
    updatedAt: new Date().toISOString(),
    semanticTags: ['architecture', 'design', 'brutalism']
  },
  {
    id: 'r2',
    name: 'Cognitive Stoicism',
    description: 'Practices and signals for maintaining digital sovereignty.',
    themeColor: 'emerald',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    isPublic: false,
    count: 3,
    updatedAt: new Date().toISOString(),
    semanticTags: ['stoicism', 'philosophy', 'mindfulness']
  }
]);

export function addRoom(room: Omit<Room, 'id' | 'updatedAt' | 'count' | 'semanticTags'>) {
  const newId = 'r' + (roomsSignal.value.length + 1);
  
  // Semantic Conflict Check (Simulation)
  const isDuplicate = roomsSignal.value.some(r => 
    r.name.toLowerCase() === room.name.toLowerCase() || 
    (room.name.toLowerCase() === 'michezo' && r.name.toLowerCase() === 'sports')
  );

  if (isDuplicate) {
    console.warn(`Semantic conflict detected for room: ${room.name}. Suggesting merge...`);
  }

  roomsSignal.value = [...roomsSignal.value, { 
    ...room, 
    id: newId, 
    updatedAt: new Date().toISOString(), 
    count: 0,
    semanticTags: [] // Will be populated by AI after artifact collection
  }];
}

export function updateRoomTheme(id: string, theme: RoomTheme) {
  roomsSignal.value = roomsSignal.value.map(r => r.id === id ? { ...r, themeColor: theme } : r);
}

export function updateRoomCover(id: string, cover: string) {
  roomsSignal.value = roomsSignal.value.map(r => r.id === id ? { ...r, coverImage: cover } : r);
}

export function toggleRoomPrivacy(id: string) {
  roomsSignal.value = roomsSignal.value.map(r => r.id === id ? { ...r, isPublic: !r.isPublic } : r);
}
