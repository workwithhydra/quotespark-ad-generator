'use client';

import { RoofingClient } from '@/lib/clients';

interface ClientTabsProps {
  clients: RoofingClient[];
  activeClientId: string;
  onSelect: (clientId: string) => void;
  onAddClient: () => void;
  onEditClient: (client: RoofingClient) => void;
  onDeleteClient: (clientId: string) => void;
}

export default function ClientTabs({
  clients,
  activeClientId,
  onSelect,
  onAddClient,
  onEditClient,
  onDeleteClient,
}: ClientTabsProps) {
  const activeClient = clients.find((c) => c.id === activeClientId);

  function handleDelete(client: RoofingClient) {
    if (confirm(`Delete "${client.name}"? This cannot be undone.`)) {
      onDeleteClient(client.id);
    }
  }

  return (
    <div className="flex gap-1 border-b border-zinc-800 mb-8 overflow-x-auto items-end">
      {clients.map((client) => {
        const isActive = activeClientId === client.id;
        const isRoofing = client.type === 'roofing';

        return (
          <div key={client.id} className="flex-shrink-0 flex items-end">
            <button
              onClick={() => onSelect(client.id)}
              className={`flex items-baseline gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
              }`}
            >
              {client.name}
              {client.market !== 'National' && (
                <span
                  className={`text-xs ${isActive ? 'text-orange-400/60' : 'text-zinc-600'}`}
                >
                  {client.market}
                </span>
              )}
            </button>

            {/* Edit / Delete — only on active roofing client tabs */}
            {isActive && isRoofing && (
              <div className="flex items-center gap-1 pb-3 pr-1">
                <button
                  onClick={() => onEditClient(client)}
                  title="Edit client"
                  className="text-zinc-500 hover:text-zinc-200 text-xs px-1 transition-colors"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDelete(client)}
                  title="Delete client"
                  className="text-zinc-500 hover:text-red-400 text-xs px-1 transition-colors"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Add client button */}
      <button
        onClick={onAddClient}
        className="flex-shrink-0 flex items-center gap-1 px-4 py-3 mb-[2px] text-sm text-zinc-500 hover:text-zinc-200 transition-colors whitespace-nowrap"
      >
        <span className="text-base leading-none">+</span>
        <span>New Client</span>
      </button>
    </div>
  );
}
