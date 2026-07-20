/**
 * dom/overlay.ts — the SHARED accessibility/SEO overlay (RESEARCH §3 invariant;
 * CLAUDE.md rule 6). Every render tier (SVG here, WebGL/VF later) mounts through
 * this so the a11y/SEO/selection contract is implemented ONCE.
 *
 * Contract:
 *  - The ORIGINAL text stays in the DOM, moved into a "text layer" that is made
 *    VISUALLY HIDDEN but NOT removed from the accessibility tree: it keeps its
 *    box (in flow), stays selectable, and is read by screen readers / crawlers.
 *    We use `color: transparent` (glyphs invisible, box + selection + a11y
 *    intact) — deliberately NOT `display:none` and NOT `visibility:hidden`,
 *    both of which drop the node from a11y/selection.
 *  - The render layer (the caller's <svg>/<canvas>) is `aria-hidden="true"`,
 *    `pointer-events:none` and `user-select:none`, so selection, find-in-page
 *    and screen readers all target the real text underneath.
 *  - The host gets layout+paint containment and its own isolation so per-frame
 *    paints from the render layer stay scoped (no page-wide invalidation).
 *
 * Wrap policy (RESEARCH §5 risk 1; CLAUDE.md rule 7 — no per-frame reflow):
 *  - 'nowrap'  : force `white-space:nowrap` on the text layer so the line never
 *                wraps, at any stretch.
 *  - 'reserve' : reserve horizontal space for the MAX-stretch box up front
 *                (min-width = naturalWidth × maxStretchRatio) so following
 *                content does not reflow as the render layer stretches. Sized
 *                from the CONFIGURED max ratio (default 4.5).
 *
 * Reserve basis (`options.reserveBasis`, shared cross-tier toggle):
 *  - 'tier-capability' (default): reserve the widest box THIS tier can actually
 *    paint. For the overlay (SVG/WebGL) that IS `naturalWidth × maxStretchRatio`
 *    — these tiers can stretch to the configured max, so their tier capability
 *    equals the uniform basis and the two modes coincide here.
 *  - 'uniform': every tier reserves `naturalWidth × maxStretchRatio` for
 *    cross-tier visual consistency. Identical to 'tier-capability' for the
 *    overlay; the difference is only observable in the axis-bounded VF tier.
 *
 * DOM-injectable (`options.document`) so it runs under jsdom / SSR shims.
 */

export type WrapMode = 'nowrap' | 'reserve';

/**
 * How `wrap:'reserve'` sizes its reserved box, shared across all tiers.
 *  - 'tier-capability': reserve what THIS tier can paint (axis-bounded for VF,
 *    max-ratio for the overlay tiers).
 *  - 'uniform': every tier reserves `naturalWidth × maxStretchRatio`, even when
 *    a tier cannot reach that width (VF then leaves a permanent gap — the
 *    accepted tradeoff for cross-tier visual consistency).
 */
export type ReserveBasis = 'tier-capability' | 'uniform';

export interface OverlayOptions {
  /** Element whose text is being stretched. Its current text becomes the source. */
  host: HTMLElement;
  /** The render layer to overlay (an <svg> for the SVG tier). */
  renderLayer: SVGElement | HTMLElement;
  /** Override the source text (defaults to host.textContent). */
  text?: string;
  /** Wrap behavior. Default 'nowrap'. */
  wrap?: WrapMode;
  /** Max stretch ratio the render layer can reach — sizes `reserve`. Default 4.5. */
  maxStretchRatio?: number;
  /**
   * How `wrap:'reserve'` sizes the reserved box. Default 'tier-capability'.
   * For the overlay (Tiers 1/2) both bases resolve to `maxStretchRatio`, so the
   * value does not change the reserved width here — it is threaded through for a
   * uniform cross-tier option surface (the VF tier is where the two diverge).
   */
  reserveBasis?: ReserveBasis;
  /** Injectable document (jsdom / SSR). Defaults to host.ownerDocument. */
  document?: Document;
}

export interface Overlay {
  readonly host: HTMLElement;
  /** Visually-hidden, still-selectable, still-in-a11y-tree real text. */
  readonly textLayer: HTMLElement;
  readonly renderLayer: SVGElement | HTMLElement;
  readonly text: string;
  readonly wrap: WrapMode;
  /** Last measured natural (unstretched) width in px, or null before measure(). */
  readonly naturalWidth: number | null;
  /**
   * READ-phase work: measure the natural text width and (for 'reserve') apply
   * the reserved min-width. Idempotent; call inside `ticker.read`.
   */
  measure(): void;
  /** Restore the host to its original DOM + inline styles. Leaks nothing. */
  destroy(): void;
}

