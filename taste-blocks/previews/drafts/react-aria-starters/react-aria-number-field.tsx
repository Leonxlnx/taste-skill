'use client';

import {NumberField} from '@/registry/sources/react-aria-starters/components/react-aria-number-field/NumberField';

export default function Preview() {
  return <NumberField label="Seats" defaultValue={4} minValue={1} maxValue={12} />;
}
