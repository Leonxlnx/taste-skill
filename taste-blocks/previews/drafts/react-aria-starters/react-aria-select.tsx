'use client';

import {Select, SelectItem} from '@/registry/sources/react-aria-starters/components/react-aria-select/Select';

export default function Preview() {
  return (
    <Select label="Workspace" placeholder="Choose a workspace">
      <SelectItem id="atlas">Atlas</SelectItem>
      <SelectItem id="ember">Ember</SelectItem>
      <SelectItem id="north">North</SelectItem>
    </Select>
  );
}
