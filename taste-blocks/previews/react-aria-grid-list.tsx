'use client';

import {GridList, GridListItem} from '@/registry/sources/react-aria-starters/components/react-aria-grid-list/GridList';

export default function Preview() {
  return (
    <GridList aria-label="Projects" selectionMode="multiple">
      <GridListItem id="atlas">Atlas</GridListItem>
      <GridListItem id="ember">Ember</GridListItem>
      <GridListItem id="north">North</GridListItem>
    </GridList>
  );
}
