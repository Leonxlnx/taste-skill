import {marks} from './share-marks.js';
import {config,rgb} from './common.js';
import {blend} from './colour.js';
import {generate as pattern} from './pattern.js';

export const presets=['headline','panel','mark'];
export const uses=['link preview','site icon','publication card'];
export const knobs={};
export const choices={panel:['isometric','cross','waves']};
const xml=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const dotCentres=[[6.5,6.5],[17.5,6.5],[6.5,17.5]];
function markArt(mark,name){
  if(Object.hasOwn(marks,mark))return marks[mark];
  if(mark==='initial')return '<text x="12" y="18" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="650" font-size="18">'+xml(Array.from(name||'')[0]??'')+'</text>';
  if(typeof mark!=='string'||mark.length>3200||!/^\s*[Mm][\d\s.,+\-EeMmZzLlHhVvCcSsQqTtAa]+$/.test(mark))throw Error('Use a dealt mark name or the SVG path data of a 24 × 24 mark.');
  return '<path fill-rule="evenodd" d="'+mark+'"/>';
}
function stamp(mark,color,x,y,size,name){
  return `<g transform="translate(${x} ${y}) scale(${size/24})" fill="${color}">${markArt(mark,name)}</g>`;
}
function em(c){
  if(/\s/u.test(c))return .30;
  if(/[ilI.,'’!:;|]/u.test(c))return .31;
  if(/[mwMW@%&]/u.test(c))return .92;
  if(/[A-Z]/u.test(c))return .72;
  return c.codePointAt(0)>0x2ff?1.02:.58;
}
const measure=s=>Array.from(s).reduce((sum,c)=>sum+em(c),0);
function wrap(text,limit){
  const lines=[];let row='';
  for(const word of text.trim().split(/\s+/u)){
    const joined=row?row+' '+word:word;
    if(measure(joined)<=limit){row=joined;continue}
    if(row){lines.push(row);row=''}
    if(measure(word)<=limit){row=word;continue}
    for(const c of word){
      if(row&&measure(row+c)>limit){lines.push(row);row=''}
      row+=c;
    }
  }
  if(row)lines.push(row);
  // Share the last words between adjacent rows while keeping the original order.
  if(!text.split(/\s+/u).some(word=>measure(word)>limit)){
    for(let pass=0;pass<lines.length;pass++)for(let i=lines.length-1;i>0;i--){
      const words=lines[i-1].split(' ');if(words.length<2)continue;
      const last=words.pop(),first=words.join(' '),second=last+' '+lines[i];
      if(measure(second)<=limit && Math.abs(measure(first)-measure(second))<Math.abs(measure(lines[i-1])-measure(lines[i]))){
        lines[i-1]=first;lines[i]=second;
      }
    }
  }
  return lines;
}
export function icon(options={},size=32){
  const {bg,ink}=config(options);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><rect width="24" height="24" fill="${bg}"/><g fill="${ink}">${markArt(options.mark??'ring',options.name)}</g></svg>`;
}
export function rasterize(options={},size=0){
  const mark=options.mark??'ring';
  if(!['ring','dots'].includes(mark)||(!size&&options.preset!=='mark'))throw Error('Text and custom paths use the SVG. Export --format html and shoot the page at 1200 by 630.');
  const {bg,ink}=config(options),ground=rgb(bg),colour=rgb(ink);
  const width=size||1200,height=size||630,extent=size||320;
  const x0=(width-extent)/2,y0=(height-extent)/2,pixels=new Uint8Array(width*height*3);
  const contains=mark==='ring'?(x,y)=>{const d=(x-12)**2+(y-12)**2;return d<=100&&d>=20.25}:(x,y)=>{
    const dx=Math.max(14.5-x,0,x-20.5),dy=Math.max(14.5-y,0,y-20.5);
    return dx*dx+dy*dy<=2.25||dotCentres.some(([a,b])=>(a-x)**2+(b-y)**2<=20.25);
  };
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    let hits=0;
    if(x>=x0&&x<x0+extent&&y>=y0&&y<y0+extent){
      for(const dy of [.25,.75])for(const dx of [.25,.75])if(contains((x+dx-x0)*24/extent,(y+dy-y0)*24/extent))hits++;
    }
    const at=3*(y*width+x);
    for(let c=0;c<3;c++)pixels[at+c]=Math.round(ground[c]+(colour[c]-ground[c])*hits/4);
  }
  return {pixels,width,height};
}
export function generate(options={}){
  const {preset='headline',panel='isometric',mark='ring'}=options;
  const name=String(options.name??'').trim(),headline=String(options.headline??'').trim();
  if(!presets.includes(preset)||!choices.panel.includes(panel))throw Error('Unknown share layout.');
  if(!name||name.length>70||(!headline&&preset!=='mark')||headline.length>180)throw Error('Supply a page name (up to 70 characters) and a headline (up to 180).');
  const {bg,ink,accent}=config(options);
  let body=`<rect width="1200" height="630" fill="${bg}"/>`;
  if(preset==='mark')body+=stamp(mark,ink,440,155,320,name);
  else{
    const available=preset==='panel'?646:1032;
    if(preset==='panel'){
      const field=pattern({...options,preset:panel,fade:'none',amount:.65,palette:{bg:blend(bg,accent,.25),ink,accent,muted:accent}}).svg;
      body+='<svg x="766" y="28" width="406" height="574" viewBox="0 0 240 340" overflow="hidden">'+field+'</svg>';
    }
    body+=stamp(mark,ink,56,52,60,name);
    const nameSize=Math.min(38,Math.floor((available-48)/Math.max(1,measure(name))));
    body+=`<text x="132" y="97" font-size="${nameSize}" fill="${ink}">${xml(name)}</text>`;
    let size=preset==='panel'?82:92,lines=wrap(headline,available/size);
    while(size>32&&(lines.length>4||lines.length*size*1.06>381)){
      size-=2;lines=wrap(headline,available/size);
    }
    // Shorten the measure slightly when it can pull a stranded last word up.
    if(lines.length>2 && !lines.at(-1).includes(' ')){
      for(let candidate=size-2;candidate>=size*.84;candidate-=2){
        const next=wrap(headline,available/candidate);
        if(next.length<lines.length){size=candidate;lines=next;break}
      }
    }
    const top=551-(lines.length-1)*size*1.06;
    body+=lines.map((s,i)=>`<text x="54" y="${(top+i*size*1.06).toFixed(1)}" fill="${ink}" font-size="${size}" font-weight="550" letter-spacing="-.04em">${xml(s)}</text>`).join('');
  }
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${xml(name)}"><title>${xml(headline||name)}</title><g font-family="system-ui,sans-serif">${body}</g></svg>`;
  const html='<!doctype html><html lang="en"><meta charset="utf-8"><title>'+xml(name)+'</title><style>*{margin:0}body>svg{display:block}</style>'+svg+'</html>';
  return {svg,html,icon:icon(options),css:'.ts-share { display: block; width: 100%; height: auto; aspect-ratio: 1200 / 630; }'};
}
