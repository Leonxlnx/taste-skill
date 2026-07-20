import * as React from "react";

import { useEventCallback, UseSensors } from "../../hooks/index.js";
import { useTimeouts } from "../../contexts/index.js";
import { SwipeState } from "./SwipeState.js";
import { EVENT_ON_WHEEL } from "../../consts.js";

export function useWheelSwipe<T extends Element = Element>(
  swipeState: SwipeState,
  subscribeSensors: UseSensors<T>["subscribeSensors"],
  isSwipeValid: (offset: number) => boolean,
  containerWidth: number,
  swipeAnimationDuration: number,
  onSwipeStart: () => void,
  onSwipeProgress: (offset: number) => void,
  onSwipeFinish: (offset: number, duration: number) => void,
  onSwipeCancel: (offset: number) => void,
) {
  const offset = React.useRef(0);
  const intent = React.useRef(0);
  const intentCleanup = React.useRef<number>(undefined);
  const resetCleanup = React.useRef<number>(undefined);
  const wheelInertia = React.useRef(0);
  const wheelInertiaCleanup = React.useRef<number>(undefined);
  const startTime = React.useRef(0);

  const { setTimeout, clearTimeout } = useTimeouts();

  const cancelSwipeIntentCleanup = React.useCallback(() => {
    if (intentCleanup.current) {
      clearTimeout(intentCleanup.current);
      intentCleanup.current = undefined;
    }
  }, [clearTimeout]);

  const cancelSwipeResetCleanup = React.useCallback(() => {
    if (resetCleanup.current) {
      clearTimeout(resetCleanup.current);
      resetCleanup.current = undefined;
    }
  }, [clearTimeout]);

  const handleCleanup = useEventCallback(() => {
    if (swipeState !== SwipeState.SWIPE) {
      offset.current = 0;
      startTime.current = 0;

      cancelSwipeIntentCleanup();
      cancelSwipeResetCleanup();
    }
  });

  React.useEffect(handleCleanup, [swipeState, handleCleanup]);

  const handleCancelSwipe = useEventCallback((currentSwipeOffset: number) => {
    resetCleanup.current = undefined;

    if (offset.current === currentSwipeOffset) {
      onSwipeCancel(offset.current);
    }
  });

  const onWheel = useEventCallback((event: React.WheelEvent) => {
    if (event.ctrlKey) {
      // zoom
      return;
    }

    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      // pan-y
      return;
    }

    const setWheelInertia = (inertia: number) => {
      wheelInertia.current = inertia;

      clearTimeout(wheelInertiaCleanup.current);

      wheelInertiaCleanup.current =
        inertia > 0
          ? setTimeout(() => {
              wheelInertia.current = 0;
              wheelInertiaCleanup.current = undefined;
            }, 300)
          : undefined;
    };

    if (swipeState === SwipeState.NONE) {
      if (Math.abs(event.deltaX) <= 1.2 * Math.abs(wheelInertia.current)) {
        setWheelInertia(event.deltaX);
        return;
      }

      if (!isSwipeValid(-event.deltaX)) {
        return;
      }

      intent.current += event.deltaX;

      cancelSwipeIntentCleanup();

      if (Math.abs(intent.current) > 30) {
        intent.current = 0;
        setWheelInertia(0);
        startTime.current = Date.now();

        onSwipeStart();
      } else {
        const currentSwipeIntent = intent.current;
        intentCleanup.current = setTimeout(() => {
          intentCleanup.current = undefined;
          if (currentSwipeIntent === intent.current) {
            intent.current = 0;
          }
        }, swipeAnimationDuration);
      }
    } else if (swipeState === SwipeState.SWIPE) {
      let newSwipeOffset = offset.current - event.deltaX;
      newSwipeOffset = Math.min(Math.abs(newSwipeOffset), containerWidth) * Math.sign(newSwipeOffset);
      offset.current = newSwipeOffset;

      onSwipeProgress(newSwipeOffset);

      cancelSwipeResetCleanup();

      if (Math.abs(newSwipeOffset) > 0.2 * containerWidth) {
        setWheelInertia(event.deltaX);

        onSwipeFinish(newSwipeOffset, Date.now() - startTime.current);

        return;
      }

      resetCleanup.current = setTimeout(() => handleCancelSwipe(newSwipeOffset), 2 * swipeAnimationDuration);
    } else {
      setWheelInertia(event.deltaX);
    }
  });

  React.useEffect(() => subscribeSensors(EVENT_ON_WHEEL, onWheel), [subscribeSensors, onWheel]);
}
