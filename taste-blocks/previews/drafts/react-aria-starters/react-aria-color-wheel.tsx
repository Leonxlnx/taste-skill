'use client';

import {ColorWheel} from '@/registry/sources/react-aria-starters/components/react-aria-color-wheel/ColorWheel';

export default function Preview() {
  return <ColorWheel aria-label="Hue" defaultValue="hsl(210, 80%, 50%)" />;
}
