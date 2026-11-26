import {svg,uri,mix} from './common.js';
import {generate as shadow, contactLayers} from './shadow.js';

export const presets=['browser','phone','tablet','laptop','terminal'];
export const uses=['product screenshot','app walkthrough','command transcript'];
export const knobs={};
export const choices={theme:['light','dark'],address:['shown','hidden']};

// Body dimensions, corner radius, inset and title bar, in one coordinate system.
const frames={
  browser:[640,416,12,2,40], phone:[216,450,34,9,0],
  tablet:[440,320,19,9,0], laptop:[544,344,12,8,0], terminal:[600,354,10,2,33],
};

export function generate(options={}) {
  const {preset='browser',theme='light',address='shown'}=options;
  if(!Object.hasOwn(frames,preset)||!choices.theme.includes(theme)||!choices.address.includes(address))throw Error('Unknown device setting.');
  const [w,h,r,inset,bar]=frames[preset];
  const dark=theme==='dark', hardware=['phone','tablet','laptop'].includes(preset);
  const edge=hardware?(dark?'#62666a':'#404549'):dark?'#45474c':'#bbbfc3';
  const shell=hardware?'#17191b':dark?'#23262a':preset==='terminal'?'#d9ddde':'#f4f5f5';
  const detail=dark?'#979da3':'#767d81';
  const screen=preset==='terminal'?'#171a1c':dark?'#1c2023':'#ffffff';
  const base=preset==='laptop'?28:0, W=w+base*2,H=h+(base?14:0);
  const x=base+inset,y=inset+bar,sw=w-2*inset,sh=h-y-inset,sr=r-inset;
  const rect=(x,y,w,h,r,fill)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
  let art=rect(base,0,w,h,r,edge)+rect(base+1,1,w-2,h-2,r-1,shell);
  if(preset==='phone')art+=rect(w/2-14,3,28,2.3,1.15,'#767b7d');
  if(preset==='tablet')art+='<circle cx="'+(w/2)+'" cy="4.5" r="1.65" fill="#73797c"/>';
  if(bar){
    const cy=(bar+inset)/2;
    art+=[0,1,2].map(i=>`<circle cx="${17+i*11}" cy="${cy}" r="3" fill="${detail}"/>`).join('');
    if(preset==='browser' && address==='shown'){
      art+=rect(132,8,w-264,25,5,dark?'#34373b':'#e3e6e7');
      art+=`<path d="M146 19h7v6h-7z M147.5 19v-2a2 2 0 014 0v2" fill="none" stroke="${detail}" stroke-width="1.2"/>`;
    }
    if(preset==='terminal')art+=`<text x="300" y="22" text-anchor="middle" font-family="system-ui,sans-serif" font-size="15" fill="${dark?'#d4d8da':'#41484c'}">Terminal</text>`;
  }
  if(base)art+=`<path d="M1 ${h}h${W-2}q-1 13-25 13H26Q4 ${h+13} 1 ${h}Z" fill="#8c9194"/><path d="M${W/2-35} ${h}h70q-2 4-7 4h-56q-5 0-7-4Z" fill="#555b5f"/>`;
  const upper=bar?0:sr;
  const aperture=`M${x+upper} ${y}H${x+sw-upper}q${upper} 0 ${upper} ${upper}v${sh-upper-sr}q0 ${sr} -${sr} ${sr}H${x+sr}q-${sr} 0 -${sr} -${sr}V${y+upper}q0 -${upper} ${upper} -${upper}Z`;
  const opening=`<path d="${aperture}" fill="${screen}"/>`;
  const shellSvg=svg(art+opening,'0 0 '+W+' '+H).replace('preserveAspectRatio="none"','aria-hidden="true"');
  const slot=`<defs><clipPath id="screen"><path d="${aperture}"/></clipPath></defs><g clip-path="url(#screen)"><svg data-device-screen="" x="${x}" y="${y}" width="${sw}" height="${sh}" viewBox="0 0 ${sw} ${sh}"><!-- Insert screen artwork here. --></svg></g>`;
  const tint=mix(options.palette?.bg??'#f5f3ee','#050809',.86);
  const shadows=contactLayers().map(([dy,blur,spread,alpha],i)=>{
    const filter='<filter id="contact'+i+'" x="-50%" y="-50%" width="200%" height="210%"><feGaussianBlur stdDeviation="'+blur/2+'"/></filter>';
    return '<defs>'+filter+'</defs><g opacity="'+(alpha/255).toFixed(3)+'" filter="url(#contact'+i+')">'+rect(base-spread,dy-spread,w+2*spread,h+2*spread,r,tint)+'</g>';
  }).reverse().join('');
  const still=svg(shadows+art+opening+slot,'-14 -6 '+(W+28)+' '+(H+29)).replace('preserveAspectRatio="none"','role="img" aria-label="'+preset+' frame"');
  const pc=(v,total)=>(100*v/total).toFixed(4)+'%';
  const depth=shadow({...options,preset:'contact'}).css.match(/--object-shadow: ([^;]+)/)[1];
  const css=`.ts-device { position: relative; display: block; width: min(100%, ${W}px); aspect-ratio: ${W} / ${H}; margin: 0; isolation: isolate; }
.ts-device::before { content: ""; position: absolute; inset: 0 ${pc(base,W)} ${pc(H-h,H)}; border-radius: ${pc(r,w)} / ${pc(r,h)}; box-shadow: ${depth}; z-index: -2; }
.ts-device::after { content: ""; position: absolute; inset: 0; z-index: -1; background: url("${uri(shellSvg)}") center / contain no-repeat; }
.ts-device > .device-screen { position: absolute; box-sizing: border-box; overflow: hidden; left: ${pc(x,W)}; top: ${pc(y,H)}; width: ${pc(sw,W)}; height: ${pc(sh,H)}; border-radius: ${pc(upper,sw)} ${pc(upper,sw)} ${pc(sr,sw)} ${pc(sr,sw)} / ${pc(upper,sh)} ${pc(upper,sh)} ${pc(sr,sh)} ${pc(sr,sh)}; background: ${screen}; color: ${preset==='terminal'||dark?'#fafafa':'#22262a'}; }
.ts-device > .device-screen > :is(img,video) { display: block; width: 100%; height: 100%; object-fit: cover; }`;
  return {css,svg:still,html:'<figure class="ts-device"><div class="device-screen"><!-- Insert page content here. --></div></figure>',slot:{x,y,width:sw,height:sh,radius:sr,topRadius:upper},screen};
}
