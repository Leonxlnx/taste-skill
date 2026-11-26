import {config,svg,background} from './common.js';
export const presets=['curve','angle','wave','notch','torn','dotted','dashed','hairline','ornament'];
export const uses=['section transition','article break','footer rule'],knobs={amount:[0,1,.5]};
export function generate(o){
 const {bg,ink,rng,amount}=config(o),p=o.preset??'curve',h=4+amount*13, next=o.next??bg;
 const lines={curve:`Q215 ${4-h*.55} 320 18`,angle:`L320 ${18-h}`,wave:`C80 ${18-h*2} 220 ${18+h} 320 12`,notch:'H148l12 7 12-7H320'};
 let d=lines[p];
 if(p==='torn'){d='';for(let x=4;x<=320;x+=4)d+=`L${x} ${(18+rng()*h*.20).toFixed(1)}`}
 let body=d?`<path d="M0 18${d}V32H0Z" fill="${next}"/>`:`<path d="M0 16H320" stroke="${ink}" opacity=".32" stroke-linecap="round" stroke-dasharray="${p==='dotted'?'.1 5':'7 5'}"/>`;
 if(p==='hairline')body=`<defs><linearGradient id="rule"><stop stop-color="${ink}" stop-opacity="0"/><stop offset=".5" stop-color="${ink}" stop-opacity=".38"/><stop offset="1" stop-color="${ink}" stop-opacity="0"/></linearGradient></defs><rect y="16" width="320" height="1" fill="url(#rule)"/>`;
 if(p==='ornament')body=`<path d="M116 16h33m22 0h33m-48 0 4-4 4 4-4 4Z" fill="none" stroke="${ink}" opacity=".55"/>`;
 return background('divider',svg(body,'0 0 320 32'));
}
