'use client';

import { useState, useEffect } from 'react';
import { RoofingClient } from '@/lib/clients';
import { slugify } from '@/lib/client-store';

interface AddClientModalProps {
  existingClient?: RoofingClient;
  onSave: (client: RoofingClient) => void;
  onClose: () => void;
}

const EMPTY_FORM = {
  name: '',
  market: '',
  services: '',
  avgTicket: '',
  differentiators: '',
  proofPoints: '',
};

export default function AddClientModal({ existingClient, onSave, onClose }: AddClientModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (existingClient) {
      setForm({
        name: existingClient.name,
        market: existingClient.market,
        services: existingClient.services,
        avgTicket: existingClient.avgTicket ?? '',
        differentiators: existingClient.differentiators.join('\n'),
        proofPoints: existingClient.proofPoints.join('\n'),
      });
    }
  }, [existingClient]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const client: RoofingClient = {
      id: existingClient?.id ?? slugify(form.name),
      name: form.name.trim(),
      market: form.market.trim(),
      services: form.services.trim(),
      avgTicket: form.avgTicket.trim() || undefined,
      differentiators: form.differentiators
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
      proofPoints: form.proofPoints
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
      type: 'roofing',
    };

    onSave(client);
  }

  function update(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const isEditing = !!existingClient;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">
            {isEditing ? `Edit ${existingClient.name}` : 'New Roofing Client'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Business Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="ABC Roofing"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Market */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Market / City <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.market}
              onChange={(e) => update('market', e.target.value)}
              placeholder="Phoenix, AZ"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Services <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.services}
              onChange={(e) => update('services', e.target.value)}
              placeholder="roof replacement, repairs, gutters, free inspections"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Avg Ticket */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Average Job Ticket{' '}
              <span className="text-zinc-500">(optional)</span>
            </label>
            <input
              type="text"
              value={form.avgTicket}
              onChange={(e) => update('avgTicket', e.target.value)}
              placeholder="$14,000"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Differentiators */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Differentiators{' '}
              <span className="text-zinc-500">(one per line)</span>
            </label>
            <textarea
              value={form.differentiators}
              onChange={(e) => update('differentiators', e.target.value)}
              placeholder={`Family-owned 20+ years\nLicensed & insured\nLifetime warranty on labor\nInsurance claim specialists`}
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Proof Points */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Proof Points{' '}
              <span className="text-zinc-500">(one per line)</span>
            </label>
            <textarea
              value={form.proofPoints}
              onChange={(e) => update('proofPoints', e.target.value)}
              placeholder={`500+ roofs replaced\n4.9 stars on Google (200+ reviews)\n$0 out of pocket for most insurance claims`}
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
