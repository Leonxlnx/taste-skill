'use client';

import type { CSSProperties } from 'react';

import { ReactCompareSlider } from '@/registry/sources/react-compare-slider/components/react-compare-slider/react-compare-slider';

const surfaceStyle: CSSProperties = {
  display: 'grid',
  width: '100%',
  height: '100%',
  placeItems: 'center',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

function ComparisonSurface({ after = false }: { after?: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{
        ...surfaceStyle,
        color: after ? '#17201d' : '#f7f4ec',
        backgroundColor: after ? '#d8e7df' : '#25332f',
        backgroundImage: after
          ? 'linear-gradient(#b9cec4 1px, transparent 1px), linear-gradient(90deg, #b9cec4 1px, transparent 1px)'
          : 'linear-gradient(#3d4d48 1px, transparent 1px), linear-gradient(90deg, #3d4d48 1px, transparent 1px)',
        backgroundSize: '2rem 2rem',
      }}
    >
      {after ? 'After' : 'Before'}
    </div>
  );
}

export default function ReactCompareSliderPreview() {
  return (
    <ReactCompareSlider
      itemOne={<ComparisonSurface />}
      itemTwo={<ComparisonSurface after />}
      style={{
        width: 'min(100%, 42rem)',
        aspectRatio: '16 / 10',
        border: '1px solid #b9c1bd',
        borderRadius: '1rem',
        boxShadow: '0 1rem 3rem rgba(23, 32, 29, 0.12)',
      }}
    />
  );
}
