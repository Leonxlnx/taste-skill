'use client';

import {ColorSlider} from '@/registry/sources/react-aria-starters/components/react-aria-color-slider/ColorSlider';

export default function Preview() {
  return <ColorSlider label="Hue" channel="hue" defaultValue="hsl(210, 80%, 50%)" />;
}
