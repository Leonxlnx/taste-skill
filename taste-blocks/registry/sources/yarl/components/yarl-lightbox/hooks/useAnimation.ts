import * as React from "react";

import { parseInt } from "../utils.js";
import { useLayoutEffect } from "./useLayoutEffect.js";
import { useMotionPreference } from "./useMotionPreference.js";

function currentTransformation(node: HTMLElement) {
  let x = 0;
  let y = 0;
  let z = 0;
  const matrix = window.getComputedStyle(node).transform;
  const matcher = matrix.match(/matrix.*\((.+)\)/);
  if (matcher) {
    const values = matcher[1].split(",").map(parseInt);
    if (values.length === 6) {
      x = values[4];
      y = values[5];
    } else if (values.length === 16) {
      x = values[12];
      y = values[13];
      z = values[14];
    }
  }
  return { x, y, z };
}

export type ComputeAnimation<T> = (
  snapshot: T,
  rect: DOMRect,
  translate: { x: number; y: number; z: number },
) =>
  | {
      keyframes: Keyframe[];
      duration: number;
      easing?: string;
      onfinish?: () => void;
    }
  | undefined;

export function useAnimation<T>(nodeRef: React.RefObject<HTMLElement | null>, computeAnimation: ComputeAnimation<T>) {
  const snapshot = React.useRef<T>(undefined);
  const animation = React.useRef<Animation>(undefined);

  const reduceMotion = useMotionPreference();

  useLayoutEffect(() => {
    if (nodeRef.current && snapshot.current !== undefined && !reduceMotion) {
      const { keyframes, duration, easing, onfinish } =
        computeAnimation(
          snapshot.current,
          nodeRef.current.getBoundingClientRect(),
          currentTransformation(nodeRef.current),
        ) || {};

      if (keyframes && duration) {
        animation.current?.cancel();
        animation.current = undefined;

        try {
          animation.current = nodeRef.current.animate?.(keyframes, { duration, easing });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err);
        }

        if (animation.current) {
          animation.current.onfinish = () => {
            animation.current = undefined;

            onfinish?.();
          };
        }
      }
    }

    snapshot.current = undefined;
  });

  return {
    prepareAnimation: (currentSnapshot: T | undefined) => {
      snapshot.current = currentSnapshot;
    },
    isAnimationPlaying: () => animation.current?.playState === "running",
  };
}
