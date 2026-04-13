import { RoofingClient, QUOTESPARK_DEFAULT } from './clients';

const ROOFING_KEY = 'qs_roofing_clients';
const OVERRIDES_KEY = 'qs_client_overrides'; // for protected clients (e.g. QuoteSpark)

// ─── Roofing clients (add/edit/delete) ───────────────────────────────────────

export function getStoredClients(): RoofingClient[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ROOFING_KEY);
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
  localStorage.setItem(ROOFING_KEY, JSON.stringify(clients));
}

export function deleteStoredClient(id: string): void {
  const clients = getStoredClients().filter((c) => c.id !== id);
  localStorage.setItem(ROOFING_KEY, JSON.stringify(clients));
}

// ─── Protected client overrides (QuoteSpark, etc.) ───────────────────────────

type Overrides = Record<string, Partial<RoofingClient>>;

export function getClientOverrides(): Overrides {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveClientOverride(id: string, fields: Partial<RoofingClient>): void {
  const overrides = getClientOverrides();
  overrides[id] = { ...(overrides[id] ?? {}), ...fields };
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}

// ─── Merged QuoteSpark (base + saved overrides) ───────────────────────────────

export function getQuoteSpark(): RoofingClient {
  if (typeof window === 'undefined') return QUOTESPARK_DEFAULT;
  const overrides = getClientOverrides();
  return { ...QUOTESPARK_DEFAULT, ...(overrides['quotespark'] ?? {}) };
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
