'use client';

import { Spiral } from '@/registry/sources/paper-shaders/components/paper-shaders/react/shaders/spiral';

export default function PaperSpiralPreview() {
  return (
    <div style={{ width: 'min(100%, 720px)', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 24 }}>
      <Spiral role="img" aria-label="Spiral shader preview" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
