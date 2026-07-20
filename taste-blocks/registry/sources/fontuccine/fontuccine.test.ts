import assert from 'node:assert/strict';
import { test } from 'node:test';

import { observeVisibility } from './components/fontuccine/interaction/gating';
import { attach } from './components/fontuccine/engine/attach';
import { createHoverStimulus } from './components/fontuccine/interaction/stimuli/hover';
import { createProximityStimulus } from './components/fontuccine/interaction/stimuli/proximity';
import { createTicker, type FrameScheduler } from './components/fontuccine/interaction/ticker';

const inertScheduler: FrameScheduler = {
  cancelFrame() {},
  now: () => 0,
  requestFrame: () => 0,
};

function pointerEvent(type: string, pointerType: string): Event {
  const event = new Event(type);
  Object.defineProperties(event, {
    clientX: { value: 50 },
    clientY: { value: 50 },
    pointerId: { value: 1 },
    pointerType: { value: pointerType },
  });
  return event;
}

test('visibility combines intersection and document state, then cleans up', () => {
  let visibilityListener: (() => void) | null = null;
  let intersection: ((entries: Array<{ isIntersecting: boolean }>) => void) | null = null;
  let disconnected = false;
  const doc = {
    visibilityState: 'visible',
    addEventListener(_type: string, listener: () => void) {
      visibilityListener = listener;
    },
    removeEventListener() {
      visibilityListener = null;
    },
  };
  const states: boolean[] = [];
  const dispose = observeVisibility(
    { ownerDocument: doc } as unknown as Element,
    (visible) => states.push(visible),
    {
      factory(callback) {
        intersection = callback;
        return {
          disconnect() {
            disconnected = true;
          },
          observe() {},
          unobserve() {},
        };
      },
    },
  );

  assert.ok(intersection);
  intersection([{ isIntersecting: true }]);
  doc.visibilityState = 'hidden';
  assert.ok(visibilityListener);
  visibilityListener();
  doc.visibilityState = 'visible';
  visibilityListener();
  intersection([{ isIntersecting: false }]);
  assert.deepEqual(states, [true, false, true, false]);

  dispose();
  assert.equal(disconnected, true);
  assert.equal(visibilityListener, null);
});

test('a gated renderer cannot keep the shared ticker alive', () => {
  let pending: ((now: number) => void) | null = null;
  const ticker = createTicker({
    cancelFrame() {
      pending = null;
    },
    now: () => 0,
    requestFrame(callback) {
      pending = callback;
      return 1;
    },
  });
  ticker.render(() => {});
  const releaseActivity = ticker.onActivity(() => true);
  releaseActivity();

  assert.ok(pending);
  const frame = pending;
  pending = null;
  frame(0);
  assert.equal(pending, null);
  assert.equal(ticker.running, false);
});

test('RTL uses untouched native text instead of unshaped outlines', async () => {
  const instance = attach({ dir: 'rtl' } as unknown as HTMLElement);
  await instance.ready;
  assert.equal(instance.tier, null);
  assert.deepEqual(instance.notes, ['rtl direction: using static native text to preserve shaping']);
  instance.destroy();
});

test('hover and proximity ignore touch and clean up listeners', () => {
  const ticker = createTicker(inertScheduler);
  const hoverTarget = new EventTarget();
  const hover = createHoverStimulus({ element: hoverTarget });
  hover.attach(ticker);
  hoverTarget.dispatchEvent(pointerEvent('pointerenter', 'touch'));
  assert.equal(hover.value, 0);
  hoverTarget.dispatchEvent(pointerEvent('pointerenter', 'mouse'));
  assert.equal(hover.value, 1);
  hover.detach();
  assert.equal(hover.value, 0);

  const pointerTarget = new EventTarget();
  const proximity = createProximityStimulus({
    element: {
      getBoundingClientRect: () => ({ bottom: 100, left: 0, right: 100, top: 0 }),
    },
    pointerTarget,
  });
  proximity.attach(ticker);
  pointerTarget.dispatchEvent(pointerEvent('pointermove', 'touch'));
  ticker.frame(0);
  assert.equal(proximity.value, 0);
  pointerTarget.dispatchEvent(pointerEvent('pointermove', 'mouse'));
  ticker.frame(16);
  assert.equal(proximity.value, 1);
  proximity.detach();
  pointerTarget.dispatchEvent(pointerEvent('pointermove', 'mouse'));
  ticker.frame(32);
  assert.equal(proximity.value, 0);
});
