'use client';

import { AdConcept } from '@/lib/types';
import React, { useEffect, useRef, useState } from 'react';

interface AdRendererProps {
  concept: AdConcept;
  scale?: number;
  id?: string;
}

function highlightAccentWords(
  text: string,
  accentWords: string[]
): React.ReactNode[] {
  if (!accentWords.length) return [text];

  const escaped = accentWords.map((w) =>
    w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const isAccent = accentWords.some(
      (w) => w.toLowerCase() === part.toLowerCase()
    );
    if (isAccent) {
      return (
        <span key={i} style={{ color: '#FF6B00' }}>
          {part}
        </span>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export default function AdRenderer({ concept, scale = 1, id }: AdRendererProps) {
  const headlineRef = useRef<HTMLDivElement>(null);
  const [headlineFontSize, setHeadlineFontSize] = useState(96);

  useEffect(() => {
    if (!headlineRef.current) return;
    const el = headlineRef.current;
    let size = 96;
    el.style.fontSize = `${size}px`;

    // Step down until headline fits in the upper ~60% (650px)
    while (el.scrollHeight > el.clientHeight && size > 54) {
      size -= 3;
      el.style.fontSize = `${size}px`;
    }
    setHeadlineFontSize(size);
  }, [concept.text_overlay.headline]);

  const bgStyle: React.CSSProperties =
    concept.style.background_type === 'gradient'
      ? {
          background: `linear-gradient(135deg, ${concept.style.background_primary}, ${concept.style.background_secondary || '#0F1B2D'})`,
        }
      : { backgroundColor: concept.style.background_primary };

  return (
    <div
      id={id}
      style={{
        width: 1080,
        height: 1080,
        ...bgStyle,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
      }}
    >
      {/* Content container */}
      <div
        style={{
          position: 'absolute',
          top: 72,
          left: 72,
          right: 72,
          bottom: 72,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Top section: headline + subhead — should own upper 60%+ */}
        <div>
          <div
            ref={headlineRef}
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
              fontSize: headlineFontSize,
              lineHeight: 1.1,
              color: '#FFFFFF',
              textTransform: 'uppercase',
              letterSpacing: '0.01em',
              maxHeight: 650,
              overflow: 'hidden',
            }}
          >
            {highlightAccentWords(
              concept.text_overlay.headline,
              concept.style.headline_accent_words
            )}
          </div>

          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: 32,
              lineHeight: 1.45,
              color: '#94A3B8',
              marginTop: 36,
              maxWidth: 860,
            }}
          >
            {concept.text_overlay.subhead}
          </div>
        </div>

        {/* Bottom section: CTA + proof */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div
            style={{
              backgroundColor: '#FF6B00',
              color: '#FFFFFF',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 22,
              padding: '16px 40px',
              borderRadius: 100,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {concept.text_overlay.cta_badge}
          </div>

          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: 20,
              color: '#94A3B8',
              textAlign: 'right',
              maxWidth: 400,
            }}
          >
            {concept.text_overlay.proof_element}
          </div>
        </div>
      </div>
    </div>
  );
}
