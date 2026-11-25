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

export const publicationsSignal = signal<Publication[]>([]);

export function publishThought(
  publication: Omit<
    Publication,
    "id" | "timestamp" | "resonanceScore" | "txId"
  >,
) {
  const newId = "pub-" + Date.now();
  const txId = publication.isImmutable
    ? "0x" + Math.random().toString(16).slice(2, 10) + "..." +
      Math.random().toString(16).slice(2, 6)
    : undefined;

  publicationsSignal.value = [
    {
      ...publication,
      id: newId,
      timestamp: new Date().toISOString(),
      resonanceScore: 0,
      txId,
    },
    ...publicationsSignal.value,
  ];
}
