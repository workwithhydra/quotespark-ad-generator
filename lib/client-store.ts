import { RoofingClient } from './clients';

const STORAGE_KEY = 'qs_roofing_clients';

export function getStoredClients(): RoofingClient[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredClient(client: RoofingClient): void {
  const clients = getStoredClients();
  const idx = clients.findIndex((c) => c.id === client.id);
  if (idx >= 0) {
    clients[idx] = client;
  } else {
    clients.push(client);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export function deleteStoredClient(id: string): void {
  const clients = getStoredClients().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