interface SavedStyle {
  el: HTMLElement | SVGElement;
  cssText: string;
}

function setStyles(el: HTMLElement | SVGElement, styles: Record<string, string>): void {
  for (const [k, v] of Object.entries(styles)) el.style.setProperty(k, v);
}

export function createOverlay(options: OverlayOptions): Overlay {
  const host = options.host;
  const doc = options.document ?? host.ownerDocument;
  if (!doc) throw new Error('createOverlay: no document available');
  const renderLayer = options.renderLayer;
  const wrap: WrapMode = options.wrap ?? 'nowrap';
  const maxStretchRatio = options.maxStretchRatio ?? 4.5;
  const reserveBasis: ReserveBasis = options.reserveBasis ?? 'tier-capability';
  const text = options.text ?? host.textContent ?? '';

  const saved: SavedStyle[] = [];
  const save = (el: HTMLElement | SVGElement): void => {
    saved.push({ el, cssText: el.getAttribute('style') ?? '' });
  };

  // --- host: containment + isolation + a positioning context for the layers.
  save(host);
  const hostPosition =
    doc.defaultView?.getComputedStyle(host).position ?? host.style.position ?? 'static';
  setStyles(host, {
    contain: 'layout paint',
    isolation: 'isolate',
  });
  if (hostPosition === 'static') host.style.setProperty('position', 'relative');

  // --- text layer: move the real text into it, keep it selectable + in a11y.
  const originalNodes: ChildNode[] = Array.from(host.childNodes);
  const textLayer = doc.createElement('span');
  textLayer.setAttribute('data-fontuccine', 'text');
  setStyles(textLayer, {
    color: 'transparent',
    // keep selection + caret usable on the invisible text
    '-webkit-user-select': 'text',
    'user-select': 'text',
    'white-space': wrap === 'nowrap' ? 'nowrap' : 'normal',
  });
  for (const n of originalNodes) textLayer.appendChild(n);
  host.appendChild(textLayer);

  // --- render layer: on top, inert to a11y + pointer + selection.
  save(renderLayer);
  renderLayer.setAttribute('aria-hidden', 'true');
  setStyles(renderLayer, {
    position: 'absolute',
    top: '0',
    left: '0',
    overflow: 'visible',
    'pointer-events': 'none',
    '-webkit-user-select': 'none',
    'user-select': 'none',
  });
  if (renderLayer.parentNode !== host) host.appendChild(renderLayer);

  let naturalWidth: number | null = null;

  function measure(): void {
    // READ ONLY. One getBoundingClientRect on the text layer.
    const w = textLayer.getBoundingClientRect().width;
    if (Number.isFinite(w) && w > 0) naturalWidth = w;
    if (wrap === 'reserve' && naturalWidth != null) {
      // Reserve the widest box the render layer can occupy at full stretch so
      // downstream layout never reflows mid-interaction. The SVG/WebGL tiers can
      // paint the full configured max ratio, so BOTH reserve bases resolve to
      // `maxStretchRatio` here (only the axis-bounded VF tier differs).
      const factor = reserveBasis === 'uniform' ? maxStretchRatio : maxStretchRatio;
      host.style.setProperty('min-width', `${naturalWidth * factor}px`);
    }
  }

  function destroy(): void {
    // Move the real text nodes back to the host, drop our layers.
    if (textLayer.parentNode === host) {
      for (const n of Array.from(textLayer.childNodes)) host.insertBefore(n, textLayer);
      host.removeChild(textLayer);
    }
    if (renderLayer.parentNode === host) host.removeChild(renderLayer);
    // Restore inline styles exactly.
    for (const s of saved) {
      if (s.cssText) s.el.setAttribute('style', s.cssText);
      else s.el.removeAttribute('style');
    }
    renderLayer.removeAttribute('aria-hidden');
  }

  return {
    host,
    textLayer,
    renderLayer,
    text,
    wrap,
    get naturalWidth() {
      return naturalWidth;
    },
    measure,
    destroy,
  };
}
