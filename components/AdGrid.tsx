'use client';

import { AdConcept } from '@/lib/types';
import AdCard from './AdCard';

interface AdGridProps {
  concepts: AdConcept[];
  selectedIndices: Set<number>;
  onToggleSelect: (i: number) => void;
}

export default function AdGrid({ concepts, selectedIndices, onToggleSelect }: AdGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-28">
      {concepts.map((concept, i) => (
        <AdCard
          key={i}
          concept={concept}
          index={i}
          selected={selectedIndices.has(i)}
          onToggleSelect={() => onToggleSelect(i)}
        />
      ))}
    </div>
  );
}
