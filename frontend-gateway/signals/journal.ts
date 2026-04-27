import { signal } from "@preact/signals";

export type JournalMood =
  | 'reflective'
  | 'grounded'
  | 'anxious'
  | 'grateful'
  | 'melancholic'
  | 'charged'
  | 'empty'
  | 'alive'
  | 'inspired'
  | 'nostalgic'
  | 'focused'
  | 'tender'
  | 'custom';

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  mood: JournalMood;
  customMood?: string;
  tags: string[];
  linkedItemIds: string[];
  prompt?: string;
  isFavorited: boolean;
  isPublic: boolean;
  wordCount: number;
  createdAt: number;
  updatedAt: number;
}

const seed = Date.now();

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const defaultJournalEntries: JournalEntry[] = [
  {
    id: 'j1',
    title: 'On brutalist architecture and silence',
    body: `I've been contemplating the heavy intersection of brutalist architecture and ambient noise.

There's something incredibly grounding about raw concrete. It doesn't pretend to be anything else — it is just structure and shadows. When you pair that stark visual with the 4-hour ambient rain mix I collected yesterday, it completely changes the atmosphere of the room. It builds a kind of "cognitive fortress."

The Atlantic article really nailed it: our brains are so over-stimulated by vibrant, algorithmic content that these "heavy" or "dull" themes actually feel lightweight and healing to us now. The friction of the concrete is the point.

I want to sit inside that feeling longer. Not fix it. Not analyze it. Just inhabit it.`,
    mood: 'reflective',
    tags: ['architecture', 'silence', 'ambient'],
    linkedItemIds: [],
    isFavorited: false,
    isPublic: false,
    wordCount: 122,
    createdAt: seed - 86400000 * 3,
    updatedAt: seed - 86400000 * 3,
  },
  {
    id: 'j2',
    title: 'The problem with infinite feeds',
    body: `Today I felt it again — that restless scrolling without actually absorbing anything. I consumed maybe 200 pieces of content and retained almost none of it.

What does it mean to actually receive something? The difference between reading a long-form article slowly and scanning a feed at speed is not just quantity — it's a different mode of consciousness entirely.

One mode builds something. The other erodes it.

I wonder if that's why collecting feels so different. Each thing I save to Muse is a choice. A small declaration that this mattered, at least in this moment.`,
    mood: 'anxious',
    tags: ['attention', 'digital', 'intentionality'],
    linkedItemIds: ['103'],
    isFavorited: false,
    isPublic: false,
    wordCount: 107,
    createdAt: seed - 86400000 * 1,
    updatedAt: seed - 86400000 * 1,
  },
  {
    id: 'j3',
    title: 'Grateful for the ordinary',
    body: `Strange day. Nothing happened, really. Made coffee slowly. Watched the light shift across the wall for a while. Listened to something quiet.

There was no algorithm serving me anything. No notifications. Just the immediate texture of the hour.

I felt, weirdly, very full.

Maybe the cure for everything is just being somewhere specific, paying attention to nothing in particular.`,
    mood: 'grateful',
    tags: ['slowness', 'presence', 'gratitude'],
    linkedItemIds: [],
    isFavorited: true,
    isPublic: false,
    wordCount: 68,
    createdAt: seed - 3600000 * 2,
    updatedAt: seed - 3600000 * 2,
  },
];

export const journalSignal = signal<JournalEntry[]>(defaultJournalEntries);

export const dailyWordGoalSignal = signal<number>(300);

// Actions
export function setDailyWordGoal(goal: number) {
  dailyWordGoalSignal.value = goal;
}

export function addEntry(mood: JournalMood = 'reflective', isPublic = false): JournalEntry {
  const newEntry: JournalEntry = {
    id: 'j-' + Date.now(),
    title: '',
    body: '',
    mood,
    tags: [],
    linkedItemIds: [],
    isFavorited: false,
    isPublic: isPublic,
    wordCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  journalSignal.value = [newEntry, ...journalSignal.value];
  return newEntry;
}

export function updateJournalEntry(id: string, updates: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>) {
  journalSignal.value = journalSignal.value.map(e => {
    if (e.id !== id) return e;
    const merged = { ...e, ...updates, updatedAt: Date.now() };
    if (!updates.title && updates.body !== undefined) {
      const firstLine = updates.body.split('\n').find(l => l.trim()) || '';
      merged.title = firstLine.slice(0, 60);
    }
    if (updates.body !== undefined) {
      merged.wordCount = countWords(updates.body);
    }
    return merged;
  });
}

export function deleteJournalEntry(id: string) {
  journalSignal.value = journalSignal.value.filter(e => e.id !== id);
}

export function toggleFavoriteJournal(id: string) {
  journalSignal.value = journalSignal.value.map(e => e.id === id ? { ...e, isFavorited: !e.isFavorited } : e);
}

export function toggleJournalPrivacy(id: string) {
  journalSignal.value = journalSignal.value.map(e => e.id === id ? { ...e, isPublic: !e.isPublic, updatedAt: Date.now() } : e);
}

export function resetJournalEntries() {
  journalSignal.value = defaultJournalEntries.map((entry) => ({ ...entry, tags: [...entry.tags], linkedItemIds: [...entry.linkedItemIds] }));
}

// Helpers
export function getJournalTitle(entry: JournalEntry): string {
  return entry.title || entry.body.split('\n').find(l => l.trim())?.slice(0, 60) || 'Untitled';
}

export function getJournalStreak(): number {
  const entries = journalSignal.value;
  if (!entries.length) return 0;
  const days = new Set(entries.map(e => new Date(e.createdAt).toDateString()));
  let streak = 0;
  const d = new Date();
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function getTodayWordCount(): number {
  const entries = journalSignal.value;
  const today = new Date().toDateString();
  return entries
    .filter(e => new Date(e.createdAt).toDateString() === today)
    .reduce((sum, e) => sum + e.wordCount, 0);
}
