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

export default function Home() {
  const [roofingClients, setRoofingClients] = useState<RoofingClient[]>([]);
  const [activeClientId, setActiveClientId] = useState(CLIENTS[0].id);
  const [concepts, setConcepts] = useState<AdConcept[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<RoofingClient | undefined>(undefined);

  // Load persisted roofing clients on mount
  useEffect(() => {
    setRoofingClients(getStoredClients());
  }, []);

  const allClients = [...CLIENTS, ...roofingClients];
  const activeClient = allClients.find((c) => c.id === activeClientId) ?? CLIENTS[0];

  function handleClientSelect(clientId: string) {
    setActiveClientId(clientId);
    setConcepts([]);
    setError(null);
  }

  function handleOpenAdd() {
    setEditingClient(undefined);
    setShowModal(true);
  }

  function handleOpenEdit(client: RoofingClient) {
    setEditingClient(client);
    setShowModal(true);
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
    const remaining = getStoredClients();
    setRoofingClients(remaining);
    // Fall back to QuoteSpark if the active client was deleted
    if (activeClientId === clientId) {
      setActiveClientId(CLIENTS[0].id);
      setConcepts([]);
    }
  }

  async function handleGenerate(request: GenerateRequest) {
    setIsLoading(true);
    setError(null);
    setConcepts([]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setConcepts(data.concepts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              QuoteSpark Ad Generator
            </h1>
            <p className="text-sm text-zinc-400">Static ad concepts for Meta</p>
          </div>
          {concepts.length > 0 && (
            <span className="text-sm text-zinc-400">
              {concepts.length} concept{concepts.length !== 1 ? 's' : ''} generated
            </span>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Client tabs */}
        <ClientTabs
          clients={allClients}
          activeClientId={activeClientId}
          onSelect={handleClientSelect}
          onAddClient={handleOpenAdd}
          onEditClient={handleOpenEdit}
          onDeleteClient={handleDeleteClient}
        />

        {/* Form — always visible at top */}
        <div className="max-w-lg mb-12">
          <GenerateForm
            clientId={activeClient.id}
            clientType={activeClient.type}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 bg-red-900/30 border border-red-800 text-red-300 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && <LoadingState />}

        {/* Results */}
        {!isLoading && concepts.length > 0 && <AdGrid concepts={concepts} />}
      </main>

      {/* Add / Edit client modal */}
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
