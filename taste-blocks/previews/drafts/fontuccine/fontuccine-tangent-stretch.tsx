'use client';

import { useMemo, useState } from 'react';

import {
  Fontuccine,
  type FontuccineConfig,
} from '@/registry/sources/fontuccine/components/fontuccine/react';

export default function FontuccineTangentStretchPreview() {
  const [fontBuffer, setFontBuffer] = useState<ArrayBuffer>();
  const config = useMemo<FontuccineConfig | undefined>(
    () =>
      fontBuffer
        ? {
            fontBuffer,
            maxStretchRatio: 1.7,
            respectReducedMotion: true,
            tier: 'svg',
            trigger: 'hover',
            wrap: 'nowrap',
          }
        : undefined,
    [fontBuffer],
  );

  return (
    <section
      style={{
        boxSizing: 'border-box',
        display: 'grid',
        gap: '1.5rem',
        maxWidth: '48rem',
        overflow: 'hidden',
        padding: 'clamp(1rem, 5vw, 3rem)',
        width: '100%',
      }}
    >
      <label style={{ display: 'grid', gap: '0.5rem', maxWidth: '24rem' }}>
        <span>Choose a local TTF, OTF, or WOFF font to preview</span>
        <input
          accept=".otf,.ttf,.woff,font/otf,font/ttf,font/woff"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (!file) {
              setFontBuffer(undefined);
              return;
            }
            void file.arrayBuffer().then(setFontBuffer);
          }}
          type="file"
        />
      </label>

      {config ? (
        <Fontuccine
          as="p"
          config={config}
          dir="auto"
          style={{
            display: 'block',
            fontSize: 'clamp(2rem, 11vw, 5.5rem)',
            fontWeight: 700,
            lineHeight: 1,
            maxWidth: '100%',
          }}
        >
          Tangent
        </Fontuccine>
      ) : (
        <p style={{ fontSize: 'clamp(2rem, 11vw, 5.5rem)', fontWeight: 700, lineHeight: 1 }}>
          Tangent
        </p>
      )}

      <p style={{ margin: 0 }}>
        Hover with a mouse to stretch. Reduced-motion, touch, pen, and keyboard output stays static.
      </p>
    </section>
  );
}
