'use client';

import { AdConcept } from '@/lib/types';
import AdCard from './AdCard';

interface AdGridProps {
  concepts: AdConcept[];
}

export default function AdGrid({ concepts }: AdGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {concepts.map((concept, i) => (
        <AdCard key={i} concept={concept} index={i} />
      ))}
    </div>
  );
}
