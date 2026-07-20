'use client';

import { FlutedGlass } from '@/registry/sources/paper-shaders/components/paper-shaders/react/shaders/fluted-glass';

const previewImage =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="675"%3E%3Crect width="1200" height="675" fill="%23efe9dc"/%3E%3Ccircle cx="330" cy="300" r="240" fill="%23f05a47"/%3E%3Ccircle cx="870" cy="280" r="260" fill="%23315efb"/%3E%3C/svg%3E';

export default function PaperFlutedGlassPreview() {
  return (
    <div style={{ width: 'min(100%, 720px)', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 24 }}>
      <FlutedGlass image={previewImage} role="img" aria-label="Fluted Glass shader preview" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
