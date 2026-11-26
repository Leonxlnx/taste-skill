import {hex,rgb} from './common.js';
// OKLab matrices convert between linear sRGB and the perceptual coordinates.
function lab(colour){
  const [r,g,b]=rgb(colour).map(v=>v<=10.31475?v/3294.6:((v/255+.055)/1.055)**2.4);
  const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b);
  const m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b);
  const s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];
}
function fromLab([L,a,b]){
  const l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,s=(L-.0894841775*a-1.291485548*b)**3;
  return hex([4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s].map(v=>255*(v<=.0031308?12.92*v:1.055*v**(1/2.4)-.055)));
}
export function blend(a,b,t){const first=lab(a),last=lab(b);return fromLab(first.map((v,i)=>v+(last[i]-v)*t))}
export function neighbour(colour,degrees){
  const [L,a,b]=lab(colour),angle=degrees*Math.PI/180;
  return fromLab([L,a*Math.cos(angle)-b*Math.sin(angle),a*Math.sin(angle)+b*Math.cos(angle)]);
}
