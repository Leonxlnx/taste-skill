import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';

import {
  LeadingActions,
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
  Type,
} from './components/react-swipeable-list';

const host = document.querySelector<HTMLDivElement>('#app');
const result = document.querySelector<HTMLPreElement>('#result');

if (!host || !result) {
  throw new Error('Browser smoke fixture is incomplete.');
}

const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) {
    throw new Error(message);
  }
};

const frame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

const dispatchTouch = (
  target: EventTarget,
  type: string,
  clientX: number,
  clientY: number,
) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'targetTouches', {
    value: type === 'touchend' ? [] : [{ clientX, clientY }],
  });
  target.dispatchEvent(event);
  return event;
};

function Fixture({
  actionDelay = 0,
  direction = 'ltr',
  onAction,
}: {
  actionDelay?: number;
  direction?: 'ltr' | 'rtl';
  onAction: () => void;
}) {
  return (
    <div dir={direction} style={{ width: 320 }}>
      <SwipeableList actionDelay={actionDelay} type={Type.IOS}>
        <SwipeableListItem
          leadingActions={
            <LeadingActions>
              <SwipeAction className="test-action" onClick={onAction}>
                Archive
              </SwipeAction>
            </LeadingActions>
          }
          trailingActions={
            <TrailingActions>
              <SwipeAction className="test-action" onClick={onAction}>
                Delete
              </SwipeAction>
            </TrailingActions>
          }
        >
          <span className="test-content">Caller content</span>
        </SwipeableListItem>
      </SwipeableList>
    </div>
  );
}

const getElements = () => {
  const controls = Array.from(
    host.querySelectorAll<HTMLButtonElement>(
      '.swipeable-list-item__reveal-button',
    ),
  );
  const leadingControl = controls.find((button) =>
    button.textContent?.includes('leading'),
  );
  const trailingControl = controls.find((button) =>
    button.textContent?.includes('trailing'),
  );
  const leadingAction = host.querySelector<HTMLButtonElement>(
    '.swipeable-list-item__leading-actions .swipe-action',
  );
  const trailingAction = host.querySelector<HTMLButtonElement>(
    '.swipeable-list-item__trailing-actions .swipe-action',
  );
  const leadingActions = host.querySelector<HTMLDivElement>(
    '.swipeable-list-item__leading-actions',
  );
  const trailingActions = host.querySelector<HTMLDivElement>(
    '.swipeable-list-item__trailing-actions',
  );
  const content = host.querySelector<HTMLDivElement>(
    '.swipeable-list-item__content',
  );
  const item = host.querySelector<HTMLDivElement>('.swipeable-list-item');

  assert(leadingControl, 'leading reveal control is missing');
  assert(trailingControl, 'trailing reveal control is missing');
  assert(leadingAction, 'leading action is missing');
  assert(trailingAction, 'trailing action is missing');
  assert(leadingActions, 'leading action region is missing');
  assert(trailingActions, 'trailing action region is missing');
  assert(content, 'row content is missing');
  assert(item, 'row is missing');

  return {
    content,
    item,
    leadingAction,
    leadingActions,
    leadingControl,
    trailingAction,
    trailingActions,
    trailingControl,
  };
};

const renderFixture = (
  root: Root,
  props: React.ComponentProps<typeof Fixture>,
) => {
  flushSync(() => root.render(<Fixture {...props} />));
};

