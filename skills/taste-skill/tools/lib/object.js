import {config,mix} from './common.js';

export const presets=['orbits','planes','wire-sphere','ribbon','floor-grid','nodes','arcs'];
export const uses=['abstract hero','chapter opener','publication cover'];
export const knobs={density:[0,1,.55]};
export const choices={motion:['still','drift']};
const tau=2*Math.PI;
const point=([x,y])=>Number(x.toFixed(1))+','+Number(y.toFixed(1));
const line=(points,color,weight=1)=>`<polyline points="${points.map(point).join(' ')}" stroke="${color}" stroke-width="${weight}" fill="none" stroke-linejoin="round"/>`;
const face=(points,color)=>`<polygon points="${points.map(point).join(' ')}" fill="${color}"/>`;
const sample=(n,fn)=>Array.from({length:n+1},(_,i)=>fn(i/n));
export function generate(options={}){
  const {preset='orbits',density=.55,motion='still'}=options;
  if(!presets.includes(preset)||!choices.motion.includes(motion))throw Error('Unknown object setting.');
  const {bg,ink,accent,rng}=config(options);
  const quiet=mix(ink,bg,.43),pale=mix(ink,bg,.72);
  const pitch=.28+.27*rng(),yaw=.45+.46*rng(),phase=tau*rng();
  const project=([x,y,z])=>{
    const u=x*Math.cos(yaw)-z*Math.sin(yaw),v=x*Math.sin(yaw)+z*Math.cos(yaw);
    return [184+u,113+y*Math.cos(pitch)-v*Math.sin(pitch),v*Math.cos(pitch)+y*Math.sin(pitch)];
  };
  const count=Math.round(4+Number(density)*5);
  let marks='';
  if(preset==='orbits'){
    for(let i=0;i<count;i++){
      const angle=phase+i*Math.PI/count,radius=67+i*2;
      const ring=sample(52,t=>{const a=t*tau;return project([radius*Math.cos(a),radius*Math.sin(a)*Math.cos(angle),radius*Math.sin(a)*Math.sin(angle)])});
      marks+=line(ring,i===count-1?accent:quiet,i===count-1?1.8:1);
    }
  }else if(preset==='planes'){
    for(let i=count-1;i>=0;i--){
      const h=(i-(count-1)/2)*10;
      const turn=(i-(count-1)/2)*.045;
      const corners=[[-66,-38],[63,-38],[63,39],[-66,39]].map(([x,z])=>
        project([x*Math.cos(turn)-z*Math.sin(turn),h,x*Math.sin(turn)+z*Math.cos(turn)]));
      marks+=face(corners,i===0?mix(accent,bg,.26):mix(ink,bg,.56+.28*i/count))+line([...corners,corners[0]],quiet,.8);
    }
  }else if(preset==='wire-sphere'){
    const sphere=(lon,lat)=>project([77*Math.cos(lat)*Math.cos(lon),77*Math.sin(lat),77*Math.cos(lat)*Math.sin(lon)]);
    const visible=(points,color)=>{
      let run=[];
      for(let i=0;i<points.length;i++){
        const p=points[i],prev=points[i-1];
        if(prev&&(prev[2]>=0)!==(p[2]>=0)){
          const t=prev[2]/(prev[2]-p[2]);
          run.push(prev.map((v,j)=>v+t*(p[j]-v)));
          if(p[2]<0){if(run.length>1)marks+=line(run,color);run=[]}
        }
        if(p[2]>=0)run.push(p);
      }
      if(run.length>1)marks+=line(run,color);
    };
    marks+='<circle cx="184" cy="113" r="77" fill="none" stroke="'+quiet+'"/>';
    for(let i=1;i<count;i++)visible(sample(68,t=>sphere(t*tau,-Math.PI/2+i*Math.PI/count)),i===Math.floor(count/2)?accent:quiet);
    for(let i=0;i<count*2;i++)visible(sample(30,t=>sphere(phase+i*Math.PI/count,(t-.5)*Math.PI)),quiet);
  }else if(preset==='ribbon'){
    const edge=(t,side)=>{const a=t*tau*1.12+phase;return [53+254*t,112+47*Math.sin(a)+side*20*Math.cos(a*.85),Math.sin(a)]};
    const strips=sample(44,t=>({front:edge(t,1),back:edge(t,-1)}));
    let group=[strips[0]];
    const side=s=>s.front[1]>=s.back[1];
    const paint=()=>{marks+=face([...group.map(s=>s.front),...group.map(s=>s.back).reverse()],side(group[Math.floor(group.length/2)])?accent:quiet)};
    for(let i=1;i<strips.length;i++){
      const a=strips[i-1],b=strips[i];
      if(side(a)!==side(b)){
        const da=a.front[1]-a.back[1],db=b.front[1]-b.back[1],t=da/(da-db);
        const tip=a.front.map((v,j)=>v+t*(b.front[j]-v)),cross={front:tip,back:tip};
        group.push(cross);paint();group=[cross];
      }
      group.push(b);
    }
    paint();
    marks+=line(strips.map(s=>s.front),ink,.85)+line(strips.map(s=>s.back),quiet,.8);
  }else if(preset==='floor-grid'){
    const horizon=65+14*rng(),vx=140+68*rng();
    const grid=(t,x)=>{const depth=1/(1+4*t);return [vx+(x-vx)*depth,horizon+126*depth]};
    for(let i=0;i<=count*2;i++){const x=24+i*(320/(count*2));marks+=line([grid(0,x),grid(1,x)],i===count?accent:pale)}
    for(let i=0;i<=count;i++)marks+=line([grid(i/count,24),grid(i/count,344)],quiet);
  }else if(preset==='nodes'){
    const nodes=[[184,113]];
    for(let i=0;i<count+4;i++){
      const a=phase+i*tau/(count+4),radius=42+rng()*48;
      nodes.push([184+1.42*radius*Math.cos(a),113+radius*Math.sin(a)]);
    }
    for(let i=1;i<nodes.length;i++){
      marks+=line([nodes[i],nodes[i===nodes.length-1?1:i+1]],quiet);
      if(i%2===1)marks+=line([nodes[i],nodes[0]],pale);
    }
    nodes.forEach(([x,y],i)=>{marks+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i===0?5:3}" fill="${i===0?accent:bg}" stroke="${i===0?accent:quiet}"/>`});
  }else{
    const start=-2.8+.4*rng(),sweep=4.1+.55*rng();
    for(let i=0;i<count;i++){
      const radius=23+i*69/(count-1);
      marks+=line(sample(48,t=>[184+radius*Math.cos(start+t*sweep),114+radius*Math.sin(start+t*sweep)]),i===count-2?accent:quiet,i===count-2?2:1.15);
    }
  }
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 368 226" aria-hidden="true"><g class="object-form">${marks}</g></svg>`;
  const base='.ts-object { position: relative; overflow: hidden; margin: 0; }\n.ts-object > svg { display: block; width: 100%; height: auto; }';
  const css=base+(motion==='drift'?`
@keyframes ts-object-drift { 0%, 100% { transform: translate(-2px, 1px) rotate(-2deg); } 50% { transform: translate(2px, -2px) rotate(2deg); } }
@media (min-width: 640px) and (prefers-reduced-motion: no-preference) {
  .ts-object[data-m-loop]:has(> .loop-pause) .object-form { transform-origin: 50% 50%; animation: ts-object-drift 56s ease-in-out infinite; }
  .ts-object:is(.is-m-off,.is-m-paused) .object-form { animation-play-state: paused !important; }
}`:'');
  return {svg,css,html:`<figure class="ts-object"${motion==='drift'?' data-m-loop=""':''}>${svg}</figure>`};
}
