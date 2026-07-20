"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { initPointerLayout, stepPointerLayout, isAtRest } from '../core/pointer.js';
import { createCanvasMeasure } from '../renderers/svg.js';
import { mountSemantic } from '../a11y/semantic.js';
import type { SemanticTag } from '../a11y/semantic.js';
import type { PointerMode, PointerLayoutState } from '../core/types.js';

export interface PointerTextProps {
  children: string;
  font: string;
  mode: PointerMode;
  as?: SemanticTag;
  spacing?: number;
  radius?: number;
  strength?: number;
  fill?: string;
  /** Props forwarded to the visual <svg> element. */
  svgProps?: Omit<React.SVGAttributes<SVGSVGElement>, 'children' | 'viewBox'>;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

function settledState(state: PointerLayoutState): PointerLayoutState {
  return {
    ...state,
    pointer: null,
    glyphs: state.glyphs.map((glyph) => ({
      ...glyph,
      position: { ...glyph.base },
      velocity: { x: 0, y: 0 },
      angle: 0,
    })),
  };
}

export function PointerText({
  children,
  font,
  mode,
  as = 'span',
  spacing = 1.05,
  radius = 120,
  strength = 0.6,
  fill = 'currentColor',
  svgProps,
}: PointerTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const stateRef = useRef<ReturnType<typeof initPointerLayout> | null>(null);
  const animatingRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const interactiveRef = useRef(false);
  const textNodesRef = useRef<(SVGTextElement | null)[]>([]);
  const semanticRef = useRef<ReturnType<typeof mountSemantic> | null>(null);
  const viewBoxRef = useRef({ width: 1, height: 1 });
  const [viewBox, setViewBox] = useState('0 0 1 1');

  const updateNodes = useCallback(() => {
    const state = stateRef.current;
    if (!state) return;
    const nodes = textNodesRef.current;
    for (let i = 0; i < state.glyphs.length; i++) {
      const node = nodes[i];
      if (!node) continue;
      const glyph = state.glyphs[i]!;
      node.setAttribute(
        'transform',
        `translate(${glyph.position.x}, ${glyph.position.y}) rotate(${(glyph.angle * 180) / Math.PI})`,
      );
    }
  }, []);

  const stopLoop = useCallback(() => {
    animatingRef.current = false;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const settle = useCallback(() => {
    stopLoop();
    if (stateRef.current) {
      stateRef.current = settledState(stateRef.current);
      updateNodes();
    }
  }, [stopLoop, updateNodes]);

  const startLoop = useCallback(() => {
    if (animatingRef.current || !interactiveRef.current) return;
    animatingRef.current = true;
    let lastTime = performance.now();

    function tick(now: number) {
      frameRef.current = null;
      if (!animatingRef.current || !interactiveRef.current) {
        animatingRef.current = false;
        return;
      }

      const state = stateRef.current;
      if (!state) {
        animatingRef.current = false;
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const next = stepPointerLayout(state, state.pointer, radius, strength, dt);
      stateRef.current = next;
      updateNodes();

      if (!next.pointer && isAtRest(next)) {
        animatingRef.current = false;
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
  }, [radius, strength, updateNodes]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    semanticRef.current = mountSemantic(container, children, as);
    return () => {
      semanticRef.current?.destroy();
      semanticRef.current = null;
    };
  }, [as]);

  useEffect(() => {
    semanticRef.current?.update(children);
  }, [children]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const svgElement = svg;

    let disposed = false;
    let group: SVGGElement | null = null;
    stopLoop();

    function setup() {
      if (disposed) return;
      const measure = createCanvasMeasure(font);
      const state = initPointerLayout(children, measure, mode, spacing);
      const fontHeight = state.glyphs.reduce(
        (height, glyph) => Math.max(height, glyph.metrics.height),
        parseFloat(font) || 16,
      );
      const lastGlyph = state.glyphs[state.glyphs.length - 1];
      const textWidth = lastGlyph
        ? lastGlyph.position.x + lastGlyph.metrics.width / 2
        : fontHeight;
      const padding = Math.max(radius / 2, fontHeight);
      const width = Math.max(textWidth + padding * 2, 1);
      const height = Math.max(fontHeight + padding * 2, 1);

      for (const glyph of state.glyphs) {
        glyph.base = { x: glyph.base.x + padding, y: height / 2 };
        glyph.position = { ...glyph.base };
      }

      stateRef.current = state;
      viewBoxRef.current = { width, height };
      setViewBox(`0 0 ${width} ${height}`);

      group = document.createElementNS(SVG_NS, 'g');
      group.setAttribute('aria-hidden', 'true');
      svgElement.appendChild(group);

      const nodes: (SVGTextElement | null)[] = [];
      for (const glyph of state.glyphs) {
        if (glyph.char.trim() === '') {
          nodes.push(null);
          continue;
        }
        const text = document.createElementNS(SVG_NS, 'text') as SVGTextElement;
        text.setAttribute('fill', fill);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'central');
        text.style.font = font;
        text.textContent = glyph.char;
        text.setAttribute('transform', `translate(${glyph.position.x}, ${glyph.position.y})`);
        group.appendChild(text);
        nodes.push(text);
      }
      textNodesRef.current = nodes;
    }

    const fontReady = document.fonts?.load(font, children || ' ') ?? Promise.resolve([]);
    void fontReady.then(setup, setup);

    return () => {
      disposed = true;
      stopLoop();
      group?.remove();
      stateRef.current = null;
      textNodesRef.current = [];
    };
  }, [children, fill, font, mode, radius, spacing, stopLoop]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)');
    let onscreen = true;

    const updateInteraction = () => {
      interactiveRef.current =
        !document.hidden && onscreen && !reducedMotion.matches && !coarsePointer.matches;
      if (!interactiveRef.current) settle();
    };
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            onscreen = entry?.isIntersecting ?? false;
            updateInteraction();
          });

    reducedMotion.addEventListener('change', updateInteraction);
    coarsePointer.addEventListener('change', updateInteraction);
    document.addEventListener('visibilitychange', updateInteraction);
    observer?.observe(container);
    updateInteraction();

    return () => {
      reducedMotion.removeEventListener('change', updateInteraction);
      coarsePointer.removeEventListener('change', updateInteraction);
      document.removeEventListener('visibilitychange', updateInteraction);
      observer?.disconnect();
      interactiveRef.current = false;
      settle();
    };
  }, [settle]);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      svgProps?.onPointerMove?.(event);
      if (event.pointerType === 'touch') {
        settle();
        return;
      }

      const svg = svgRef.current;
      const state = stateRef.current;
      if (!svg || !state || !interactiveRef.current) return;
      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const { width, height } = viewBoxRef.current;
      stateRef.current = {
        ...state,
        pointer: {
          x: (event.clientX - rect.left) * (width / rect.width),
          y: (event.clientY - rect.top) * (height / rect.height),
        },
      };
      startLoop();
    },
    [settle, startLoop, svgProps],
  );

  const onPointerEnd = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      if (event.type === 'pointercancel') svgProps?.onPointerCancel?.(event);
      else svgProps?.onPointerLeave?.(event);
      const state = stateRef.current;
      if (state) stateRef.current = { ...state, pointer: null };
      startLoop();
    },
    [startLoop, svgProps],
  );

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <svg
        {...svgProps}
        ref={svgRef}
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        tabIndex={-1}
        preserveAspectRatio="xMidYMid meet"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerEnd}
        onPointerCancel={onPointerEnd}
        style={{ display: 'block', width: '100%', height: 'auto', ...svgProps?.style }}
      />
    </div>
  );
}
