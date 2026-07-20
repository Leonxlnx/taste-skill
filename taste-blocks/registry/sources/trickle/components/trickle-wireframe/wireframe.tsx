import { type ElementType, type CSSProperties } from 'react';
import { cn } from '../../lib/cn';

export interface WireframeProps {
  /** The text to assemble. Pass a string so each character can animate independently. */
  text: string;
  /** Delay before the first character begins, in ms. */
  delay?: number;
  /** Delay between successive characters, in ms. */
  stagger?: number;
  /** Initial outline thickness in pixels. */
  strokeWidth?: number;
  /** Element tag. */
  as?: ElementType;
  className?: string;
}

export function Wireframe({
  text,
  delay = 0,
  stagger = 90,
  strokeWidth = 3,
  as: Component = 'span',
  className
}: WireframeProps) {
  const RenderComponent: any = Component;
  return (
    <RenderComponent className={cn('inline-block', className)} aria-label={text}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          aria-hidden='true'
          className='inline-block whitespace-pre animate-trickle-wireframe'
          style={{
            animationDelay: `${delay + i * stagger}ms`,
            ['--trickle-wireframe-stroke' as string]: `${strokeWidth}px`
          } as CSSProperties}
        >
          {char}
        </span>
      ))}
    </RenderComponent>
  );
}
