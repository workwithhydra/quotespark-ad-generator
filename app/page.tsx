'use client';

import { useState } from 'react';
import { AdConcept, GenerateRequest } from '@/lib/types';
import GenerateForm from '@/components/GenerateForm';
import AdGrid from '@/components/AdGrid';
import LoadingState from '@/components/LoadingState';

export default function Home() {
  const [concepts, setConcepts] = useState<AdConcept[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || 'Server returned an invalid response');
      }

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
            <p className="text-sm text-zinc-400">
              Static ad concepts for Meta
            </p>
          </div>
          {concepts.length > 0 && (
            <span className="text-sm text-zinc-400">
              {concepts.length} concept{concepts.length !== 1 ? 's' : ''}{' '}
              generated
            </span>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Form — always visible at top */}
        <div className="max-w-lg mb-12">
          <GenerateForm onGenerate={handleGenerate} isLoading={isLoading} />
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
    </div>
  );
}
