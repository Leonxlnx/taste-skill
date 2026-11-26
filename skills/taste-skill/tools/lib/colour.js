import {hex,rgb} from './common.js';
// OKLab matrices convert between linear sRGB and the perceptual coordinates.
function lab(colour){
  const [r,g,b]=rgb(colour).map(v=>v<=10.31475?v/3294.6:((v/255+.055)/1.055)**2.4);
  const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b);
  const m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b);
  const s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];
}
function channels([L,a,b]){
  const l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,s=(L-.0894841775*a-1.291485548*b)**3;
  return [4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s].map(v=>255*(v<=.0031308?12.92*v:1.055*v**(1/2.4)-.055));
}
export function blend(a,b,t){const first=lab(a),last=lab(b);return fromLab(first.map((v,i)=>v+(last[i]-v)*t))}
export function neighbour(colour,degrees){
  const [L,a,b]=lab(colour),angle=degrees*Math.PI/180;
  return fromLab([L,a*Math.cos(angle)-b*Math.sin(angle),a*Math.sin(angle)+b*Math.cos(angle)]);
}

function fromLab(value){return hex(channels(value))}
export function spectrum(accent,rich){
  const [,a,b]=lab(accent), start=Math.atan2(b,a);
  const levels=[.48,.58,.68,.81];
  if(Math.hypot(a,b)<.008)return levels.map(L=>fromLab([L,a*rich,b*rich]));
  return levels.map((L,i)=>{
    const h=start-i*29*Math.PI/180;
    const colour=c=>channels([L,c*Math.cos(h),c*Math.sin(h)]);
    let low=0,high=.45;
    for(let n=0;n<13;n++){
      const mid=(low+high)/2;
      if(colour(mid).every(v=>v>=0&&v<=255))low=mid;else high=mid;
    }
    return hex(colour(low*rich));
  });
}

export function oklch(colour) {
  const [lightness,a,b]=lab(colour);
  return [lightness,Math.hypot(a,b),Math.atan2(b,a)];
}

// Compress chroma at a fixed hue and lightness until the colour fits sRGB.
export function fromLch(lightness,chroma,hue) {
  const at=c=>channels([lightness,c*Math.cos(hue),c*Math.sin(hue)]);
  let lo=0,hi=chroma;
  if(at(hi).every(v=>v>=0&&v<=255))return hex(at(hi));
  for(let i=0;i<16;i++){
    const mid=(lo+hi)/2;
    if(at(mid).every(v=>v>=0&&v<=255))lo=mid;else hi=mid;
  }
  return hex(at(lo));
}
