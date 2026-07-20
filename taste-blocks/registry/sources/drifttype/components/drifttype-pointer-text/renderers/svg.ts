import type { PathLayoutResult, MeasureFn, CharMetrics } from '../core/types.js';

// ---- Text measurement via offscreen canvas ----

/**
 * Create a MeasureFn from a CSS font string using an offscreen canvas.
 * This is the bridge between the pure layout engine and the DOM.
 */
export function createCanvasMeasure(font: string): MeasureFn {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = font;

  // Cache measurements — same character always has the same metrics
  const cache = new Map<string, CharMetrics>();

  return (char: string, _index: number): CharMetrics => {
    const cached = cache.get(char);
    if (cached) return cached;

    const tm = ctx.measureText(char);
    const metrics: CharMetrics = {
      width: tm.width,
      height: (tm.actualBoundingBoxAscent ?? 0) + (tm.actualBoundingBoxDescent ?? 0) || parseFloat(font) || 16,
    };
    cache.set(char, metrics);
    return metrics;
  };
}

// ---- SVG namespace ----

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
  return document.createElementNS(SVG_NS, tag);
}

// ---- SVG renderer ----

export interface SvgRenderOptions {
  /** CSS font string applied to the <text> elements */
  font: string;
  /** Fill color. Default "currentColor". */
  fill?: string;
  /** Whether to include the raw path as a visible <path> element (debug). Default false. */
  debugPath?: boolean;
  /** SVG path data string — only needed if debugPath is true */
  pathData?: string;
}

/**
 * Render a PathLayoutResult into an SVG group element (<g>).
 * Returns the <g> — caller appends it wherever they want.
 */
export function renderSvgGroup(layout: PathLayoutResult, options: SvgRenderOptions): SVGGElement {
  const g = svgEl('g');
  g.setAttribute('aria-hidden', 'true');

  if (options.debugPath && options.pathData) {
    const path = svgEl('path');
    path.setAttribute('d', options.pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(255,255,255,0.15)');
    path.setAttribute('stroke-width', '1');
    g.appendChild(path);
  }

  const fill = options.fill ?? 'currentColor';

  for (const glyph of layout.glyphs) {
    // Skip whitespace — no visible glyph needed
    if (glyph.char.trim() === '') continue;

    const text = svgEl('text');
    text.setAttribute('font', options.font);
    text.setAttribute('fill', fill);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute(
      'transform',
      `translate(${glyph.position.x}, ${glyph.position.y}) rotate(${(glyph.angle * 180) / Math.PI})`,
    );
    text.textContent = glyph.char;
    g.appendChild(text);
  }

  return g;
}

/**
 * Render into an existing SVG element, clearing previous content.
 */
export function renderToSvg(svg: SVGSVGElement, layout: PathLayoutResult, options: SvgRenderOptions): void {
  // Remove previous drifttype output
  const existing = svg.querySelector('[data-drifttype]');
  if (existing) existing.remove();

  const g = renderSvgGroup(layout, options);
  g.setAttribute('data-drifttype', '');
  svg.appendChild(g);
}

/**
 * Update an existing rendered group in-place.
 * More efficient than re-rendering — reuses DOM nodes when possible.
 */
export function updateSvgGroup(g: SVGGElement, layout: PathLayoutResult, options: SvgRenderOptions): void {
  const textNodes = g.querySelectorAll('text');
  const visibleGlyphs = layout.glyphs.filter((gl) => gl.char.trim() !== '');

  // If glyph count changed, just re-render
  if (textNodes.length !== visibleGlyphs.length) {
    g.innerHTML = '';
    const fresh = renderSvgGroup(layout, options);
    while (fresh.firstChild) {
      g.appendChild(fresh.firstChild);
    }
    return;
  }

  // Update transforms in place
  for (let i = 0; i < visibleGlyphs.length; i++) {
    const glyph = visibleGlyphs[i]!;
    const node = textNodes[i]!;
    node.setAttribute(
      'transform',
      `translate(${glyph.position.x}, ${glyph.position.y}) rotate(${(glyph.angle * 180) / Math.PI})`,
    );
    if (node.textContent !== glyph.char) {
      node.textContent = glyph.char;
    }
  }
}
