import {config,svg,uri} from './common.js';
export const presets=['superellipse','arch','pill','blob','notch','ticket','stamp'];
export const uses=['portrait crop','product picture','avatar'],knobs={exponent:[.1,12,4]};
export function generate(o){
 const {rng,accent}=config(o), p=o.preset??'superellipse';
 const paths={arch:'M0 100V58C0 26 21 0 50 0s50 26 50 58v42Z',pill:'M30 0h40a30 50 0 0 1 0 100H30A30 50 0 0 1 30 0Z',notch:'M0 0H88L100 12V100H0Z',ticket:'M0 0H100V42a8 8 0 0 0 0 16v42H0V58a8 8 0 0 0 0-16Z'};
 let d=paths[p]??'';
 if(p==='stamp'){
   d='M0 0';for(const direction of [[1,0],[0,1],[-1,0],[0,-1]]){const [x,y]=direction;for(let i=0;i<10;i++)d+=`q${5*x-3*y} ${5*y+3*x} ${10*x} ${10*y}`}d+='Z';
 }else if(!d){
   const power=Number(o.exponent??4);
   if(!Number.isFinite(power)||power<=0)throw Error('Exponent must be positive and finite');
   const phase=rng()*6, exponent=2/power;
   for(let i=0;i<120;i++){const a=i*Math.PI/60,r=p==='blob'?42+4*Math.sin(3*a+phase)+3*Math.cos(2*a-phase):50;
     const f=v=>Math.abs(v)<1e-14?0:Math.sign(v)*Math.abs(v)**(p==='blob'?1:exponent);
     d+=(i?'L':'M')+(50+r*f(Math.cos(a))).toFixed(2)+' '+(50+r*f(Math.sin(a))).toFixed(2);
   }d+='Z';
 }
 const path=`<path d="${d}" fill="${accent}"/>`, art=svg(path,'0 0 100 100');
 return {path:d,svg:art,css:`.ts-shape { --shape: url("${uri(art)}"); mask: var(--shape) center / 100% 100% no-repeat; }`};
}
