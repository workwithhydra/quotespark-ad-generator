'use client';

import { useState } from 'react';
import { AdConcept } from '@/lib/types';
import AdRenderer from './AdRenderer';
import AdRenderer916 from './AdRenderer916';
import { exportAdAsPng } from '@/lib/export-png';
import { copyGeminiJson } from '@/lib/export-json';

interface AdCardProps {
  concept: AdConcept;
  index: number;
  selected?: boolean;
  onToggleSelect?: () => void;
}

type Ratio = '1:1' | '9:16';

export default function AdCard({ concept, index, selected = false, onToggleSelect }: AdCardProps) {
  const [ratio, setRatio] = useState<Ratio>('1:1');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const rendererId = `ad-render-${index}-${ratio.replace(':', 'x')}`;
  const previewScale = ratio === '1:1' ? 0.333 : 0.188;
  const previewWidth = ratio === '1:1' ? 1080 * 0.333 : 1080 * 0.188;
  const previewHeight = ratio === '1:1' ? 1080 * 0.333 : 1920 * 0.188;

  async function handleDownload() {
    setDownloading(true);
    try {
      const suffix = ratio === '1:1' ? '1080x1080' : '1080x1920';
      await exportAdAsPng(
        rendererId,
        `quotespark-${concept.name.toLowerCase().replace(/\s+/g, '-')}-${suffix}`
      );
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopyJson() {
    try {
      await copyGeminiJson(concept.gemini_json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }

  return (
    <div
      className={`bg-zinc-800 rounded-xl overflow-hidden border-2 transition-colors ${
        selected ? 'border-orange-500' : 'border-zinc-700'
      }`}
    >
      {/* Preview */}
      <div
        className="relative bg-zinc-900 overflow-hidden mx-auto"
        style={{ width: previewWidth, height: previewHeight }}
      >
        {/* Selection toggle overlay */}
        {onToggleSelect && (
          <button
            onClick={onToggleSelect}
            className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-lg ${
              selected
                ? 'bg-orange-500 text-white'
                : 'bg-black/50 text-zinc-400 hover:bg-black/70 hover:text-white'
            }`}
          >
            {selected ? '✓' : '+'}
          </button>
        )}
        {ratio === '1:1' ? (
          <AdRenderer concept={concept} scale={previewScale} />
        ) : (
          <AdRenderer916 concept={concept} scale={previewScale} />
        )}
      </div>

      {/* Hidden full-res render for export */}
      <div
        style={{
          position: 'absolute',
          left: -9999,
          top: 0,
          pointerEvents: 'none',
        }}
      >
        {ratio === '1:1' ? (
          <AdRenderer concept={concept} id={rendererId} />
        ) : (
          <AdRenderer916 concept={concept} id={rendererId} />
        )}
      </div>

      {/* Info + Controls */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-white font-semibold text-lg">{concept.name}</h3>
          <p className="text-zinc-400 text-sm">
            {concept.angle} &middot; {concept.awareness_level}
          </p>
        </div>

        {/* Ratio toggle */}
        <div className="flex gap-1 bg-zinc-900 rounded-lg p-1">
          <button
            onClick={() => setRatio('1:1')}
            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
              ratio === '1:1'
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            1:1
          </button>
          <button
            onClick={() => setRatio('9:16')}
            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
              ratio === '9:16'
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            9:16
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            {downloading ? 'Saving...' : 'Download PNG'}
          </button>
          <button
            onClick={handleCopyJson}
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
        </div>
      </div>
    </div>
  );
}
