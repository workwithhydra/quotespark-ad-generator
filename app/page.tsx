'use client';

import { useState, useEffect } from 'react';
import { AdConcept, GenerateRequest } from '@/lib/types';
import { CLIENTS, RoofingClient } from '@/lib/clients';
import { getStoredClients, saveStoredClient, deleteStoredClient } from '@/lib/client-store';
import GenerateForm from '@/components/GenerateForm';
import AdGrid from '@/components/AdGrid';
import LoadingState from '@/components/LoadingState';
import ClientTabs from '@/components/ClientTabs';
import AddClientModal from '@/components/AddClientModal';
import ShipView from '@/components/ShipView';

export default function Home() {
  const [roofingClients, setRoofingClients] = useState<RoofingClient[]>([]);
  const [activeClientId, setActiveClientId] = useState(CLIENTS[0].id);
  const [concepts, setConcepts] = useState<AdConcept[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<RoofingClient | undefined>(undefined);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [showShipView, setShowShipView] = useState(false);

  useEffect(() => {
    setRoofingClients(getStoredClients());
  }, []);

  const allClients = [...CLIENTS, ...roofingClients];
  const activeClient = allClients.find((c) => c.id === activeClientId) ?? CLIENTS[0];

  function handleClientSelect(clientId: string) {
    setActiveClientId(clientId);
    setConcepts([]);
    setError(null);
    setSelectedIndices(new Set());
  }

  function handleToggleSelect(index: number) {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleSaveClient(client: RoofingClient) {
    saveStoredClient(client);
    setRoofingClients(getStoredClients());
    setActiveClientId(client.id);
    setConcepts([]);
    setError(null);
    setShowModal(false);
  }

  function handleDeleteClient(clientId: string) {
    deleteStoredClient(clientId);
    setRoofingClients(getStoredClients());
    if (activeClientId === clientId) {
      setActiveClientId(CLIENTS[0].id);
      setConcepts([]);
      setSelectedIndices(new Set());
    }
  }

  async function handleGenerate(request: GenerateRequest) {
    setIsLoading(true);
    setError(null);
    setConcepts([]);
    setSelectedIndices(new Set());

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setConcepts(data.concepts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  // Ship view is a full-screen overlay
  if (showShipView) {
    return (
      <ShipView
        concepts={concepts}
        selectedIndices={selectedIndices}
        client={activeClient}
        onClose={() => setShowShipView(false)}
        onToggleSelect={handleToggleSelect}
        onEditClient={(client) => {
          setShowShipView(false);
          setEditingClient(client);
          setShowModal(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">QuoteSpark Ad Generator</h1>
            <p className="text-sm text-zinc-400">Static ad concepts for Meta</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedIndices.size > 0 && (
              <span className="text-sm text-zinc-400">
                {selectedIndices.size} selected
              </span>
            )}
            <button
              onClick={() => setShowShipView(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-5 rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              Ship to Meta
              {selectedIndices.size > 0 && (
                <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {selectedIndices.size}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <ClientTabs
          clients={allClients}
          activeClientId={activeClientId}
          onSelect={handleClientSelect}
          onAddClient={() => { setEditingClient(undefined); setShowModal(true); }}
          onEditClient={(client) => { setEditingClient(client); setShowModal(true); }}
          onDeleteClient={handleDeleteClient}
        />

        <div className="max-w-lg mb-12">
          <GenerateForm
            clientId={activeClient.id}
            clientType={activeClient.type}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
        </div>

        {error && (
          <div className="mb-8 bg-red-900/30 border border-red-800 text-red-300 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        {isLoading && <LoadingState />}

        {!isLoading && concepts.length > 0 && (
          <AdGrid
            concepts={concepts}
            selectedIndices={selectedIndices}
            onToggleSelect={handleToggleSelect}
          />
        )}
      </main>

      {showModal && (
        <AddClientModal
          existingClient={editingClient}
          onSave={handleSaveClient}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
