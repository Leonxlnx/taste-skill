import {config, mix, contrast, svg} from './common.js';
import {generate as grain} from './grain.js';

export const presets = ['glass','frost','paper','metal','plastic','ink'];
export const uses = ['navigation over imagery','instrument panel','document sheet'];
export const knobs = {amount:[0,1,.5]};

export function generate(options) {
  const {bg, accent, ink, amount} = config(options);
  const preset = options.preset ?? 'glass';
  const translucent = preset === 'glass' || preset === 'frost';
  const polished = preset === 'ink' || preset === 'plastic';
  const tint = {frost:.13, metal:.09}[preset] ?? .035;
  let base = preset === 'ink' ? mix(bg, '#121918', .92) : mix(bg, accent, tint);
  const paperGrain = amount * (preset === 'paper' ? .6 : .18);
  const tile = polished ? null : grain({...options, preset:preset==='metal'?'paper-fibre':'film', amount:paperGrain}).uri;

  // Bound the ink against either extreme backdrop and both colours of the tile.
  function minimum(foreground) {
    const extremes = ['#000000','#ffffff'];
    const grainAlpha = tile ? Math.round(2+paperGrain*16)/255 : 0;
    const backdropAlpha = translucent ? 20/255 : 0;
    const ratios = [];
    for (const behind of extremes) for (const grainColour of extremes) {
      const composite = mix(base, behind, backdropAlpha);
      const top = polished ? mix(composite, foreground, 9/255) : composite;
      ratios.push(contrast(foreground, mix(top, grainColour, grainAlpha)));
    }
    return Math.min(...ratios);
  }
  let fg = ink;
  if (minimum(fg) < 7) fg = minimum('#ffffff') > minimum('#000000') ? '#ffffff' : '#000000';
  for (let i=0; i<60 && minimum(fg)<7; i++) base = mix(base, fg==='#ffffff'?'#000000':'#ffffff', .08);

  const texture = tile ? `url("${tile}")` : 'none';
  const sheen = polished ? `linear-gradient(114deg, transparent 12%, ${fg}09 67%, transparent)` : 'none';
  let css = `.ts-surface { --surface-ground: ${base}; --surface-ink: ${fg}; color: var(--surface-ink); background: ${texture}, ${sheen}, var(--surface-ground); }`;
  if (translucent) css += `\n@supports (backdrop-filter: blur(1px)) { .ts-surface { background-color: ${base}eb; backdrop-filter: blur(${preset==='glass'?12:20}px) saturate(1.12); box-shadow: inset 0 1px 0 #ffffff1a; } }`;

  const finish = tile
    ? `<pattern id="finish" patternUnits="userSpaceOnUse" width="32" height="32"><image width="32" height="32" href="${tile}"/></pattern>`
    : `<linearGradient id="finish" x1="0" y1=".1" x2="1" y2=".9"><stop offset=".12" stop-color="${fg}" stop-opacity="0"/><stop offset=".67" stop-color="${fg}" stop-opacity=".035"/><stop offset="1" stop-color="${fg}" stop-opacity="0"/></linearGradient>`;
  return {css, ratio:minimum(fg), svg:svg(`<defs>${finish}</defs><rect width="100%" height="100%" fill="${base}"/><rect width="100%" height="100%" fill="url(#finish)"/>`)};
}
