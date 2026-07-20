'use client';

import { ColorPanels } from '@/registry/sources/paper-shaders/components/paper-shaders/react/shaders/color-panels';

export default function PaperColorPanelsPreview() {
  return (
    <div style={{ width: 'min(100%, 720px)', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 24 }}>
      <ColorPanels role="img" aria-label="Color Panels shader preview" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
