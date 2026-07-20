import { type ElementType, type CSSProperties } from 'react';
import { cn } from '../../lib/cn';

export interface UnderlineDrawProps {
  children: React.ReactNode;
  /** Delay before the underline draws, in ms. */
  delay?: number;
  /** Element tag. Defaults to `span`. */
  as?: ElementType;
  className?: string;
  /** Thickness of the underline (any CSS length). Default `2px`. */
  thickness?: string;
  /** Underline color (any CSS color). Defaults to `currentColor`. */
  color?: string;
}

export function UnderlineDraw({
  children,
  delay = 0,
  as: Component = 'span',
  className,
  thickness = '2px',
  color = 'currentColor'
}: UnderlineDrawProps) {
  const RenderComponent: any = Component;
  return (
    <RenderComponent
      className={cn(
        'inline animate-trickle-underline-draw bg-no-repeat bg-left-bottom',
        className
      )}
      style={{
        backgroundImage: `linear-gradient(to right, ${color}, ${color})`,
        animationDelay: `${delay}ms`,
        paddingBottom: `calc(${thickness} + 2px)`,
        ['--trickle-underline-thickness' as string]: thickness
      } as CSSProperties}
    >
      {children}
    </RenderComponent>
  );
}
