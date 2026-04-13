'use client';

import { useState } from 'react';
import { AdConcept } from '@/lib/types';
import { RoofingClient } from '@/lib/clients';
import AdRenderer from './AdRenderer';
import { captureAdAsBase64 } from '@/lib/export-png';

interface ShipModalProps {
  concepts: AdConcept[];
  selectedIndices: Set<number>;
  client: RoofingClient;
  onClose: () => void;
  onEditClient: (client: RoofingClient) => void;
}

interface UploadResult {
  name: string;
  success: boolean;
  hash?: string;
  url?: string;
  error?: string;
}

type Status = 'idle' | 'capturing' | 'uploading' | 'done' | 'error';

export default function ShipModal({
  concepts,
  selectedIndices,
  client,
  onClose,
  onEditClient,
}: ShipModalProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [results, setResults] = useState<UploadResult[]>([]);
  const [progressMsg, setProgressMsg] = useState('');

  const selectedConcepts = Array.from(selectedIndices).map((i) => concepts[i]);
  const hasCredentials = !!(client.ad_account_id && client.meta_access_token);

  // Normalize account ID — strip act_ prefix for the URL, we add it back in the API
  const accountDisplay = client.ad_account_id
    ? client.ad_account_id.replace(/^act_/, 'act_')
    : 'Not configured';

  async function handleShip() {
    if (!hasCredentials) return;

    setStatus('capturing');
    setProgressMsg('Rendering ads...');

    try {
      // Capture each selected ad as base64
      const images: { name: string; base64: string }[] = [];

      for (let i = 0; i < selectedConcepts.length; i++) {
        const concept = selectedConcepts[i];
        const elementId = `ship-render-${i}`;
        setProgressMsg(`Rendering ${i + 1} of ${selectedConcepts.length}...`);
        const base64 = await captureAdAsBase64(elementId);
        images.push({
          name: concept.name.toLowerCase().replace(/\s+/g, '-'),
          base64,
        });
      }

      setStatus('uploading');
      setProgressMsg('Uploading to Meta...');

      const res = await fetch('/api/meta/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad_account_id: client.ad_account_id,
          access_token: client.meta_access_token,
          images,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResults(data.results);
      setStatus('done');
    } catch (err) {
      setProgressMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  const successCount = results.filter((r) => r.success).length;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-white">Ship to Meta</h2>
            <p className="text-sm text-zinc-400">{client.name} · {accountDisplay}</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Missing credentials warning */}
          {!hasCredentials && (
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg px-4 py-3 flex items-start gap-3">
              <span className="text-yellow-400 text-lg">⚠</span>
              <div>
                <p className="text-yellow-300 font-medium text-sm">Meta credentials not set up</p>
                <p className="text-yellow-400/70 text-xs mt-1">
                  Add an Ad Account ID and Access Token to this client to enable shipping.
                </p>
                <button
                  onClick={() => onEditClient(client)}
                  className="text-yellow-400 hover:text-yellow-200 text-xs underline mt-2"
                >
                  Edit client settings →
                </button>
              </div>
            </div>
          )}

          {/* Selected ads preview */}
          <div>
            <p className="text-sm font-medium text-zinc-400 mb-3">
              {selectedConcepts.length} ad{selectedConcepts.length !== 1 ? 's' : ''} selected
            </p>
            <div className="grid grid-cols-3 gap-3">
              {selectedConcepts.map((concept, i) => {
                const result = results.find((r) => r.name === concept.name.toLowerCase().replace(/\s+/g, '-'));
                return (
                  <div key={i} className="relative">
                    <div
                      className="overflow-hidden rounded-lg bg-zinc-800"
                      style={{ width: '100%', aspectRatio: '1/1' }}
                    >
                      <div style={{ width: 1080, height: 1080, transform: 'scale(0.175)', transformOrigin: 'top left' }}>
                        <AdRenderer concept={concept} />
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 truncate">{concept.name}</p>
                    {/* Result badge */}
                    {result && (
                      <div className={`absolute top-1 left-1 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold ${
                        result.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {result.success ? '✓' : '✗'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hidden full-res renders for capture */}
          <div style={{ position: 'absolute', left: -9999, top: 0, pointerEvents: 'none' }}>
            {selectedConcepts.map((concept, i) => (
              <AdRenderer key={i} concept={concept} id={`ship-render-${i}`} />
            ))}
          </div>

          {/* Results list */}
          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-300">
                {successCount} of {results.length} uploaded successfully
              </p>
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 px-3 py-2 rounded-lg text-sm ${
                    r.success ? 'bg-green-900/20 border border-green-800' : 'bg-red-900/20 border border-red-800'
                  }`}
                >
                  <span className={r.success ? 'text-green-400' : 'text-red-400'}>
                    {r.success ? '✓' : '✗'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className={r.success ? 'text-green-300' : 'text-red-300'}>{r.name}</span>
                    {r.success && r.hash && (
                      <p className="text-zinc-500 text-xs mt-0.5 font-mono truncate">hash: {r.hash}</p>
                    )}
                    {!r.success && r.error && (
                      <p className="text-red-400 text-xs mt-0.5">{r.error}</p>
                    )}
                  </div>
                </div>
              ))}

              {successCount > 0 && client.ad_account_id && (
                <a
                  href={`https://www.facebook.com/ads/manager/account/settings/?act=${client.ad_account_id.replace(/^act_/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-orange-400 hover:text-orange-300 underline mt-2"
                >
                  Open Meta Ads Manager →
                </a>
              )}
            </div>
          )}

          {/* Status message */}
          {(status === 'capturing' || status === 'uploading' || status === 'error') && (
            <div className={`text-sm px-4 py-3 rounded-lg ${
              status === 'error'
                ? 'bg-red-900/30 border border-red-800 text-red-300'
                : 'bg-zinc-800 text-zinc-300'
            }`}>
              {status !== 'error' && (
                <span className="inline-block w-3 h-3 border-2 border-zinc-400 border-t-white rounded-full animate-spin mr-2" />
              )}
              {progressMsg}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-zinc-800">
            <button
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {status === 'done' ? 'Close' : 'Cancel'}
            </button>
            {status !== 'done' && (
              <button
                onClick={handleShip}
                disabled={!hasCredentials || status === 'capturing' || status === 'uploading'}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                {status === 'capturing' || status === 'uploading'
                  ? 'Pushing...'
                  : `Push ${selectedConcepts.length} Ad${selectedConcepts.length !== 1 ? 's' : ''} to Meta`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
