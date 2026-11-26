import {config, mix, svg} from './common.js';

export const presets = ['height-1','height-2','height-3','height-4','height-5','contact','edge','ring'];
export const uses = ['floating product window','dialog','menu'];
export const knobs = {amount:[0,1,.5]};

export function generate(options) {
  const {bg, accent, amount} = config(options);
  const preset = options.preset ?? 'height-2';
  const height = Number(preset.slice(-1)) || 2;
  const lift = height * height;
  const tint = mix(bg, '#050809', .86);
  const opacity = Math.round(14 + amount * 16);
  const face = '<rect x="44" y="30" width="232" height="105" rx="8" fill="'+bg+'"/>';
  let shadow, art;

  if (preset === 'edge') {
    const light = mix(bg, '#ffffff', .7);
    shadow = 'inset 0 1px 0 '+light;
    art = face+'<path d="M52 30.5h216" stroke="'+light+'"/>';
  } else if (preset === 'ring') {
    shadow = `0 0 0 2px ${accent}55, 0 0 6px ${accent}16`;
    art = `<defs><filter id="ring" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation="3"/></filter></defs><rect x="43" y="29" width="234" height="107" rx="9" fill="none" stroke="${accent}" stroke-opacity=".09" stroke-width="5" filter="url(#ring)"/><rect x="43" y="29" width="234" height="107" rx="9" fill="none" stroke="${accent}" stroke-opacity=".33" stroke-width="2"/>`+face;
  } else {
    // Offset, blur radius, spread and alpha byte drive both representations.
    const layers = preset === 'contact'
      ? [[8,9,-8,136], [20,26,-22,96]]
      : [[1,2,0,24], [height,height*3,-height,opacity], [lift,lift*2,-Math.round(lift*.55),opacity]];
    shadow = layers.map(([y,blur,spread,a]) =>
      `0 ${y}px ${blur}px ${spread}px ${tint}${a.toString(16).padStart(2,'0')}`).join(', ');
    art = layers.map(([y,blur,spread,a], i) =>
      `<defs><filter id="depth${i}" filterUnits="userSpaceOnUse" x="-70" y="-70" width="460" height="320"><feGaussianBlur stdDeviation="${blur/2}"/></filter></defs><rect x="${44-spread}" y="${30+y-spread}" width="${232+spread*2}" height="${105+spread*2}" rx="8" fill="${tint}" fill-opacity="${(a/255).toFixed(3)}" filter="url(#depth${i})"/>`).reverse().join('')+face;
  }
  return {
    css: `.ts-shadow { --object-shadow: ${shadow}; box-shadow: var(--object-shadow); }`,
    svg: svg(art),
  };
}
