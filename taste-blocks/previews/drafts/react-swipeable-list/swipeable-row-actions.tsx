'use client';

import React from 'react';

import {
  LeadingActions,
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
  Type,
} from '@/registry/sources/react-swipeable-list/components/react-swipeable-list';

const initialItems = [
  { id: 1, title: 'Quarterly notes', detail: 'Updated 12 minutes ago' },
  { id: 2, title: 'Project brief', detail: 'Updated yesterday' },
];

export default function SwipeableRowActionsPreview() {
  const [items, setItems] = React.useState(initialItems);
  const [message, setMessage] = React.useState('');

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <SwipeableList
        destructiveCallbackDelay={500}
        fullSwipe
        type={Type.IOS}
      >
        {items.map((item) => (
          <SwipeableListItem
            className="border-b border-zinc-200 last:border-b-0 dark:border-zinc-800"
            key={item.id}
            leadingActions={
              <LeadingActions>
                <SwipeAction
                  className="min-w-24 items-center justify-center bg-emerald-700 px-4 font-medium text-white"
                  onClick={() => setMessage(`${item.title} archived`)}
                >
                  Archive
                </SwipeAction>
              </LeadingActions>
            }
            leadingActionsRevealLabel="Show archive action"
            trailingActions={
              <TrailingActions>
                <SwipeAction
                  className="min-w-24 items-center justify-center bg-red-700 px-4 font-medium text-white"
                  destructive
                  onClick={() =>
                    setItems((current) =>
                      current.filter((candidate) => candidate.id !== item.id),
                    )
                  }
                >
                  Delete
                </SwipeAction>
              </TrailingActions>
            }
            trailingActionsRevealLabel="Show delete action"
          >
            <div className="min-w-0 flex-1 px-4 py-3">
              <p className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">
                {item.title}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {item.detail}
              </p>
            </div>
          </SwipeableListItem>
        ))}
      </SwipeableList>
      <p
        aria-live="polite"
        className="min-h-9 px-4 py-2 text-xs text-zinc-500 dark:text-zinc-400"
      >
        {message || (items.length ? 'Swipe a row or use its action buttons.' : 'No items left.')}
      </p>
    </div>
  );
}
