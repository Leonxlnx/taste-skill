import {config,uri,mix,svg} from './common.js';

export const presets=['corner-plus','crop','ruler','dotted','dashed','measure','registration'];
export const uses=['media crop','panel inset','measured drawing'];
export const knobs={weight:[.5,2,1],inset:[6,30,14]};
export const choices={edge:['top','bottom','left','right']};
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function generate(options={}){
  const {preset='corner-plus',edge='top'}=options;
  if(!presets.includes(preset)||!choices.edge.includes(edge))throw Error('Unknown frame setting.');
  const {bg,ink}=config(options);
  const muted=options.palette?.muted??mix(ink,bg,.30);
  const W=480,H=240,m=Number(options.inset??14),weight=Number(options.weight??1);
  const corners=[[m,m,1,1],[W-m,m,-1,1],[m,H-m,1,-1],[W-m,H-m,-1,-1]];
  const path=d=>`<path d="${d}" vector-effect="non-scaling-stroke"/>`;
  let marks='';
  if(['corner-plus','crop','registration'].includes(preset)){
    for(const [x,y,sx,sy] of corners){
      let shape;
      if(preset==='crop'){const arm=Math.min(11,m-1);shape=path(`M-${arm} 0H-2M0 -${arm}V-2`)}
      else if(preset==='corner-plus')shape=path('M-5 0H5M0 -5V5');
      else shape='<circle r="4.5" vector-effect="non-scaling-stroke"/>'+path('M-9 0H9M0 -9V9');
      marks+=`<g transform="translate(${x} ${y}) scale(${sx} ${sy})">${shape}</g>`;
    }
  }else if(preset==='dotted'||preset==='dashed'){
    const dot=preset==='dotted',dash=dot?'0.35 4':'5 5';
    marks=`<rect x="${m}" y="${m}" width="${W-2*m}" height="${H-2*m}" fill="none" stroke-width="${dot?Math.max(1,weight):weight}" stroke-dasharray="${dash}" stroke-linecap="${dot?'round':'butt'}" vector-effect="non-scaling-stroke"/>`;
  }else{
    const horizontal=edge==='top'||edge==='bottom';
    const length=(horizontal?W:H)-2*m;
    const transform={top:`translate(${m} ${m})`,bottom:`translate(${m} ${H-m}) scale(1 -1)`,left:`translate(${m} ${m}) rotate(90) scale(1 -1)`,right:`translate(${W-m} ${m}) rotate(90)`}[edge];
    if(preset==='ruler'){
      const divisions=Math.max(5,Math.round(length/50)*5);
      let ticks="";
      for(let i=0;i<=divisions;i++)ticks+=`M${(i*length/divisions).toFixed(2)} 0v${i%5===0?9:4}`;
      marks=path(ticks);
    }else marks=path(`M0 -4V4M0 0H${length}M${length} -4V4`);
    marks=`<g transform="${transform}">${marks}</g>`;
    if(preset==='measure'){
      const text=String(options.label??'Span');
      if(text.length>28)throw Error('Use a measurement label under 29 characters.');
      const x=horizontal?W/2:edge==='left'?m:W-m,y=horizontal?(edge==='top'?m:H-m):H/2;
      const angle=horizontal?0:-90;
      const font=Math.min(15,(length-12)/Math.max(1,text.length));
      const half=4+text.length*font*.37;
      marks+=`<g transform="translate(${x} ${y}) rotate(${angle})"><rect x="${-half}" y="-9" width="${2*half}" height="18" stroke="none" fill="${bg}"/><text fill="${muted}" stroke="none" text-anchor="middle" dominant-baseline="central" font-family="system-ui,sans-serif" font-size="${font}">${escape(text)}</text></g>`;
    }
  }
  const art=svg(`<g stroke="${muted}" fill="none" stroke-width="${weight}">${marks}</g>`,'0 0 '+W+' '+H);
  return {svg:art,css:`.ts-frame { position: relative; }\n.ts-frame::after { content: ""; pointer-events: none; position: absolute; inset: 0; background: url("${uri(art)}") center / 100% 100% no-repeat; }`};
}
