'use client';

import { Dithering } from '@/registry/sources/paper-shaders/components/paper-shaders/react/shaders/dithering';

export default function PaperDitheringPreview() {
  return (
    <div style={{ width: 'min(100%, 720px)', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 24 }}>
      <Dithering role="img" aria-label="Dithering shader preview" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
