import type { MouseEventHandler } from 'react';

export function preventDefault(handler: () => void): MouseEventHandler {
  return e => {
    e.preventDefault();
    handler();
  };
}
