'use client';

import { useState } from 'react';
import { GenerateRequest } from '@/lib/types';

const ANGLES = [
  { value: '', label: 'Diversify across angles' },
  { value: 'Revenue Math — Show the exact math to $1.1M/month. Jobs x ticket x close rate. Let the numbers sell.', label: 'Revenue Math' },
  { value: 'The Ceiling / Referral Cap-Out — "Referrals got you to $400K/month. They won\'t get you to $1.1M." Name the plateau.', label: 'The Ceiling / Referral Cap-Out' },
  { value: 'Volume Reframe — "You don\'t need to close better. You need 3x the estimates." Reframe the bottleneck.', label: 'Volume Reframe' },
  { value: 'System vs. Hustle — "The roofers hitting $1M+ months built a system. They\'re not outworking you — they\'re out-engineering you."', label: 'System vs. Hustle' },
  { value: 'Testimonial / Client Quote — Bold quote from a roofing company owner who scaled with QuoteSpark.', label: 'Testimonial / Client Quote' },
  { value: 'Diagnostic / Bottleneck ID — "You don\'t have a sales problem. You have a lead volume problem." Identify what\'s actually holding them back.', label: 'Diagnostic / Bottleneck ID' },
  { value: 'Exclusivity / Territory — "Your market. Your leads. One roofer per territory. Once it\'s claimed, it\'s gone."', label: 'Exclusivity / Territory' },
  { value: 'Speed to Scale — "First leads in 7 days. Not 7 months of brand-building." Speed without hype.', label: 'Speed to Scale' },
  { value: 'Second Engine — "Your first engine (referrals) got you here. Your second engine (paid acquisition) gets you to $1.1M."', label: 'Second Engine' },
  { value: 'Capacity Unlock — "You have the crews. You have the closers. You don\'t have enough at-bats." Frame lead gen as unlocking capacity they already have.', label: 'Capacity Unlock' },
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
          {ANGLES.map((angle) => (
            <option key={angle.label} value={angle.value}>
              {angle.label}
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
