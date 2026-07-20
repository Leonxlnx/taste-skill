'use client';

import {ColorSwatchPicker, ColorSwatchPickerItem} from '@/registry/sources/react-aria-starters/components/react-aria-color-swatch-picker/ColorSwatchPicker';

export default function Preview() {
  return (
    <ColorSwatchPicker aria-label="Accent color" defaultValue="#2563eb">
      <ColorSwatchPickerItem color="#2563eb" />
      <ColorSwatchPickerItem color="#7c3aed" />
      <ColorSwatchPickerItem color="#db2777" />
      <ColorSwatchPickerItem color="#059669" />
    </ColorSwatchPicker>
  );
}
