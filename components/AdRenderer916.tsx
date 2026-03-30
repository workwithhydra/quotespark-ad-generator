'use client';

import { AdConcept } from '@/lib/types';
import React, { useEffect, useRef, useState } from 'react';

interface AdRenderer916Props {
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

export default function AdRenderer916({
  concept,
  scale = 1,
  id,
}: AdRenderer916Props) {
  const headlineRef = useRef<HTMLDivElement>(null);
  const [headlineFontSize, setHeadlineFontSize] = useState(108);

  useEffect(() => {
    if (!headlineRef.current) return;
    const el = headlineRef.current;
    let size = 108;
    el.style.fontSize = `${size}px`;

    while (el.scrollHeight > el.clientHeight && size > 60) {
      size -= 3;
      el.style.fontSize = `${size}px`;
    }
    setHeadlineFontSize(size);
  }, [concept.text_overlay.headline]);

  const bgStyle: React.CSSProperties =
    concept.style.background_type === 'gradient'
      ? {
          background: `linear-gradient(180deg, ${concept.style.background_primary}, ${concept.style.background_secondary || '#0F1B2D'})`,
        }
      : { backgroundColor: concept.style.background_primary };

  return (
    <div
      id={id}
      style={{
        width: 1080,
        height: 1920,
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
          top: 140,
          left: 80,
          right: 80,
          bottom: 140,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 56,
        }}
      >
        {/* Headline */}
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
            textAlign: 'center',
            maxHeight: 950,
            overflow: 'hidden',
            width: '100%',
          }}
        >
          {highlightAccentWords(
            concept.text_overlay.headline,
            concept.style.headline_accent_words
          )}
        </div>

        {/* Subhead */}
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: 36,
            lineHeight: 1.45,
            color: '#94A3B8',
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          {concept.text_overlay.subhead}
        </div>

        {/* CTA badge */}
        <div
          style={{
            backgroundColor: '#FF6B00',
            color: '#FFFFFF',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 26,
            padding: '20px 56px',
            borderRadius: 100,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {concept.text_overlay.cta_badge}
        </div>

        {/* Proof element */}
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: 22,
            color: '#94A3B8',
            textAlign: 'center',
          }}
        >
          {concept.text_overlay.proof_element}
        </div>
      </div>
    </div>
  );
}
