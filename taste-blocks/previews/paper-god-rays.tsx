'use client';

import { GodRays } from '@/registry/sources/paper-shaders/components/paper-shaders/react/shaders/god-rays';

export default function PaperGodRaysPreview() {
  return (
    <div style={{ width: 'min(100%, 720px)', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 24 }}>
      <GodRays role="img" aria-label="God Rays shader preview" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
