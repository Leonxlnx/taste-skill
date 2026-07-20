'use client';

import {Slider} from '@/registry/sources/react-aria-starters/components/react-aria-slider/Slider';

export default function Preview() {
  return <Slider label="Budget range" defaultValue={[25, 70]} thumbLabels={['Minimum', 'Maximum']} />;
}
