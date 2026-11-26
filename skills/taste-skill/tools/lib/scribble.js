import {config,uri,svg} from './common.js';

export const presets=['underline','circle','arrow','bracket','tick','star','highlight'];
export const uses=['word emphasis','margin annotation','directional cue'];
export const knobs={wobble:[0,1,.52],weight:[1,5,2.5]};
export const choices={draw:['still','on']};
// Each contour is a continuous pen movement. The last points preserve the lift-off.
const strokes={
  underline:{box:[200,23],paths:[[[5,15],[40,11],[86,9],[137,7],[172,9],[195,6]]]},
  circle:{box:[208,69],paths:[[[168,10],[113,5],[53,9],[15,21],[7,39],[35,54],[91,62],[152,59],[190,47],[202,31],[186,17],[149,10]]]},
  arrow:{box:[134,68],paths:[[[6,55],[34,50],[63,37],[91,21],[121,14]],[[103,9],[124,13],[112,30]]]},
  bracket:{box:[33,87],paths:[[[27,6],[12,11],[10,34],[9,60],[11,75],[29,80]]]},
  tick:{box:[64,55],paths:[[[6,29],[17,38],[24,46],[37,26],[57,7]]]},
  star:{box:[67,67],paths:[[[31,6],[40,49],[8,25],[60,20],[17,58],[31,6]]]},
  highlight:{box:[207,32],paths:[[[10,19],[44,16],[91,17],[139,14],[194,15]]]},
};
const round=n=>Number(n.toFixed(2));
function pen(points,rng,wobble,tension){
  const pts=points.map(([x,y])=>[x+(rng()-.5)*wobble*4,y+(rng()-.5)*wobble*4]);
  let d='M'+pts[0].map(round).join(' ');
  for(let i=1;i<pts.length;i++){
    const a=pts[i-1],b=pts[i],prev=pts[Math.max(0,i-2)],next=pts[Math.min(pts.length-1,i+1)];
    d+='C'+[a.map((v,j)=>v+(b[j]-prev[j])*tension),b.map((v,j)=>v-(next[j]-a[j])*tension),b].flat().map(round).join(' ');
  }
  return d;
}
export function generate(options={}){
  const {preset='underline',draw='still',weight=2.5,wobble=.52}=options;
  if(!presets.includes(preset)||!choices.draw.includes(draw))throw Error('Unknown mark setting.');
  const {accent,rng}=config(options),spec=strokes[preset],marker=preset==='highlight';
  const soft=['circle','underline','highlight'].includes(preset);
  const paths=spec.paths.map(points=>{
    const path=pen(points,rng,Number(wobble),soft?.14:.035);
    return `<path d="${path}"${draw==='on'?' data-m-draw="" pathLength="1"':''}/>`;
  }).join('');
  const body=`<g fill="none" stroke="${accent}" stroke-width="${marker?13+Number(weight):Number(weight)*(preset==='underline'?1.65:preset==='star'?1.18:1)}" stroke-linecap="${marker?'square':'round'}" stroke-linejoin="round"${marker?' opacity=".32"':''}>${paths}</g>`;
  const art=svg(body,'0 0 '+spec.box.join(' ')).replace('<svg ','<svg aria-hidden="true" ');
  const placement={
    underline:'left: -2%; bottom: -.19em; width: 104%; height: .25em',
    circle:'inset: -.16em -15%; width: 130%; height: 136%',
    arrow:'left: 104%; bottom: .5em; width: 2em; height: 1em',
    bracket:'right: 102%; top: -.08em; width: .48em; height: 118%',
    tick:'left: 103%; top: .07em; width: .92em; height: .82em',
    star:'left: 103%; top: -.32em; width: .85em; height: .85em',
    highlight:'left: -4%; bottom: .01em; width: 108%; height: .95em; z-index: -1',
  }[preset];
  const css=`.ts-scribble { position: relative; isolation: isolate; display: inline-block; }\n.ts-scribble::after { content: ""; pointer-events: none; position: absolute; ${placement}; background: url("${uri(art)}") center / 100% 100% no-repeat; }`;
  return {css,svg:art};
}
