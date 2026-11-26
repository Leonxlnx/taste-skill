import {contours} from './contours.js';
import {config,mix,svg,background} from './common.js';
export const presets=['dots','grid','cross','isometric','hatch','contour','waves'];
export const uses=['diagram ground','section band','map inset'], knobs={amount:[0,1,.5]};
export function generate(o){
 const {bg,ink,muted=ink,rng,amount}=config(o), p=o.preset??'dots', c=mix(bg,muted,.12+amount*.24);
 const size=p==='contour'?80:24;
 const paths={grid:'M0 24V0H24',cross:'M10 12h4m-2 -2v4',isometric:'M0 0L24 12 0 24M0 0V24',hatch:'M-1 1L1 -1M0 24L24 0M23 25L25 23',waves:'M-12 12Q-6 5 0 12T12 12T24 12T36 12'};
 let d=paths[p]??'';
 if(p==='contour') d=contours(rng,size);
 const mark=p==='dots'?`<circle cx="12" cy="12" r="1" fill="${c}"/>`:`<path d="${d}" fill="none" stroke="${c}" stroke-width=".95"/>`;
 const fade=o.fade??'radial', tag=fade==='linear'?'linearGradient':'radialGradient';
 const art=svg(`<defs><pattern id="marks" patternUnits="userSpaceOnUse" width="${size}" height="${size}">${mark}</pattern><${tag} id="fall"><stop stop-color="white"/><stop offset="1" stop-color="black"/></${tag}><mask id="fade"><rect width="100%" height="100%" fill="url(#fall)"/></mask></defs><rect width="100%" height="100%" fill="${bg}"/><rect width="100%" height="100%" fill="url(#marks)" ${fade==='none'?'':'mask="url(#fade)"'}/>`);
 // Without a viewBox the tile spacing stays in CSS pixels on wide bands.
 return background('pattern',art.replace(' viewBox="0 0 320 180"',''));
}
