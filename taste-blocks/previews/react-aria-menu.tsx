'use client';

import {Button} from 'react-aria-components/Button';
import {Menu, MenuItem, MenuTrigger} from '@/registry/sources/react-aria-starters/components/react-aria-menu/Menu';

export default function Preview() {
  return (
    <MenuTrigger>
      <Button>Actions</Button>
      <Menu>
        <MenuItem id="rename">Rename</MenuItem>
        <MenuItem id="duplicate">Duplicate</MenuItem>
        <MenuItem id="archive">Archive</MenuItem>
      </Menu>
    </MenuTrigger>
  );
}
