'use client';

import {Button} from 'react-aria-components/Button';
import {Toolbar} from '@/registry/sources/react-aria-starters/components/react-aria-toolbar/Toolbar';

export default function Preview() {
  return (
    <Toolbar aria-label="Text formatting">
      <Button>Bold</Button>
      <Button>Italic</Button>
      <Button>Underline</Button>
    </Toolbar>
  );
}