async function run() {
  let actionCount = 0;
  let root = createRoot(host);

  renderFixture(root, {
    direction: 'ltr',
    onAction: () => {
      actionCount += 1;
    },
  });
  await frame();

  let elements = getElements();
  assert(elements.leadingAction.type === 'button', 'actions must be buttons');
  assert(elements.leadingAction.tabIndex === -1, 'closed actions must not tab');
  assert(elements.leadingActions.inert, 'closed action regions must be inert');
  assert(
    getComputedStyle(elements.content).touchAction === 'pan-y',
    'rows must preserve vertical touch scrolling',
  );
  assert(
    elements.leadingControl.getBoundingClientRect().height >= 44,
    'mobile reveal targets must be at least 44 pixels high',
  );
  assert(
    matchMedia('(prefers-reduced-motion: reduce)').matches,
    'browser smoke must run with reduced motion forced',
  );
  assert(
    getComputedStyle(elements.item).transitionDuration === '0s',
    'reduced motion must remove row transitions',
  );

  elements.leadingControl.click();
  await frame();
  elements = getElements();
  assert(
    elements.leadingActions.getAttribute('aria-hidden') === 'false',
    'keyboard route must reveal leading actions',
  );
  assert(document.activeElement === elements.leadingAction, 'focus must enter actions');
  assert(
    elements.content.style.transform.startsWith('translateX(') &&
      !elements.content.style.transform.includes('translateX(-'),
    'LTR leading actions must use a positive transform',
  );

  elements.leadingAction.dispatchEvent(
    new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Escape',
    }),
  );
  await frame();
  elements = getElements();
  assert(
    document.activeElement === elements.leadingControl,
    'Escape must return focus to the reveal control',
  );
  assert(
    elements.leadingActions.getAttribute('aria-hidden') === 'true',
    'Escape must hide actions',
  );

  flushSync(() => root.unmount());
  root = createRoot(host);
  renderFixture(root, {
    direction: 'rtl',
    onAction: () => {
      actionCount += 1;
    },
  });
  await frame();
  elements = getElements();
  elements.leadingControl.click();
  await frame();
  elements = getElements();
  assert(
    elements.content.style.transform.includes('translateX(-'),
    'RTL leading actions must use a negative transform',
  );
  elements.leadingAction.dispatchEvent(
    new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }),
  );
  await frame();
  elements = getElements();
  elements.trailingControl.dispatchEvent(
    new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'ArrowRight',
    }),
  );
  await frame();
  elements = getElements();
  assert(
    document.activeElement === elements.trailingAction,
    'RTL ArrowRight must reveal the physical-right trailing action',
  );
  elements.trailingAction.dispatchEvent(
    new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }),
  );
  await frame();

  flushSync(() => root.unmount());
  root = createRoot(host);
  renderFixture(root, {
    direction: 'ltr',
    onAction: () => {
      actionCount += 1;
    },
  });
  await frame();
  elements = getElements();

  dispatchTouch(elements.content, 'touchstart', 240, 40);
  await delay(20);
  const verticalMove = dispatchTouch(elements.content, 'touchmove', 242, 120);
  dispatchTouch(window, 'touchend', 242, 120);
  assert(!verticalMove.defaultPrevented, 'vertical touch scrolling must not be captured');
  assert(
    elements.content.style.transform === '' ||
      elements.content.style.transform === 'translateX(0px)',
    'vertical touch scrolling must not move the row',
  );

  dispatchTouch(elements.content, 'touchstart', 240, 40);
  await delay(20);
  dispatchTouch(elements.content, 'touchmove', 120, 42);
  await frame();
  await frame();
  assert(
    elements.content.style.transform.includes('translateX(-'),
    'horizontal touch must move the row',
  );
  window.dispatchEvent(new Event('pointercancel'));
  await frame();
  elements = getElements();
  assert(
    elements.content.style.transform === 'translateX(0px)',
    'pointer cancellation must return the row',
  );
  assert(actionCount === 0, 'cancellation must not trigger an action');

  dispatchTouch(elements.content, 'touchstart', 240, 40);
  await delay(20);
  dispatchTouch(elements.content, 'touchmove', 120, 42);
  await frame();
  dispatchTouch(window, 'touchend', 120, 42);
  await frame();
  elements = getElements();
  assert(
    elements.trailingActions.getAttribute('aria-hidden') === 'false',
    'touch release outside the row must finish the reveal',
  );
  assert(actionCount === 0, 'an iOS reveal must not trigger its action');

  flushSync(() => root.unmount());
  root = createRoot(host);
  renderFixture(root, {
    actionDelay: 100,
    direction: 'ltr',
    onAction: () => {
      actionCount += 1;
    },
  });
  await frame();
  elements = getElements();
  elements.leadingControl.click();
  await frame();
  elements = getElements();
  elements.leadingAction.click();
  flushSync(() => root.unmount());
  await delay(150);
  assert(actionCount === 0, 'unmount must clear delayed action timers');

  result.dataset.status = 'pass';
  result.textContent = 'PASS: touch, keyboard, RTL, mobile, reduced-motion, and cleanup';
}

run().catch((error: unknown) => {
  result.dataset.status = 'fail';
  result.textContent = error instanceof Error ? error.stack ?? error.message : String(error);
});
