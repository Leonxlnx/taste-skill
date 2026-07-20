'use client';

import { Warp } from '@/registry/sources/paper-shaders/components/paper-shaders/react/shaders/warp';

export default function PaperWarpPreview() {
  return (
    <div style={{ width: 'min(100%, 720px)', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 24 }}>
      <Warp role="img" aria-label="Warp shader preview" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
