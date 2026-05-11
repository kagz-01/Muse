import { signal } from "@preact/signals";

export type JournalMood = 
  | 'reflective' | 'grounded' | 'anxious' | 'grateful' 
  | 'melancholic' | 'charged' | 'empty' | 'alive' 
  | 'inspired' | 'nostalgic' | 'focused' | 'tender' | 'custom';

export interface JournalEntry {
  id: string;
  body: string;
  mood: JournalMood;
  customMood?: string;
  tags: string[];
  linkedItemIds: string[];
  isFavorited: boolean;
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
}

const STORAGE_KEY = "muse_journal_v2";

function loadJournal(): JournalEntry[] {
  if (typeof localStorage === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  
  // Seed initial data if empty
  return [
    {
      id: 'j1',
      body: 'The intersection of brutalist architecture and digital sovereignty is a recursive pattern. We seek stability in the raw, unrefined forms of the past to build the immutable structures of the future.',
      mood: 'reflective',
      tags: ['brutalism', 'sovereignty', 'philosophy'],
      linkedItemIds: ['i1', 'i2'],
      isFavorited: true,
      isPublic: false,
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
      wordCount: 32
    },
    {
      id: 'j2',
      body: 'Feeling a profound sense of clarity today. The signals from the "Zen" room are finally converging into a coherent thread.',
      mood: 'inspired',
      tags: ['clarity', 'zen', 'synthesis'],
      linkedItemIds: ['i3'],
      isFavorited: false,
      isPublic: true,
      createdAt: Date.now() - 43200000,
      updatedAt: Date.now() - 43200000,
      wordCount: 18
    }
  ];
}

export const journalSignal = signal<JournalEntry[]>(loadJournal());

// Persistence
if (typeof localStorage !== "undefined") {
  journalSignal.subscribe((entries: JournalEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  });
}

export const dailyWordGoalSignal = signal(500);

export function addEntry(body = "", isPublic = false): JournalEntry {
  const newEntry: JournalEntry = {
    id: crypto.randomUUID(),
    body,
    mood: 'reflective',
    tags: [],
    linkedItemIds: [],
    isFavorited: false,
    isPublic,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    wordCount: body.trim().split(/\s+/).filter(Boolean).length
  };
  
  journalSignal.value = [newEntry, ...journalSignal.value];
  return newEntry;
}

export function updateJournalEntry(id: string, updates: Partial<JournalEntry>) {
  journalSignal.value = journalSignal.value.map((e: JournalEntry) => {
    if (e.id === id) {
      const updated = { ...e, ...updates, updatedAt: Date.now() };
      if (updates.body !== undefined) {
        updated.wordCount = updates.body.trim().split(/\s+/).filter(Boolean).length;
      }
      return updated;
    }
    return e;
  });
}

export function deleteJournalEntry(id: string) {
  journalSignal.value = journalSignal.value.filter((e: JournalEntry) => e.id !== id);
}

export function toggleFavoriteJournal(id: string) {
  journalSignal.value = journalSignal.value.map((e: JournalEntry) => 
    e.id === id ? { ...e, isFavorited: !e.isFavorited } : e
  );
}

export function getJournalStreak(): number {
  const entries = journalSignal.value;
  if (entries.length === 0) return 0;
  
  const dates = entries.map((e: JournalEntry) => new Date(e.createdAt).toDateString());
  const uniqueDates = [...new Set(dates)];
  
  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
    // Basic streak check logic (could be more robust)
    streak = uniqueDates.length; 
  }
  
  return streak;
}

export function getTodayWordCount(): number {
  const today = new Date().toDateString();
  return journalSignal.value
    .filter((e: JournalEntry) => new Date(e.createdAt).toDateString() === today)
    .reduce((sum: number, e: JournalEntry) => sum + e.wordCount, 0);
}

export function getJournalTitle(entry: JournalEntry): string {
  if (entry.body.startsWith('#')) {
    return entry.body.split('\n')[0].replace('#', '').trim();
  }
  const firstLine = entry.body.split('\n')[0].trim();
  return firstLine.length > 40 ? firstLine.slice(0, 40) + '...' : firstLine;
}

export function resetJournalEntries() {
  journalSignal.value = [];
}
