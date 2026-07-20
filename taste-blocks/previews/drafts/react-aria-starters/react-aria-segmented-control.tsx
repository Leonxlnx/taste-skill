'use client';

import {SegmentedControl, SegmentedControlItem} from '@/registry/sources/react-aria-starters/components/react-aria-segmented-control/SegmentedControl';

export default function Preview() {
  return (
    <SegmentedControl aria-label="View" selectionMode="single" defaultSelectedKeys={['grid']}>
      <SegmentedControlItem id="grid">Grid</SegmentedControlItem>
      <SegmentedControlItem id="list">List</SegmentedControlItem>
      <SegmentedControlItem id="compact">Compact</SegmentedControlItem>
    </SegmentedControl>
  );
}
