import { AdConcept } from './types';

export interface SavedBatch {
  id: string;
  clientId: string;
  clientName: string;
  createdAt: string; // ISO
  concepts: AdConcept[];
}

const BATCHES_KEY = 'qs_saved_batches';

function getAllBatches(): SavedBatch[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BATCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setAllBatches(batches: SavedBatch[]): void {
  localStorage.setItem(BATCHES_KEY, JSON.stringify(batches));
}

export function getBatchesForClient(clientId: string): SavedBatch[] {
  return getAllBatches()
    .filter((b) => b.clientId === clientId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // newest first
}

export function saveBatch(
  clientId: string,
  clientName: string,
  concepts: AdConcept[]
): SavedBatch {
  const batch: SavedBatch = {
    id: `${clientId}-${Date.now()}`,
    clientId,
    clientName,
    createdAt: new Date().toISOString(),
    concepts,
  };
  const all = getAllBatches();
  all.push(batch);
  setAllBatches(all);
  return batch;
}

export function deleteBatch(id: string): void {
  setAllBatches(getAllBatches().filter((b) => b.id !== id));
}

export function formatBatchDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `Today ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return `Yesterday ${time}`;

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` ${time}`;
}
