import {blend} from './colour.js';
import {config} from './common.js';

export const presets=['sparkline','bars','stacked-bar','area','donut','progress-ring','range-bar','heat-strip','dot-plot'];
export const uses=['route profile','usage readout','measured comparison'];
export const knobs={};

const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));
const coord=n=>Number(n.toFixed(2));
const fmt=n=>new Intl.NumberFormat('en-US',{maximumSignificantDigits:6}).format(n);
const line=(x,y,X,Y,stroke,width=1)=>`<path d="M${coord(x)} ${coord(y)}L${coord(X)} ${coord(Y)}" fill="none" stroke="${stroke}" stroke-width="${width}"/>`;
const dot=(x,y,r,color)=>`<circle cx="${coord(x)}" cy="${coord(y)}" r="${r}" fill="${color}"/>`;
const rect=(x,y,w,h,color)=>`<rect x="${coord(x)}" y="${coord(y)}" width="${coord(w)}" height="${coord(h)}" fill="${color}"/>`;
const txt=(x,y,s,anchor='start',size=13)=>`<text x="${coord(x)}" y="${coord(y)}" text-anchor="${anchor}" font-size="${size}">${esc(s)}</text>`;
const inputList=v=>Array.isArray(v)?v:typeof v==='string'?v.split(',').map(w=>w.trim()):[];

function read(options,preset){
  const raw=inputList(options.values);
  if(!raw.length||raw.some(v=>!['number','string'].includes(typeof v)||String(v).trim()===''||!Number.isFinite(Number(v))||Math.abs(Number(v))>1e12))
    throw Error('Supply finite numbers with --values or --data.');
  const values=raw.map(Number),labels=inputList(options.labels),unit=String(options.unit??'');
  if(labels.length && labels.length!==values.length)throw Error('Give one label per value.');
  if(labels.some(s=>typeof s!=='string'||s.length>24)||unit.length>8)throw Error('Use labels up to 24 characters and units up to 8.');
  const rows=['bars','dot-plot','donut','stacked-bar'].includes(preset);
  if(values.length>(rows?8:80))throw Error('Use at most '+(rows?8:80)+' values in this chart.');
  if(['range-bar','progress-ring'].includes(preset)&&values.length!==2)throw Error('Provide the two endpoints or used and capacity.');
  if(['sparkline','area'].includes(preset)&&values.length<2)throw Error('A trace needs at least two values.');
  if(['donut','stacked-bar','progress-ring'].includes(preset)&&(values.some(n=>n<0)||values.every(n=>n===0)))throw Error('Shares need nonnegative values and a positive total.');
  if(preset==='progress-ring'&&(values[1]<=0||values[0]>values[1]))throw Error('Usage must fit a positive capacity.');
  if(preset==='range-bar'&&values[0]>values[1])throw Error('Range endpoints must be in ascending order.');
  return {values,labels,unit};
}

