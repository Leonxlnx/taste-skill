/**
 * Semantic layer — keeps a hidden, accessible text node in sync
 * with the visual output so screen readers see real text.
 *
 * The visual element gets aria-hidden="true".
 * The semantic element is visually hidden but available to assistive tech.
 */

export type SemanticTag = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface SemanticHandle {
  /** Update the accessible text content */
  update(text: string): void;
  /** Remove the semantic node from the DOM */
  destroy(): void;
  /** The hidden element, in case the caller needs a reference */
  element: HTMLElement;
}

// Visually hidden but accessible — standard sr-only technique
const SR_STYLES: Partial<CSSStyleDeclaration> = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  // clip-path is the modern replacement for clip: rect(0,0,0,0)
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: '0',
};

/**
 * Mount a semantic text layer into a container.
 * Returns a handle to update or destroy it.
 */
export function mountSemantic(
  container: HTMLElement,
  text: string,
  tagName: SemanticTag = 'span',
): SemanticHandle {
  const el = document.createElement(tagName);
  Object.assign(el.style, SR_STYLES);
  el.textContent = text;

  container.appendChild(el);

  return {
    update(newText: string) {
      el.textContent = newText;
    },
    destroy() {
      el.remove();
    },
    element: el,
  };
}
