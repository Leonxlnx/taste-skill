/**  Convert color string from HSL, RGB, or hex to 0-to-1-range-RGBA array */
export function getShaderColorFromString(
  colorString: string | [number, number, number] | [number, number, number, number] | undefined
): [number, number, number, number] {
  // If the color string is already an array of 3 or 4 numbers, return it (with alpha=1 if needed)
  if (Array.isArray(colorString)) {
    if (colorString.length === 4) return colorString as [number, number, number, number];
    if (colorString.length === 3) return [...colorString, 1];
    return fallbackColor;
  }

  // If the color string is not a string, return the fallback
  if (typeof colorString !== 'string') {
    return fallbackColor;
  }

  let r: number,
    g: number,
    b: number,
    a = 1;
  if (colorString.startsWith('#')) {
    [r, g, b, a] = hexToRgba(colorString);
  } else if (colorString.startsWith('rgb')) {
    const rgba = parseRgba(colorString);
    if (rgba === null) return fallbackColor;
    [r, g, b, a] = rgba;
  } else if (colorString.startsWith('hsl')) {
    const hsla = parseHsla(colorString);
    if (hsla === null) return fallbackColor;
    [r, g, b, a] = hslaToRgba(hsla);
  } else {
    console.error('Unsupported color format', colorString);
    return fallbackColor;
  }

  return [clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1), clamp(a, 0, 1)];
}

/** Convert hex to RGBA (0 to 1 range) */
function hexToRgba(hex: string): [number, number, number, number] {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Expand shorthand hex (3-letter #rgb or 4-letter #rgba) by doubling each digit
  if (hex.length === 3 || hex.length === 4) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }
  // Expand six-letter hex to eight-letter (add full opacity if no alpha)
  if (hex.length === 6) {
    hex = hex + 'ff';
  }

  // Bail out on malformed hex (wrong length or non-hex characters) so callers
  // get the fallback color instead of NaN channels leaking into the shader.
  if (!/^[0-9a-f]{8}$/i.test(hex)) {
    console.warn('Invalid hex color');
    return fallbackColor;
  }

  // Parse the components
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const a = parseInt(hex.slice(6, 8), 16) / 255;

  return [r, g, b, a];
}

/** Parse RGBA string to RGBA (0 to 1 range), or null if unparseable */
function parseRgba(rgba: string): [number, number, number, number] | null {
  // Match both rgb and rgba patterns
  const match = rgba.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)$/i);
  if (!match) return null;

  return [
    parseInt(match[1] ?? '0') / 255,
    parseInt(match[2] ?? '0') / 255,
    parseInt(match[3] ?? '0') / 255,
    match[4] === undefined ? 1 : parseFloat(match[4]),
  ];
}

/** Parse HSLA string, or null if unparseable */
function parseHsla(hsla: string): [number, number, number, number] | null {
  const match = hsla.match(/^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i);
  if (!match) return null;

  return [
    parseInt(match[1] ?? '0'),
    parseInt(match[2] ?? '0'),
    parseInt(match[3] ?? '0'),
    match[4] === undefined ? 1 : parseFloat(match[4]),
  ];
}

/** Convert HSLA to RGBA (0 to 1 range) */
function hslaToRgba(hsla: [number, number, number, number]): [number, number, number, number] {
  const [h, s, l, a] = hsla;
  const hDecimal = h / 360;
  const sDecimal = s / 100;
  const lDecimal = l / 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = lDecimal; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = lDecimal < 0.5 ? lDecimal * (1 + sDecimal) : lDecimal + sDecimal - lDecimal * sDecimal;
    const p = 2 * lDecimal - q;
    r = hue2rgb(p, q, hDecimal + 1 / 3);
    g = hue2rgb(p, q, hDecimal);
    b = hue2rgb(p, q, hDecimal - 1 / 3);
  }

  return [r, g, b, a];
}

export const clamp = (n: number, min: number, max: number): number => Math.min(Math.max(n, min), max);

const fallbackColor = [0.5, 0.5, 0.5, 1] as [number, number, number, number];
