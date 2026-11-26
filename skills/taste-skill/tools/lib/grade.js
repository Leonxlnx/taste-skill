import {blend} from './colour.js';
import {rgb,config} from './common.js';

export const presets=['neutral-match','warm-film','cool','monochrome','duotone','soft-matte'];
export const uses=['photo essay','property gallery','product series'];
export const knobs={strength:[0,1,1],exposure:[-.5,.5,0]};
const rounded=n=>Number(n.toFixed(4));
const weights=[.2126,.7152,.0722];

// Each channel follows the same luminance ramp between two palette endpoints.
function duoMatrix(shadow,light,strength){
  const a=rgb(shadow),b=rgb(light);
  return [0,1,2].flatMap(i=>[
    ...weights.map((w,j)=>rounded((i===j?1-strength:0)+strength*(b[i]-a[i])*w/255)),
    0,rounded(strength*a[i]/255)
  ]).concat([0,0,0,1,0]).join(' ');
}

export function generate(options={}){
  const {preset='neutral-match',strength=1,exposure=0}=options;
  if(!presets.includes(preset))throw Error('Unknown photo grade.');
  const {ink,accent}=config(options);
  const s=Number(strength),ev=Number(exposure);
  const brightness=rounded(2**ev);
  const knob=(target)=>rounded(1+(target-1)*s);
  const treatments={
    'neutral-match':`saturate(${knob(.32)}) contrast(${knob(.85)})`,
    'warm-film':`saturate(${knob(.70)}) sepia(${rounded(.29*s)}) contrast(${knob(.94)})`,
    cool:`saturate(${knob(.86)}) contrast(${knob(.98)})`,
    monochrome:`grayscale(${s}) contrast(${knob(1.06)})`,
    'soft-matte':`saturate(${knob(.67)}) contrast(${knob(.73)}) brightness(${knob(1.045)})`,
  };
  // The endpoint ordering follows the picture luminance even on inverse pages.
  const l=c=>rgb(c).reduce((sum,v,i)=>sum+v*weights[i],0);
  const ends=[ink,accent].sort((a,b)=>l(a)-l(b));
  function endpoint(colour,target,limit,test){
    let result=colour;
    for(let step=1;test(l(result),limit)&&step<=50;step++)result=blend(colour,target,step/50);
    return result;
  }
  const low=endpoint(ends[0],'#121315',55,(a,b)=>a>b);
  const high=endpoint(ends[1],'#faf8f3',178,(a,b)=>a<b);
  const id='grade-'+preset+'-'+low.slice(1)+'-'+high.slice(1)+'-'+Math.round(s*100000);
  const matrix=preset==='cool'?
    [knob(.956),0,0,0,0,0,knob(.99),0,0,.005*s,0,0,knob(1.012),0,.02*s,0,0,0,1,0].map(rounded).join(' '):duoMatrix(low,high,s);
  const hasMatrix=preset==='duotone'||preset==='cool';
  const filter=`<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${matrix}"/></filter>`;
  const defs=hasMatrix?`<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" style="position:absolute"><defs>${filter}</defs></svg>`:'';
  const treatment=hasMatrix?'url(#'+id+') '+(treatments[preset]??''):treatments[preset];
  const css=`.ts-grade { --grade-exposure: ${brightness}; filter: brightness(var(--grade-exposure)) ${treatment}; }`;
  const stops=Array.from({length:9},(_,i)=>`<rect x="${i*40}" width="40" height="140" fill="${blend('#151719','#f4eedf',i/8)}"/>`).join('');
  // A portable tonal proof; browser previews apply the actual class to a photograph.
  const art=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 140" role="img" aria-label="Tonal proof for ${preset}"><defs>${hasMatrix?filter:''}</defs><g style="filter:brightness(${brightness}) ${treatment}">${stops}</g></svg>`;
  return {css,svg:art,defs};
}
