import {forms, show} from './show.js';
import {config, mix, contrast, number, svg} from './common.js';
import {blend, neighbour} from './colour.js';
import {png} from './tile.js';

// Centre and two radii are percentages of the frame, independent of aspect ratio.
const fields = {
  shore:[72,110,85,50], corner:[105,-8,70,85], veil:[70,5,120,44],
  ember:[82,70,42,50], halo:[71,61,62,97], sheen:[105,58,115,46],
  mist:[90,96,110,90], cove:[39,116,118,78], sill:[75,105,150,28],
  vault:[55,-20,75,110],
};
export const showPresets = Object.keys(forms);
export const presets = Object.keys(fields);
export const uses = ['section ground','product panel','share image'];
export const knobs = {
  energy:[0,1,.68], spread:[.25,2,1], grain:[0,1,.35], vignette:[0,1,.18],
  focusX:[-25,125,75], focusY:[-25,125,70],
};
const zoneId = {none:0,left:1,top:2,centre:3};

// A conic gradient has no native SVG paint server. Only the illuminated arc
// needs wedges. The pivot follows the viewport and the angles stay in CSS pixels.
function angularWash(colour) {
  const paths=[];
  const point=degree=>{const a=degree*Math.PI/180;return [Math.round(12000*Math.sin(a)),Math.round(-12000*Math.cos(a))].join(' ')};
  for(let degree=252; degree<324; degree+=1.5) {
    const weight=1-Math.abs(degree+.75-288)/36;
    paths.push(`<path d="M0 0L${point(degree)} ${point(degree+1.5)}Z" fill-opacity="${(.12*weight).toFixed(4)}"/>`);
  }
  return `<svg x="108%" y="110%" width="1" height="1" overflow="visible" fill="${colour}">${paths.join('')}</svg>`;
}
function svgStops(colours) {
  // SVG shares the CSS ramp by sampling its perceptual interpolation in sRGB.
  return colours.map(([end,colour],i) => {
    const [start,previous] = colours[i-1] ?? colours[0];
    const fractions = i ? [.25,.5,.75,1] : [1];
    return fractions.map(t => `<stop offset="${(start+(end-start)*t).toFixed(3)}" stop-color="${blend(previous,colour,t)}"/>`).join('');
  }).join('');
}

export function generate(options) {
  if (Object.hasOwn(forms,options.preset)) return show(options);
  const {bg,accent,ink,rng} = config(options);
  const [cx,cy,rx,ry] = fields[options.preset ?? 'shore'];
  const zone = options.zone ?? 'left';
  if (!Object.hasOwn(zoneId,zone)) throw Error('Unknown text zone '+zone);
  const alpha = Math.round(number(options.grain ?? .35,0,1)*3);
  const safeRatio = ground => Math.min(...['#ffffff','#000000'].map(c => contrast(ink,mix(ground,c,alpha/255))));
  const away = contrast(ink,'#ffffff') > contrast(ink,'#000000') ? '#ffffff' : '#000000';
  let base = bg;
  if (zone !== 'none') {
    for (let i=0; i<100 && safeRatio(base)<7; i++) base = mix(base,away,.15);
    if (safeRatio(base)<7) throw Error('Ink cannot reach 7:1. Choose a lighter or darker ink.');
  }
  const proposedX = zone==='left' && cx<45 ? 100-cx : cx;
  const x = Number(options.focusX ?? proposedX+(rng()-.5)*8);
  const y = Number(options.focusY ?? cy+(rng()-.5)*8);
  const spread = number(options.spread ?? 1,.25,2);
  const w = rx*spread, h = ry*spread;
  const bright = mix(bg,accent,number(options.energy ?? .68,0,1));
  const middle = blend(base,neighbour(bright,12),.58);
  const edge = mix(base,'#000000',number(options.vignette ?? .18,0,1)*.12);
  const colours = [[0,bright],[.4,middle],[.86,base],[1,edge]];
  const noise = png(24,[[0,0,0],[255,255,255]],[alpha,alpha],()=>+(rng()>.5));
  const focus = `ellipse ${w}% ${h}% at ${x.toFixed(2)}% ${y.toFixed(2)}%`;
  const ramp = `${bright}, ${middle} 40%, ${base} 86%, ${edge}`;

  const stops = zone==='centre' ? [[0,0],[.25,1],[.75,1],[1,0]] : [[0,1],[.38,1],[.78,0],[1,0]];
  const top = zone==='top';
  const coverStops = stops.map(([t,a]) => base+(a?'ff':'00')+' '+100*t+'%').join(', ');
  const cover = zone==='none' ? '' : `linear-gradient(${top?180:90}deg, ${coverStops}), `;
  const sweep = ['sheen','vault'].includes(options.preset);
  const sweepStops = `${bright}00 252deg, ${bright}1f 288deg, ${bright}00 324deg`;
  const angularLayer = space => sweep ? `conic-gradient(at 108% 110%${space}, ${sweepStops}), ` : '';
  const layers = `url("${noise}"), ${cover}`;
  const css = `.ts-gradient {
  --gradient-ink: ${ink};
  color: var(--gradient-ink);
  background-image: ${layers}${angularLayer('')}radial-gradient(${focus}, ${ramp});
  background-image: ${layers}${angularLayer(' in oklab')}radial-gradient(${focus} in oklab, ${ramp});
}`;

  const veil = zone==='none' ? '' : `<defs><linearGradient id="zone" x2="${top?0:1}" y2="${top?1:0}">${stops.map(([t,a])=>`<stop offset="${t}" stop-color="${base}" stop-opacity="${a}"/>`).join('')}</linearGradient></defs><rect width="100%" height="100%" fill="url(#zone)"/>`;
  const art = svg(`<defs><radialGradient id="light" cx="0" cy="0" r="1" gradientTransform="translate(${x/100} ${y/100}) scale(${w/100} ${h/100})">${svgStops(colours)}</radialGradient><pattern id="dust" width="24" height="24" patternUnits="userSpaceOnUse"><image href="${noise}" width="24" height="24"/></pattern></defs><rect width="100%" height="100%" fill="url(#light)"/>${sweep?angularWash(bright):''}${veil}<rect width="100%" height="100%" fill="url(#dust)"/>`).replace(' viewBox="0 0 320 180"',' width="100%" height="100%"');
  const packed = colour => parseInt(colour.slice(1),16);
  const settings = {field:1, sweep:Number(sweep), zone:zoneId[zone], base:packed(base), bright:packed(bright),
    edge:packed(edge), middle:packed(middle), x:x/100, y:y/100, w:w/100, h:h/100};
  return {css, svg:art, ratio:zone==='none'?null:safeRatio(base), settings};
}