export function generate(options={}){
  const preset=options.preset??presets[0];
  if(!presets.includes(preset))throw Error('Unknown chart type.');
  const {values:v,labels,unit}=read(options,preset),{bg,ink,accent}=config(options);
  const muted=options.palette?.muted??blend(ink,bg,.23),rule=blend(bg,ink,.18),wash=blend(bg,accent,.20);
  const n=v.length,total=v.reduce((a,b)=>a+b,0),min=Math.min(...v),max=Math.max(...v);
  const value=d=>fmt(d)+(unit?(unit==='%'?'':' ')+unit:'');
  const label=i=>labels[i]??String(i+1);
  const title=String(options.title??preset.replaceAll('-',' '));
  if(title.length>100)throw Error('Use a chart title under 101 characters.');
  const labelWidth=labels.length?Math.max(...labels.map(s=>s.length))*7.8:16;
  let width=Math.max(352,Math.ceil(labelWidth)+255);
  let height=138,marks='';
  const scale=(v,a,b,start,end)=>a===b?(start+end)/2:start+(v-a)/(b-a)*(end-start);
  if(preset==='sparkline'||preset==='area'){
    const lo=preset==='area'?Math.min(0,min):min,hi=preset==='area'?Math.max(0,max):max;
    const x=i=>scale(i,0,n-1,12,width-12),y=d=>scale(d,lo,hi,100,29);
    const path=v.map((d,i)=>(i?'L':'M')+coord(x(i))+' '+coord(y(d))).join('');
    if(preset==='area')marks+=`<path d="${path}V${coord(y(0))}H12Z" fill="${wash}"/>`;
    marks+=`<path d="${path}" fill="none" stroke="${accent}" stroke-width="2.8" stroke-linejoin="round"/>`;
    const peak=v.indexOf(max);
    marks+=dot(x(peak),y(max),3.8,accent)+txt(x(peak),y(max)-9,value(max),peak<n*.25?'start':peak>n*.75?'end':'middle');
    marks+=txt(12,128,labels[0]??value(v[0]))+txt(width-12,128,labels[n-1]??value(v[n-1]),'end');
  }else if(preset==='bars'||preset==='dot-plot'){
    height=12+n*28;
    const left=Math.max(26,Math.ceil(labelWidth)+16),numberWidth=Math.max(78,...v.map(d=>value(d).length*8+12));
    width=Math.max(width,left+140+numberWidth);
    const right=width-numberWidth;
    const x=d=>scale(d,Math.min(0,min),Math.max(0,max)||1,left,right),zero=x(0);
    marks+=line(zero,4,zero,height-6,rule);
    v.forEach((d,i)=>{
      const y=19+i*28,color=d===max?accent:blend(muted,bg,.24);
      marks+=txt(5,y+4,label(i))+txt(width-5,y+4,value(d),'end');
      if(preset==='bars')marks+=rect(Math.min(zero,x(d)),y-5,Math.abs(x(d)-zero),10,color);
      else marks+=line(left,y,right,y,rule)+dot(x(d),y,4.5,color);
    });
  }else if(preset==='donut'||preset==='stacked-bar'){
    const ring=preset==='donut',r=40;
    const textWidth=Math.max(64,...v.map((d,i)=>(label(i)+' · '+value(d)).length*7.4));
    width=ring?Math.ceil(2*textWidth+154):Math.ceil(textWidth+248);
    height=ring?Math.max(138,n*22+12):n*21+49;
    const cx=width/2,cy=height/2;
    const colours=v.map((_,i)=>i===0?accent:blend(muted,bg,.12+.58*i/n));
    let fraction=0;
    const anchors=[];
    v.forEach((d,i)=>{
      const from=fraction,part=d/total;fraction+=part;
      if(ring){
        const len=2*Math.PI*r;
        if(d>0)marks+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+colours[i]+'" stroke-width="13" stroke-dasharray="'+coord(part*len)+' '+coord(len)+'" stroke-dashoffset="'+coord(-from*len)+'" transform="rotate(-90 '+cx+' '+cy+')"/>';
        const angle=(from+part/2)*Math.PI*2-Math.PI/2;
        anchors.push({i,side:Math.cos(angle)<0?-1:1,x:cx+Math.cos(angle)*(r+7),y:cy+Math.sin(angle)*(r+7)});
      }else{
        const span=width-textWidth-38,x=8+from*span,mid=x+part*span/2,row=42+(n-i-1)*21;
        marks+=rect(x,8,part*span,15,colours[i])+line(mid,24,mid,row-4,rule)+line(mid,row-4,span+17,row-4,rule);
        marks+=txt(span+23,row,label(i)+' · '+value(d));
      }
    });
    if(ring)for(const side of [-1,1]){
      const points=anchors.filter(p=>p.side===side).sort((a,b)=>a.y-b.y);
      let previous=-20;
      points.forEach((p,index)=>{
        const row=Math.min(Math.max(p.y,previous+19,10),height-8-(points.length-index-1)*19);
        previous=row;
        const elbow=cx+side*(r+16),end=elbow+side*8;
        marks+=line(p.x,p.y,elbow,row,rule)+line(elbow,row,end,row,rule)+txt(end+side*4,row+4,label(p.i)+' · '+value(v[p.i]),side<0?'end':'start');
      });
    }
  }else if(preset==='progress-ring'){
    const fraction=v[0]/v[1],len=2*Math.PI*47;
    marks+=`<g fill="none" stroke-width="8"><circle cx="65" cy="67" r="47" stroke="${rule}"/><circle cx="65" cy="67" r="47" stroke="${accent}" stroke-dasharray="${coord(len*fraction)} ${coord(len)}" transform="rotate(-90 65 67)"/></g>`;
    marks+=txt(65,73,Number((fraction*100).toFixed(1))+'%','middle',18)+txt(138,62,(labels[0]??'Used')+' · '+value(v[0]))+txt(138,85,(labels[1]??'Capacity')+' · '+value(v[1]));
  }else if(preset==='range-bar'){
    const left=14,right=width-14;
    const domain=inputList(options.domain).map(Number);
    if(domain.length&&(domain.length!==2||!domain.every(Number.isFinite)||domain[0]>=domain[1]||domain[0]>min||domain[1]<max))throw Error('Range domain must contain both endpoints.');
    const [lo,hi]=domain.length?domain:[Math.min(min,0),Math.max(max,0)];
    const x=d=>scale(d,lo,hi,left,right),first=x(min),last=x(max);
    const anchor=x=>x<width*.32?'start':x>width*.68?'end':'middle';
    marks+=line(left,69,right,69,rule,2)+line(first,69,last,69,accent,4)+dot(first,69,5,accent);
    marks+=txt(first,48,(labels[0]?label(0)+' · ':'')+value(min),anchor(first));
    if(min!==max)marks+=dot(last,69,5,accent)+txt(last,97,(labels[1]?label(1)+' · ':'')+value(max),anchor(last));
  }else{
    const w=(width-20)/n;
    v.forEach((d,i)=>{marks+=rect(10+i*w,44,w-Math.min(2,w*.12),40,blend(wash,accent,scale(d,min,max,0,1)))});
    const at=i=>10+(i+.5)*w;
    const anchor=x=>x<width*.32?'start':x>width*.68?'end':'middle';
    for(const [d,top] of [[max,true],[min,false]]){
      const i=v.indexOf(d),x=at(i),text=(labels.length?label(i):top?'High':'Low')+' · '+value(d);
      marks+=line(x,top?35:86,x,top?43:94,muted)+txt(x,top?29:112,text,anchor(x));
    }
  }
  const desc=v.map((d,i)=>label(i)+': '+value(d)).join(', ');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><desc>${esc(desc)}</desc><g fill="${ink}" font-family="var(--font-text,system-ui),sans-serif" style="font-variant-numeric:tabular-nums">${marks}</g></svg>`;
  return {svg,css:'.ts-chart { display: block; width: 100%; height: auto; font-variant-numeric: tabular-nums; }'};
}
