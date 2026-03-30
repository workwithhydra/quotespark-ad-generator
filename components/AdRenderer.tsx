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

const SUBHEAD_COLORS = {
  gray: '#94A3B8',
  yellow: '#FACC15',
  white: '#FFFFFF',
};

export default function AdRenderer({ concept, scale = 1, id }: AdRendererProps) {
  const headlineRef = useRef<HTMLDivElement>(null);
  const [headlineFontSize, setHeadlineFontSize] = useState(120);

  useEffect(() => {
    if (!headlineRef.current) return;
    const el = headlineRef.current;
    let size = 120;
    el.style.fontSize = `${size}px`;

    while (el.scrollHeight > el.clientHeight && size > 56) {
      size -= 4;
      el.style.fontSize = `${size}px`;
    }
    setHeadlineFontSize(size);
  }, [concept.text_overlay.headline]);

  const isWarmSpotlight = concept.style.background_type === 'warm_spotlight';
  const qualifierBg = concept.style.qualifier_bg === 'red' ? '#DC2626' : 'rgba(255,255,255,0.1)';
  const qualifierBorder = concept.style.qualifier_bg === 'red' ? 'none' : '1px solid rgba(255,255,255,0.3)';
  const subheadColor = SUBHEAD_COLORS[concept.style.subhead_color] || '#94A3B8';

  return (
    <div
      id={id}
      style={{
        width: 1080,
        height: 1080,
        backgroundColor: concept.style.background_primary || '#0F0F0F',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
      }}
    >
      {/* Warm spotlight gradient overlay */}
      {isWarmSpotlight && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(ellipse 80% 50% at 50% 0%, rgba(180, 120, 40, 0.35) 0%, rgba(120, 80, 20, 0.15) 40%, transparent 70%)`,
          }}
        />
      )}

      {/* Non-spotlight gradient */}
      {concept.style.background_type === 'gradient' && concept.style.background_secondary && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(180deg, ${concept.style.background_secondary}, ${concept.style.background_primary})`,
          }}
        />
      )}

      {/* Content container */}
      <div
        style={{
          position: 'absolute',
          top: 56,
          left: 72,
          right: 72,
          bottom: 56,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 1,
        }}
      >
        {/* Top: qualifier badge */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              backgroundColor: qualifierBg,
              border: qualifierBorder,
              color: '#FFFFFF',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 20,
              padding: '10px 28px',
              borderRadius: 6,
              textAlign: 'center',
              letterSpacing: '0.02em',
            }}
          >
            {concept.text_overlay.qualifier}
          </div>
        </div>

        {/* Middle: headline + subhead */}
        <div>
          <div
            ref={headlineRef}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 900,
              fontSize: headlineFontSize,
              lineHeight: 1.05,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              maxHeight: 620,
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
              fontWeight: 700,
              fontSize: 48,
              lineHeight: 1.2,
              color: subheadColor,
              marginTop: 28,
              fontStyle: concept.style.subhead_color === 'yellow' ? 'normal' : 'italic',
            }}
          >
            {concept.text_overlay.subhead}
          </div>
        </div>

        {/* Bottom: context line */}
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: 24,
            color: '#94A3B8',
            fontStyle: 'italic',
            textAlign: 'center',
          }}
        >
          {concept.text_overlay.context_line}
        </div>
      </div>
    </div>
  );
}
