'use client';

import {ColorArea} from '@/registry/sources/react-aria-starters/components/react-aria-color-area/ColorArea';

export default function Preview() {
  return (
    <ColorArea
      aria-label="Color saturation and lightness"
      defaultValue="hsl(210, 80%, 50%)"
      colorSpace="hsl"
      xChannel="saturation"
      yChannel="lightness"
    />
  );
}
