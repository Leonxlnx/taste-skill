'use client';

import * as React from 'react';
import {
  motion,
  type HTMLMotionProps,
  type TargetAndTransition,
  type Transition,
  useReducedMotion,
} from 'motion/react';

import { useAutoHeight } from './use-auto-height';

type AutoHeightProps = {
  children: React.ReactNode;
  deps?: React.DependencyList;
  animate?: TargetAndTransition;
  transition?: Transition;
} & Omit<HTMLMotionProps<'div'>, 'animate'>;

function AutoHeight({
  children,
  deps = [],
  transition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    bounce: 0,
    restDelta: 0.01,
  },
  style,
  animate,
  ...props
}: AutoHeightProps) {
  const { ref, height } = useAutoHeight<HTMLDivElement>(deps);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      style={{
        ...(height === undefined ? {} : { overflow: 'hidden' }),
        ...style,
      }}
      animate={height === undefined ? undefined : { ...animate, height }}
      transition={shouldReduceMotion ? { duration: 0 } : transition}
      {...props}
    >
      <div ref={ref}>{children}</div>
    </motion.div>
  );
}

export { AutoHeight, type AutoHeightProps };
