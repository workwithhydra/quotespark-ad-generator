'use client';

import { useState } from 'react';
import { GenerateRequest } from '@/lib/types';

const ANGLES = [
  '',
  'Revenue Math',
  'The Ceiling / Referral Cap-Out',
  'Volume Reframe',
  'System vs. Hustle',
  'Testimonial / Client Quote',
  'Diagnostic / Bottleneck ID',
  'Exclusivity / Territory',
  'Speed to Scale',
  'Second Engine',
  'Capacity Unlock',
];

interface GenerateFormProps {
  onGenerate: (request: GenerateRequest) => void;
  isLoading: boolean;
}

export default function GenerateForm({
  onGenerate,
  isLoading,
}: GenerateFormProps) {
  const [angleFocus, setAngleFocus] = useState('');
  const [proofPoints, setProofPoints] = useState('');
  const [conceptCount, setConceptCount] = useState(5);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onGenerate({
      angleFocus: angleFocus || undefined,
      proofPoints: proofPoints || undefined,
      conceptCount,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="angle"
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          Angle Focus
        </label>
        <select
          id="angle"
          value={angleFocus}
          onChange={(e) => setAngleFocus(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">Diversify across angles</option>
          {ANGLES.filter(Boolean).map((angle) => (
            <option key={angle} value={angle}>
              {angle}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="proof"
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          Proof Points{' '}
          <span className="text-zinc-500">(optional)</span>
        </label>
        <textarea
          id="proof"
          value={proofPoints}
          onChange={(e) => setProofPoints(e.target.value)}
          placeholder="e.g. 847 estimates booked last month, $2.3M revenue driven for ABC Roofing..."
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label
          htmlFor="count"
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          Number of Concepts
        </label>
        <select
          id="count"
          value={conceptCount}
          onChange={(e) => setConceptCount(Number(e.target.value))}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          {[3, 5, 8, 10].map((n) => (
            <option key={n} value={n}>
              {n} concepts
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
      >
        {isLoading ? 'Generating...' : 'Generate Ads'}
      </button>
    </form>
  );
}
