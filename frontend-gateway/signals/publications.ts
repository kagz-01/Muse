import { signal } from "@preact/signals";

export interface Publication {
  id: string;
  authorId: string;
  authorName: string;
  authorAura: string;
  title: string;
  content: string;
  sourceThreadId?: string;
  lineageRoomIds: string[];
  resonanceScore: number;
  timestamp: string;
  auraGradients: string[];
  isImmutable: boolean;
  txId?: string; // Simulated Ledger ID
}

export const publicationsSignal = signal<Publication[]>([
  {
    id: 'p1',
    authorId: 'u1',
    authorName: 'Kagz',
    authorAura: '#6366f1',
    title: 'The Honesty of Raw Materials',
    content: 'My latest synthesis on how brutalist architecture serves as a blueprint for digital sovereignty. When we stop hiding the infrastructure, we start owning the experience.',
    sourceThreadId: 't1',
    lineageRoomIds: ['r1', 'r2'],
    resonanceScore: 94,
    timestamp: new Date().toISOString(),
    auraGradients: ['#6366f1', '#10b981'],
    isImmutable: true,
    txId: '0x7e2...9a1'
  }
]);

export function publishThought(publication: Omit<Publication, 'id' | 'timestamp' | 'resonanceScore' | 'txId'>) {
  const newId = 'pub-' + Date.now();
  const txId = publication.isImmutable ? '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 6) : undefined;
  
  publicationsSignal.value = [
    { 
      ...publication, 
      id: newId, 
      timestamp: new Date().toISOString(), 
      resonanceScore: 0,
      txId
    },
    ...publicationsSignal.value
  ];
}
