import { type ElementType, type CSSProperties } from 'react';
import { cn } from '../../lib/cn';

export interface ShutterProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  /** Number of vertical bars. Default 8. */
  bars?: number;
  as?: ElementType;
  className?: string;
}

export function Shutter({ children, delay = 0, duration = 1100, bars = 8, as: Component = 'span', className }: ShutterProps) {
  const RenderComponent: any = Component;
  return (
    <RenderComponent
      className={cn('inline-block animate-trickle-shutter', className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        ['--trickle-shutter-bars' as string]: `${bars}`
      } as CSSProperties}
    >
      {children}
    </RenderComponent>
  );
}
