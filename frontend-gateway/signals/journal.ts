import { signal } from "@preact/signals";

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  sourceIds: string[]; // Rooms or Threads being contemplated
  isReflectionOnly: boolean; // Standalone reflection not yet linked
  createdAt: string;
  updatedAt: string;
  sentiment?: 'analytical' | 'creative' | 'critical' | 'serene';
  resonanceClusters: string[]; // AI-identified tags found in this entry
}

export const journalSignal = signal<JournalEntry[]>([
  {
    id: 'j1',
    title: 'On the Honesty of Form',
    content: 'My collection in Aesthetic Brutalism is starting to resonate with my thoughts on digital sovereignty. There is a raw honesty in both...',
    sourceIds: ['r1', 't1'],
    isReflectionOnly: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sentiment: 'analytical',
    resonanceClusters: ['brutalism', 'sovereignty']
  },
  {
    id: 'j2',
    title: 'Morning Reflection',
    content: 'Thinking about the collective today. How do we ensure that sovereign thoughts remain uncompromised while being shared?',
    sourceIds: [],
    isReflectionOnly: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sentiment: 'serene',
    resonanceClusters: ['collective', 'sovereignty']
  }
]);

export function addJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'resonanceClusters'>) {
  const newId = 'j' + (journalSignal.value.length + 1);
  journalSignal.value = [...journalSignal.value, { 
    ...entry, 
    id: newId, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString(),
    resonanceClusters: [] // Populated by AI after entry
  }];
}

export function updateJournalEntry(id: string, content: string) {
  journalSignal.value = journalSignal.value.map(j => 
    j.id === id ? { ...j, content, updatedAt: new Date().toISOString() } : j
  );
}

export function linkJournalToSource(id: string, sourceId: string) {
  journalSignal.value = journalSignal.value.map(j => {
    if (j.id === id) {
      const newSourceIds = j.sourceIds.includes(sourceId) ? j.sourceIds : [...j.sourceIds, sourceId];
      return { ...j, sourceIds: newSourceIds, isReflectionOnly: false };
    }
    return j;
  });
}
