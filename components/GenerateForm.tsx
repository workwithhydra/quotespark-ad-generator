'use client';

import { useState } from 'react';
import { GenerateRequest } from '@/lib/types';

const QUOTESPARK_ANGLES = [
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

const ROOFING_CLIENT_ANGLES = [
  { value: '', label: 'Diversify across angles' },
  { value: 'Storm Damage / Insurance — "$0 out of pocket. Your insurance covers this." Massive pattern interrupt for homeowners who don\'t know their policy covers storm damage.', label: 'Storm Damage / Insurance' },
  { value: 'Roof Age — "If your roof is 15+ years old, here\'s what\'s happening right now." Educational/diagnostic angle that triggers unaware homeowners.', label: 'Roof Age (15+ Years)' },
  { value: 'Leaking Now — Urgent repair needed. Water damage and mold compound fast. Every week they wait costs more.', label: 'Leaking Now / Urgent' },
  { value: 'Home Value / Selling — Roof is the #1 thing buyers flag on inspection reports. Replace before listing to protect sale price.', label: 'Home Value / Selling Soon' },
  { value: 'Free Inspection — Lowest barrier to entry. No pressure. "We\'ll tell you exactly what you have." Bring in the lead, close on the visit.', label: 'Free Inspection Offer' },
  { value: 'Reviews / Social Proof — Real neighbors, real results. Lead with specific star rating and review count to build trust instantly.', label: 'Reviews / Social Proof' },
  { value: 'Financing — $0 down, monthly payments. Don\'t postpone because of budget. Make the purchase decision easy.', label: 'Financing / $0 Down' },
  { value: 'Seasonal Urgency — Before storm season / before winter. Real urgency tied to weather and timing, not manufactured scarcity.', label: 'Seasonal Urgency' },
  { value: 'Before/After — Old roof to new roof. Simple visual proof of the transformation. Let the result sell itself.', label: 'Before / After' },
  { value: 'Local / Family-Owned — We\'re your neighbors. Not a national chain. We stand behind our work. Trust signal vs. faceless competitors.', label: 'Local / Family-Owned' },
];

const DESIGN_STYLES = [
  { value: '', label: 'Mix styles (recommended)' },
  { value: 'Dark Cinematic — dark #0F0F0F background with warm golden spotlight gradient. Orange accent numbers. Yellow or gray subhead.', label: 'Dark Cinematic' },
  { value: 'Deep Navy — dark navy #0A1628 to #1E3A5F gradient background. White or yellow subhead. Serious and credible.', label: 'Deep Navy' },
  { value: 'Charcoal Minimal — solid charcoal #1A1A1A background, no gradient. White subhead. Clean and uncluttered.', label: 'Charcoal Minimal' },
  { value: 'Warm Rust — deep rust #1C0A00 to #2D1500 gradient. Yellow or white subhead. Urgency and warmth.', label: 'Warm Rust' },
  { value: 'Light Clean — off-white #F5F5F0 solid background. theme: "light". Dark #111111 headline text. Dark gray or orange subhead. Professional and trustworthy.', label: 'Light Clean' },
];

interface GenerateFormProps {
  clientId: string;
  clientType: 'quotespark' | 'roofing';
  onGenerate: (request: GenerateRequest) => void;
  isLoading: boolean;
}

export default function GenerateForm({
  clientId,
  clientType,
  onGenerate,
  isLoading,
}: GenerateFormProps) {
  const [angleFocus, setAngleFocus] = useState('');
  const [proofPoints, setProofPoints] = useState('');
  const [conceptCount, setConceptCount] = useState(5);
  const [designStyle, setDesignStyle] = useState('');

  const angles = clientType === 'quotespark' ? QUOTESPARK_ANGLES : ROOFING_CLIENT_ANGLES;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onGenerate({
      clientId,
      angleFocus: angleFocus || undefined,
      proofPoints: proofPoints || undefined,
      conceptCount,
      designStyle: designStyle || undefined,
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
          {angles.map((angle) => (
            <option key={angle.label} value={angle.value}>
              {angle.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="style"
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          Design Style
        </label>
        <select
          id="style"
          value={designStyle}
          onChange={(e) => setDesignStyle(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          {DESIGN_STYLES.map((s) => (
            <option key={s.label} value={s.value}>
              {s.label}
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
          placeholder={
            clientType === 'quotespark'
              ? 'e.g. 847 estimates booked last month, $2.3M revenue driven for ABC Roofing...'
              : 'e.g. replaced 12 roofs in the neighborhood last month, 4.9 stars on Google, $0 out of pocket for storm claims...'
          }
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
