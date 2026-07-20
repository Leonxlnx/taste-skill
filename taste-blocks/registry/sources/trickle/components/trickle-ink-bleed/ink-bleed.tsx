import { type ElementType, type CSSProperties } from 'react';
import { cn } from '../../lib/cn';

export interface InkBleedProps {
  children: React.ReactNode;
  /** Delay before the bleed begins, in ms. */
  delay?: number;
  /** Duration of the bleed, in ms. */
  duration?: number;
  /** Origin point as 'X% Y%' (e.g. '50% 50%' for center, '0% 50%' for left). */
  origin?: string;
  /** Element tag. Defaults to `span`. */
  as?: ElementType;
  className?: string;
}

export function InkBleed({
  children,
  delay = 0,
  duration = 1200,
  origin = '50% 50%',
  as: Component = 'span',
  className
}: InkBleedProps) {
  const RenderComponent: any = Component;
  return (
    <RenderComponent
      className={cn('inline-block animate-trickle-ink-bleed', className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        ['--trickle-ink-origin' as string]: origin
      } as CSSProperties}
    >
      {children}
    </RenderComponent>
  );
}
