'use client';

import { Metaballs } from '@/registry/sources/paper-shaders/components/paper-shaders/react/shaders/metaballs';

export default function PaperMetaballsPreview() {
  return (
    <div style={{ width: 'min(100%, 720px)', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 24 }}>
      <Metaballs role="img" aria-label="Metaballs shader preview" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
