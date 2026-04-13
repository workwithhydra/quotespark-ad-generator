'use client';

import { useRef } from 'react';
import { RoofingClient } from '@/lib/clients';
import { exportClientData, importClientData } from '@/lib/client-store';

interface SidebarProps {
  onImport: () => void;
  clients: RoofingClient[];
  activeClientId: string;
  onSelect: (clientId: string) => void;
  onAddClient: () => void;
  onEditClient: (client: RoofingClient) => void;
  onDeleteClient: (clientId: string) => void;
}

export default function Sidebar({
  clients,
  activeClientId,
  onSelect,
  onAddClient,
  onEditClient,
  onDeleteClient,
  onImport,
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        importClientData(ev.target?.result as string);
        onImport();
      } catch {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }
  function handleDelete(client: RoofingClient, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm(`Delete "${client.name}"? This cannot be undone.`)) {
      onDeleteClient(client.id);
    }
  }

  return (
    <aside className="w-52 flex-shrink-0 bg-zinc-950 border-r border-zinc-800 flex flex-col">
      {/* Client list */}
      <div className="flex-1 overflow-y-auto py-4">
        <p className="px-4 mb-2 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
          Clients
        </p>

        <div className="space-y-0.5 px-2">
          {clients.map((client) => {
            const isActive = client.id === activeClientId;

            return (
              <div
                key={client.id}
                onClick={() => onSelect(client.id)}
                className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-orange-500 rounded-r" />
                )}

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : ''}`}>
                    {client.name}
                  </p>
                  {client.market && client.market !== 'National' && (
                    <p className="text-xs text-zinc-500 truncate">{client.market}</p>
                  )}
                </div>

                {/* Action icons — visible on hover or when active */}
                <div className={`flex items-center gap-0.5 flex-shrink-0 transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditClient(client); }}
                    title="Edit client"
                    className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 transition-colors text-xs"
                  >
                    ✎
                  </button>
                  {!client.protected && (
                    <button
                      onClick={(e) => handleDelete(client, e)}
                      title="Delete client"
                      className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-700 transition-colors text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="p-3 border-t border-zinc-800 space-y-1">
        <button
          onClick={onAddClient}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors text-sm"
        >
          <span className="text-base leading-none">+</span>
          New Client
        </button>
        <div className="flex gap-1">
          <button
            onClick={exportClientData}
            title="Export all client data to JSON"
            className="flex-1 px-3 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-colors text-xs text-center"
          >
            Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import client data from JSON backup"
            className="flex-1 px-3 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-colors text-xs text-center"
          >
            Import
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportFile}
          className="hidden"
        />
      </div>
    </aside>
  );
}
