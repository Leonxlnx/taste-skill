'use client';
import {
  AnimatePresence,
  Transition,
  Variant,
  motion,
  MotionProps,
  useReducedMotion,
} from 'motion/react';
import { cn } from '../../lib/utils';

export type TransitionPanelProps = {
  children: React.ReactNode[];
  className?: string;
  transition?: Transition;
  activeIndex: number;
  variants?: { enter: Variant; center: Variant; exit: Variant };
} & MotionProps;

export function TransitionPanel({
  children,
  className,
  transition,
  variants,
  activeIndex,
  ...motionProps
}: TransitionPanelProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={cn('relative', className)}>
        <motion.div
          {...motionProps}
          initial={false}
          animate={undefined}
          exit={undefined}
          transition={{ duration: 0 }}
        >
          {children[activeIndex]}
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence
        initial={false}
        mode='popLayout'
        custom={motionProps.custom}
      >
        <motion.div
          key={activeIndex}
          variants={variants}
          transition={transition}
          initial='enter'
          animate='center'
          exit='exit'
          {...motionProps}
        >
          {children[activeIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
