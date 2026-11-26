import {config, rgb, svg} from './common.js';
import {png} from './tile.js';

export const presets = ['film','blue-noise','ordered','paper-fibre','halftone','colour-dither'];
export const uses = ['print specimen','closing band','picture placeholder'];
export const knobs = {amount:[0,1,.5]};
const bayer = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];

function blueNoise(size, random, density) {
  const dots = new Uint8Array(size * size);
  const crowding = Float64Array.from(dots, () => random() * .03);
  // Place the next dot in the least crowded spot. The kernel wraps across the tile.
  for (let n = 0; n < Math.round(dots.length*density); n++) {
    let best = 0;
    for (let i=1; i<crowding.length; i++) if (crowding[i]<crowding[best]) best=i;
    dots[best] = 1;
    crowding[best] = Infinity;
    const x = best % size, y = Math.floor(best/size);
    for (let dy=-3; dy<=3; dy++) for (let dx=-3; dx<=3; dx++) {
      const neighbour = ((y+dy+size)%size)*size + (x+dx+size)%size;
      crowding[neighbour] += Math.exp(-(dx*dx+dy*dy)/2.8);
    }
  }
  return dots;
}

export function generate(options) {
  const {bg, accent, rng, amount} = config(options);
  const preset = options.preset ?? 'film', size = 32;
  const field = Array.from({length:size*size}, rng);
  const phaseX = Math.floor(rng()*4), phaseY = Math.floor(rng()*4);
  const blue = preset === 'blue-noise' ? blueNoise(size,rng,.22+amount*.3) : null;
  const coloured = preset === 'colour-dither';
  const colours = coloured ? [rgb(bg),rgb(accent)] : [[0,0,0],[255,255,255]];
  const alpha = coloured ? 255 : Math.round(2+amount*16);
  const tile = png(size, colours, [alpha,alpha], (x,y) => {
    const value = field[y*size+x];
    const threshold = bayer[((y+phaseY)%4)*4+(x+phaseX)%4]/16;
    if (coloured) return +(threshold < .02+amount*.20);
    if (preset === 'ordered') return +(threshold < .10+amount*.62);
    if (blue) return blue[y*size+x];
    if (preset === 'paper-fibre') return +(value*.25+field[y*size+(x>>2)]*.75 > .5);
    if (preset === 'halftone') return +(Math.hypot((x+phaseX)%4-1.5,(y+phaseY)%4-1.5)>1+amount);
    return +(value>.5);
  });
  const art = svg(`<defs><pattern id="grain" width="32" height="32" patternUnits="userSpaceOnUse"><image href="${tile}" width="32" height="32"/></pattern></defs><rect width="100%" height="100%" fill="${bg}"/><rect width="100%" height="100%" fill="url(#grain)"/>`);
  return {uri:tile, css:`.ts-grain { --grain-ground: ${bg}; background: url("${tile}") repeat var(--grain-ground); }`, svg:art};
}
