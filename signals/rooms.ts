import { signal } from "@preact/signals";

export type RoomTheme = 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'slate';

export interface Room {
  id: string;
  name: string;
  count: number;
  description: string;
  coverImage: string;
  themeColor: RoomTheme;
  isPublic: boolean;
}

export const roomsSignal = signal<Room[]>([
  { 
    id: 'music-ambience', 
    name: 'Music & Ambience', 
    count: 24, 
    description: 'Sonic architectures for deep focus, creative flow, and emotional resonance. Curated mixes, ambient vinyl drops, and live session captures.',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    themeColor: 'indigo',
    isPublic: true
  },
  { 
    id: 'visuals-architect', 
    name: 'Visuals & Architect', 
    count: 18, 
    description: 'Brutalist structures, striking interior lighting, glassmorphic interfaces, and raw typographic studies. A highly sensitive visual collection.',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    themeColor: 'slate',
    isPublic: false
  },
  { 
    id: 'ideas-articles', 
    name: 'Ideas & Articles', 
    count: 42, 
    description: 'Long-form philosophical essays, psychological breakdowns, software architecture manifestos, and deeply contemplative digital poetry.',
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead27d8?auto=format&fit=crop&w=1200&q=80',
    themeColor: 'emerald',
    isPublic: true
  },
  { 
    id: 'humor', 
    name: 'Humor & Irreverence', 
    count: 5, 
    description: 'Because the weight of the algorithmic void is too heavy without a moment of absolute absurdity.',
    coverImage: 'https://images.unsplash.com/photo-1545244585-61019661cd89?auto=format&fit=crop&w=1200&q=80',
    themeColor: 'amber',
    isPublic: false
  },
  { 
    id: 'technology', 
    name: 'Technology', 
    count: 11, 
    description: 'Next-generation framework drops, Rust optimizations, agentic AI developments, and raw compute infrastructure.',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    themeColor: 'cyan',
    isPublic: true
  },
  { 
    id: 'romance', 
    name: 'Romance & Tragedy', 
    count: 8, 
    description: 'The agonizing beauty of human connection captured through cinema stills, heartbreaking quotes, and deep reflection.',
    coverImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80',
    themeColor: 'rose',
    isPublic: false
  },
  { 
    id: 'sports', 
    name: 'Physical Pursuits', 
    count: 3, 
    description: 'Elite performance tracking, climbing routes, kinesthetic mastery, and the art of physical endurance.',
    coverImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    themeColor: 'indigo',
    isPublic: false
  }
]);

export function addRoom(name: string, description: string, themeColor: RoomTheme, coverImage = '', isPublic = false): Room {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
  const newRoom: Room = { id, name, description, themeColor, count: 0, coverImage, isPublic };
  roomsSignal.value = [...roomsSignal.value, newRoom];
  return newRoom;
}

export function updateRoom(id: string, updates: Partial<Omit<Room, 'id'>>) {
  roomsSignal.value = roomsSignal.value.map(room => room.id === id ? { ...room, ...updates } : room);
}

export function updateRoomTheme(id: string, themeColor: RoomTheme) {
  roomsSignal.value = roomsSignal.value.map(room => room.id === id ? { ...room, themeColor } : room);
}

export function updateRoomCover(id: string, coverImage: string) {
  roomsSignal.value = roomsSignal.value.map(room => room.id === id ? { ...room, coverImage } : room);
}

export function toggleRoomPrivacy(id: string) {
  roomsSignal.value = roomsSignal.value.map(room => room.id === id ? { ...room, isPublic: !room.isPublic } : room);
}

export function deleteRoom(id: string) {
  roomsSignal.value = roomsSignal.value.filter(room => room.id !== id);
}
