import { type ElementType, type CSSProperties } from 'react';
import { cn } from '../../lib/cn';

export interface HighlighterSegment {
  text: string;
  highlight?: boolean;
  /**
   * Highlight color as any CSS color value (e.g. `'rgb(254 243 199 / 0.7)'`,
   * `'oklch(80% 0.18 80 / 0.45)'`, `'#fef3c7'`). Overrides the component-level `color`.
   */
  color?: string;
  /** Extra Tailwind classes for this highlighted segment (does NOT control the highlight color). */
  highlightClassName?: string;
}

export interface HighlighterSweepProps {
  segments: HighlighterSegment[];
  /** Default highlight color (any CSS color). Per-segment `color` overrides this. */
  color?: string;
  /** Delay before the first highlight begins, in ms. */
  delay?: number;
  /** Interval between successive highlights, in ms. */
  interval?: number;
  /** Element tag to render. Defaults to `h1`. */
  as?: ElementType;
  className?: string;
  /** Extra classes applied to every highlighted segment. */
  highlightClassName?: string;
}

export function HighlighterSweep({
  segments,
  color,
  delay = 0,
  interval = 180,
  as: Component = 'h1',
  className,
  highlightClassName
}: HighlighterSweepProps) {
  const RenderComponent: any = Component;
  let highlightIdx = 0;
  return (
    <RenderComponent className={className}>
      {segments.map((seg, i) => {
        if (!seg.highlight) {
          return <span key={i}>{seg.text}</span>;
        }
        const idx = highlightIdx++;
        const segColor = seg.color ?? color;
        const style: CSSProperties = { animationDelay: `${delay + idx * interval}ms` };
        if (segColor) {
          (style as Record<string, string | number>)['--trickle-hl'] = segColor;
        }
        return (
          <span
            key={i}
            className={cn(
              'trickle-highlight-word animate-trickle-highlighter-sweep',
              seg.highlightClassName ?? highlightClassName
            )}
            style={style}
          >
            {seg.text}
          </span>
        );
      })}
    </RenderComponent>
  );
}
